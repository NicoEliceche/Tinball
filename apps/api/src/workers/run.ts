const publicUrl = process.env.API_PUBLIC_URL;
const workerSecret = process.env.WORKER_SECRET;

if (!publicUrl || !workerSecret) {
  throw new Error('API_PUBLIC_URL and WORKER_SECRET are required for the maintenance worker.');
}

const endpoint = new URL('/internal/workers/run', publicUrl);
if (process.env.NODE_ENV === 'production' && endpoint.protocol !== 'https:') {
  throw new Error('API_PUBLIC_URL must use HTTPS in production.');
}

const response = await fetch(endpoint, {
  method: 'POST',
  headers: { authorization: `Bearer ${workerSecret}` },
  signal: AbortSignal.timeout(30_000),
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Maintenance worker failed (${response.status}): ${body.slice(0, 500)}`);
}

console.log(await response.text());
