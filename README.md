# Reproducer for https://github.com/open-telemetry/opentelemetry-js/issues/5024

### How to run:

(I am using Node.js v18.20.4)

- `npm ci`
- `node --import ./register.mjs ./index.mjs` 
  - (loader hook is registered register via `register()` from `node:module`)
- everything works fine - traceparent is on the header received by the server
- uncomment the lines in `register.mjs` after "uncommenting this will break propagation"
- server instrumentation still works - no traceparent is on the header received by the server, no client spans are created


### Relevant output (no Zipkin Exporter)

```
client {
  span: {
    traceId: '822b4472dbcb19af0a2938a761096361',
    spanId: '350bee678e23a125',
    traceFlags: 1,
    traceState: undefined
  }
}
server {
  heades: {
    traceparent: '00-822b4472dbcb19af0a2938a761096361-2f48f288684b2e4c-01',
    host: 'localhost:8080',
    connection: 'close'
  },
  span: {
    traceId: '822b4472dbcb19af0a2938a761096361',
    spanId: 'cd06491408d6a15b',
    traceFlags: 1,
    traceState: undefined
  }
}
{
  resource: {
    attributes: {
      'service.name': 'unknown_service:node',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': '1.26.0'
    }
  },
  instrumentationScope: {
    name: '@opentelemetry/instrumentation-http',
    version: '0.53.0',
    schemaUrl: undefined
  },
  traceId: '822b4472dbcb19af0a2938a761096361',
  parentId: '2f48f288684b2e4c',
  traceState: undefined,
  name: 'GET',
  id: 'cd06491408d6a15b',
  kind: 1,
  timestamp: 1728474096552000,
  duration: 4149.481,
  attributes: {
    'http.url': 'http://localhost:8080/ping',
    'http.host': 'localhost:8080',
    'net.host.name': 'localhost',
    'http.method': 'GET',
    'http.scheme': 'http',
    'http.target': '/ping',
    'http.flavor': '1.1',
    'net.transport': 'ip_tcp',
    'net.host.ip': '::ffff:127.0.0.1',
    'net.host.port': 8080,
    'net.peer.ip': '::ffff:127.0.0.1',
    'net.peer.port': 51158,
    'http.status_code': 204,
    'http.status_text': 'NO CONTENT'
  },
  status: { code: 0 },
  events: [],
  links: []
}
{
  resource: {
    attributes: {
      'service.name': 'unknown_service:node',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': '1.26.0'
    }
  },
  instrumentationScope: {
    name: '@opentelemetry/instrumentation-http',
    version: '0.53.0',
    schemaUrl: undefined
  },
  traceId: '822b4472dbcb19af0a2938a761096361',
  parentId: '350bee678e23a125',
  traceState: undefined,
  name: 'GET',
  id: '2f48f288684b2e4c',
  kind: 2,
  timestamp: 1728474096543000,
  duration: 16909.189,
  attributes: {
    'http.url': 'http://localhost:8080/ping',
    'http.method': 'GET',
    'http.target': '/ping',
    'net.peer.name': 'localhost',
    'http.host': 'localhost:8080',
    'net.peer.ip': '127.0.0.1',
    'net.peer.port': 8080,
    'http.status_code': 204,
    'http.status_text': 'NO CONTENT',
    'http.flavor': '1.1',
    'net.transport': 'ip_tcp'
  },
  status: { code: 0 },
  events: [],
  links: []
}
shutdown
Terminated
```


## Relevant output (Zipkin exporter imported)

**Observations**
- only server spans are created, no client spans
- no context is propagated, (speculation) it seems that the traceparent is not added to the request on the client to begin with.
  - speculation is reinforced by the fact that we get a server span (SpanKind=1), but no client span (SpanKind=2).

```
client {
  span: {
    traceId: 'c1b1ea93e57a09ffa0cd3108fee1a576',
    spanId: '53148db2db247666',
    traceFlags: 1,
    traceState: undefined
  }
}
server {
  heades: { host: 'localhost:8080', connection: 'close' },
  span: {
    traceId: '652a98ee6b117de6ee9d13c10c7b2913',
    spanId: 'ef18a562fd0a09d9',
    traceFlags: 1,
    traceState: undefined
  }
}
{
  resource: {
    attributes: {
      'service.name': 'unknown_service:node',
      'telemetry.sdk.language': 'nodejs',
      'telemetry.sdk.name': 'opentelemetry',
      'telemetry.sdk.version': '1.26.0'
    }
  },
  instrumentationScope: {
    name: '@opentelemetry/instrumentation-http',
    version: '0.53.0',
    schemaUrl: undefined
  },
  traceId: '652a98ee6b117de6ee9d13c10c7b2913',
  parentId: undefined,
  traceState: undefined,
  name: 'GET',
  id: 'ef18a562fd0a09d9',
  kind: 1,
  timestamp: 1728474242096000,
  duration: 3228.755,
  attributes: {
    'http.url': 'http://localhost:8080/ping',
    'http.host': 'localhost:8080',
    'net.host.name': 'localhost',
    'http.method': 'GET',
    'http.scheme': 'http',
    'http.target': '/ping',
    'http.flavor': '1.1',
    'net.transport': 'ip_tcp',
    'net.host.ip': '::ffff:127.0.0.1',
    'net.host.port': 8080,
    'net.peer.ip': '::ffff:127.0.0.1',
    'net.peer.port': 44258,
    'http.status_code': 204,
    'http.status_text': 'NO CONTENT'
  },
  status: { code: 0 },
  events: [],
  links: []
}
```