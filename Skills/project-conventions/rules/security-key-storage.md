---
title: Almacenamiento seguro de claves y tokens — nunca en localStorage
impact: CRITICAL
impactDescription: Las private keys y auth tokens en localStorage son accesibles desde cualquier script XSS. Una sola inyección JS compromete todas las credenciales del usuario de forma permanente.
tags: security, localStorage, privateKey, crypto, tokens, WebCrypto, IndexedDB, XSS
---

## Almacenamiento seguro de claves y tokens

Los valores sensibles — private keys RSA, auth tokens, device tokens — **nunca** se almacenan en `localStorage`. localStorage es accesible desde cualquier script en la página: un ataque XSS extrae silenciosamente todas las claves.

---

**Incorrecto — problema actual en cryptoWeb.ts y AxiosClient.ts:**

```ts
// cryptoWeb.ts ❌
private async loadKeys(): Promise<void> {
  const storedPrivate = localStorage.getItem('private_key');   // ← private key expuesta
  const storedPublic  = localStorage.getItem('public_key');

  if (storedPrivate && storedPublic) {
    this.privateKey = storedPrivate;
    this.publicKey  = storedPublic;
  } else {
    await this.generateKeyPair();
    localStorage.setItem('private_key', this.privateKey);      // ← private key en texto plano
    localStorage.setItem('public_key',  this.publicKey);
  }
}

// AxiosClient.ts ❌
const token = localStorage.getItem("authToken");               // ← auth token expuesto
let deviceId = localStorage.getItem("device_id");             // ← device id expuesto
localStorage.setItem("device_id", deviceId);
```

---

**Correcto — claves RSA con Web Crypto API (non-extractable) + IndexedDB:**

```ts
// core/crypto/keyStorage.ts ✅
// La private key NUNCA existe como string en memoria JS.
// Se genera como CryptoKeyPair con extractable: false y se persiste en IndexedDB.

const DB_NAME   = 'app-keystore';
const KEY_STORE = 'rsa-keypair';

async function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(KEY_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export async function getOrCreateKeyPair(): Promise<CryptoKeyPair> {
  const db    = await openDb();
  const store = db.transaction(KEY_STORE, 'readonly').objectStore(KEY_STORE);

  const existing = await new Promise<CryptoKeyPair | undefined>((res, rej) => {
    const req = store.get('keypair');
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });

  if (existing) return existing;

  // Generar con extractable: false — la clave privada no puede ser exportada
  const keypair = await crypto.subtle.generateKey(
    { name: 'RSA-PSS', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    false,        // ← extractable: false es clave
    ['sign', 'verify'],
  );

  const write = db.transaction(KEY_STORE, 'readwrite').objectStore(KEY_STORE);
  await new Promise<void>((res, rej) => {
    const req = write.put(keypair, 'keypair');
    req.onsuccess = () => res();
    req.onerror   = () => rej(req.error);
  });

  return keypair;
}

// Firmar con la CryptoKey directamente — la private key nunca sale como string
export async function signMessage(message: string, privateKey: CryptoKey): Promise<string> {
  const encoded  = new TextEncoder().encode(message);
  const sigBytes = await crypto.subtle.sign(
    { name: 'RSA-PSS', saltLength: 32 },
    privateKey,
    encoded,
  );
  return btoa(String.fromCharCode(...new Uint8Array(sigBytes)));
}

// Exportar la public key en PEM para enviar al backend
export async function exportPublicKeyPem(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey);
  const b64      = btoa(String.fromCharCode(...new Uint8Array(exported)));
  return `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g)!.join('\n')}\n-----END PUBLIC KEY-----`;
}
```

**Auth tokens — httpOnly cookies (never localStorage):**

```ts
// ✅ El token de autenticación lo setea el backend como cookie httpOnly + Secure.
// El frontend NUNCA recibe ni almacena el token JWT directamente.
// En el interceptor, la cookie se envía automáticamente con cada request:

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,  // ← envía cookies httpOnly automáticamente
});
// No hay localStorage.getItem("authToken") en ningún lado.
```

**Device ID — sessionStorage como mínimo, preferir cookie de sesión:**

```ts
// ✅ Si el device_id no es un secreto y solo identifica el navegador,
// sessionStorage es preferible a localStorage (no persiste entre sesiones).
// Mejor aun: generarlo server-side y devolverlo en una cookie de sesión.

let deviceId = sessionStorage.getItem('device_id');
if (!deviceId) {
  deviceId = crypto.randomUUID();
  sessionStorage.setItem('device_id', deviceId);
}
```

---

**Reglas:**
- **NUNCA** `localStorage.setItem('private_key', ...)` ni `localStorage.setItem('public_key', ...)`
- Private keys RSA: usar Web Crypto API con `extractable: false`, persistir la `CryptoKey` en IndexedDB
- Auth tokens: httpOnly cookies seteadas por el backend + `withCredentials: true` en axios
- Device IDs no secretos: `sessionStorage` o cookie de sesión — nunca localStorage
- `localStorage` solo para preferencias UI sin impacto de seguridad (idioma, tema)

Reference: [OWASP — HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage)
