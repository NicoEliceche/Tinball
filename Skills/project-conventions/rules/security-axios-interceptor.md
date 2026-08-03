---
title: Interceptor Axios — firma dinámica en requests con x-authorization
impact: HIGH
impactDescription: Cada request autenticado lleva una firma criptográfica única (timestamp + nonce + path + method). Previene ataques de replay y garantiza integridad de la request.
tags: security, axios, interceptor, signature, request-signing, crypto, HMAC, replay-attack
---

## Interceptor Axios — firma dinámica en requests con x-authorization

Todo request que lleve `x-authorization` debe incluir una **firma dinámica** que vincule el contenido de la request al momento exacto y al dispositivo. La firma incluye: `device_id`, timestamp, path, método HTTP y un nonce aleatorio.

La firma estática (solo `{ device_id }`) es vulnerable a ataques de replay: la misma firma vale para cualquier request en cualquier momento.

---

**Incorrecto — firma estática (problema actual en AxiosClient.ts):**

```ts
// AxiosClient.ts ❌
if (token && config.url !== "/auth/login") {
  config.headers.set("x-authorization", token, true);

  // Firma solo con device_id — estática, reutilizable, sin tiempo ni contexto
  const message = JSON.stringify({ device_id: deviceId });
  const signature = await crypto.generateSignature(message);
  config.headers.set("signature", signature);

  // Sin timestamp → replay indefinido
  // Sin nonce → replay mientras la firma sea válida
  // Sin path/method → la misma firma vale para cualquier endpoint
}
```

---

**Correcto — firma dinámica con timestamp, nonce, path y método:**

```ts
// core/data/client/AxiosClient.ts ✅
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getOrCreateKeyPair, signMessage } from '@core/crypto/keyStorage';

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry412?: boolean;
  _skipRateLimit?: boolean;
}

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
  withCredentials: true,       // ← auth token via httpOnly cookie
  timeout: 60_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request interceptor ────────────────────────────────────────────────────────
client.interceptors.request.use(
  async (config) => {
    const xAuth = config.headers.get?.('x-authorization');

    if (xAuth) {
      let deviceId = sessionStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        sessionStorage.setItem('device_id', deviceId);
      }

      // Firma dinámica: device_id:timestamp:path:method:nonce
      const timestamp = Math.floor(Date.now() / 1000);
      const nonce     = Array.from(crypto.getRandomValues(new Uint8Array(32)))
                          .map(b => b.toString(16).padStart(2, '0')).join('');

      const rawUrl = config.url ?? '/';
      // Normalizar path: quitar host y query string
      const path   = rawUrl.replace(/^https?:\/\/[^/]+/, '').split('?')[0] || '/';
      const method = (config.method ?? 'GET').toUpperCase();

      const message   = `${deviceId}:${timestamp}:${path}:${method}:${nonce}`;
      const { privateKey } = await getOrCreateKeyPair();
      const signature = await signMessage(message, privateKey);

      config.headers.set('signature',           signature);
      config.headers.set('signature-timestamp', timestamp.toString());
      config.headers.set('signature-nonce',     nonce);
      config.headers.set('x-device-id',         deviceId);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ───────────────────────────────────────────────────────
client.interceptors.response.use(
  async (response: AxiosResponse) => {
    const { aes_key_encrypted, nonce, tag, ciphertext } = response.data ?? {};

    if (aes_key_encrypted && nonce && tag && ciphertext) {
      try {
        const { CryptoWeb } = await import('./cryptoWeb');
        const cryptoClient  = new CryptoWeb();
        await cryptoClient.init();

        const decrypted = await cryptoClient.aesRsaHybridDecrypt({
          aesKeyEncrypted: aes_key_encrypted,
          nonce,
          tag,
          ciphertext,
        });

        return { ...response, data: decrypted };
      } catch (decryptionError) {
        console.error('Decryption failed:', decryptionError);
        return response;
      }
    }

    return response;
  },
  async (error) => {
    const originalRequest: CustomAxiosRequestConfig = error.config;

    if (!error.response) return Promise.reject(error);

    const { status, data } = error.response;

    // 412: device no registrado en IoT — registrar y reintentar
    if (status === 412 && !originalRequest._retry412) {
      originalRequest._retry412 = true;

      let deviceId = sessionStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        sessionStorage.setItem('device_id', deviceId);
      }

      const { CryptoWeb } = await import('./cryptoWeb');
      const cryptoClient  = new CryptoWeb();
      await cryptoClient.init();

      // Nota: el registro del device es diferente en web vs mobile —
      // adaptar el payload según el contrato del backend web.
      await client.post(
        '/devices/registry',
        {
          device_id:    deviceId,
          device_name:  navigator.userAgent,
          public_key:   cryptoClient.getPublicKey(),
        },
        { _skipRateLimit: true } as CustomAxiosRequestConfig,
      );

      return client({ ...originalRequest, _skipRateLimit: true });
    }

    // 401: sesión expirada
    if (status === 401) {
      // Redirigir al login sin exponer información en la URL
      window.location.replace('/');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default client;
```

---

**Estructura de la firma:**

```
message = "{device_id}:{timestamp_unix}:{path}:{METHOD}:{nonce_hex_32bytes}"

Ejemplo:
"abc123:1747234567:/api/v1/payments:POST:4f9a2b..."

Headers resultantes:
  signature:           <base64 de RSA-PSS SHA-256 sobre el message>
  signature-timestamp: 1747234567
  signature-nonce:     4f9a2b...
  x-device-id:         abc123
```

---

**Reglas:**
- Todo request con `x-authorization` incluye `signature`, `signature-timestamp`, `signature-nonce` y `x-device-id`
- La firma cubre: `device_id:timestamp:path:method:nonce` — nunca solo `{ device_id }`
- El nonce es de 32 bytes aleatorios nuevos por cada request (`crypto.getRandomValues`)
- El timestamp es Unix seconds (`Math.floor(Date.now() / 1000)`)
- El path se normaliza quitando el host y la query string
- La private key que firma no es un string — es una `CryptoKey` con `extractable: false`
- El response interceptor descifra respuestas AES-GCM antes de devolver los datos
- 412 → registrar device y reintentar la request original
- 401 → redirigir a login con `window.location.replace('/')` (no `.href` — no genera history entry)

Reference: [OWASP — REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
