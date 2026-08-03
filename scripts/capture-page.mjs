import { mkdir, writeFile } from 'node:fs/promises';

const port = Number(process.argv[2] ?? 9222);
const outputDirectory = new URL('../artifacts/', import.meta.url);
const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
const target = targets.find((candidate) => candidate.type === 'page' && candidate.url.startsWith('http://127.0.0.1:4173'));
if (!target?.webSocketDebuggerUrl) throw new Error('No debuggable browser page found.');

const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
const diagnostics = [];
let sequence = 0;

await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

socket.addEventListener('message', (event) => {
  const message = JSON.parse(String(event.data));
  if (message.method === 'Runtime.exceptionThrown') diagnostics.push(message.params.exceptionDetails?.exception?.description ?? message.params.exceptionDetails?.text);
  if (message.method === 'Log.entryAdded') diagnostics.push(`${message.params.entry.level}: ${message.params.entry.text}`);
  if (!message.id) return;
  const handler = pending.get(message.id);
  if (!handler) return;
  pending.delete(message.id);
  if (message.error) handler.reject(new Error(message.error.message));
  else handler.resolve(message.result);
});

function call(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
await mkdir(outputDirectory, { recursive: true });
await call('Runtime.enable');
await call('Log.enable');

for (const viewport of [
  { name: 'mobile', width: 390, height: 844, mobile: true },
  { name: 'desktop', width: 1440, height: 1000, mobile: false },
]) {
  await call('Emulation.setDeviceMetricsOverride', { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: viewport.mobile });
  await call('Page.reload', { ignoreCache: true });
  await delay(10_000);
  const pageState = await call('Runtime.evaluate', {
    expression: `JSON.stringify({ title: document.title, text: document.body?.innerText ?? '', htmlLength: document.documentElement?.outerHTML.length ?? 0 })`,
    returnByValue: true,
  });
  process.stdout.write(`${viewport.name}: ${pageState.result.value}\n`);
  const screenshot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(new URL(`tinball-login-${viewport.name}.png`, outputDirectory), Buffer.from(screenshot.data, 'base64'));
}

if (diagnostics.length > 0) process.stdout.write(`diagnostics:\n${diagnostics.join('\n')}\n`);

socket.close();
