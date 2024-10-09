// index.js
//import './register-http.cjs';
import { api } from '@opentelemetry/sdk-node';
import http from 'node:http';

const span = api.trace.getTracer().startSpan('test');
const ctx = api.trace.setSpan(api.context.active(), span);

const server = http.Server((req, res) => {
    console.log('server', { heades: req.headers, span: api.trace.getActiveSpan().spanContext() });
    res.writeHead(204);
    res.end();
});
await new Promise(res => server.listen(8080).once('listening', res));

await api.context.with(ctx, async () => {
    console.log('client', { span: api.trace.getActiveSpan().spanContext() });
    await new Promise(resolve => {
        const req = http.request('http://localhost:8080/ping', (res) => {
            res.on('data', () => {});
            res.on('end', resolve);
        });
        req.end();
    });
});

process.kill(process.pid, 'SIGTERM');