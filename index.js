import http from 'node:http';

export function startHealthServer({ port, getState }) {
  const server = http.createServer((request, response) => {
    if (request.url === '/healthz') {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ ok: true, ...getState() }));
      return;
    }

    response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Black Russia Virty Telegram Monitor is running. Use /healthz for status.');
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`[server] listening on 0.0.0.0:${port}`);
  });

  return server;
}
