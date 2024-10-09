// register.js

import { register } from 'node:module';
register('@opentelemetry/instrumentation/hook.mjs', import.meta.url);

import {ConsoleSpanExporter, NodeTracerProvider, SimpleSpanProcessor} from "@opentelemetry/sdk-trace-node";
import {registerInstrumentations} from "@opentelemetry/instrumentation";
import {HttpInstrumentation} from "@opentelemetry/instrumentation-http";

// uncommenting this will break propagation
//import {ZipkinExporter} from '@opentelemetry/exporter-zipkin';
//new ZipkinExporter();

const tracerProvider = new NodeTracerProvider({});
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
tracerProvider.register();

registerInstrumentations({
    instrumentations: [new HttpInstrumentation()]
});

const shutdownFn = async () => tracerProvider.shutdown().then(() => console.log('shutdown'))
    .catch((error) => console.error(error));
let shutdownStarted = false;
const signals = ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'];
const signalHandler = (signal) => {
    if (shutdownStarted) return;
    shutdownStarted = true;
    shutdownFn().then(() => {
        signals.forEach((s) => process.removeListener(s, signalHandler));
        process.kill(process.pid, signal);
    });
};
signals.forEach((s) => process.on(s, signalHandler));

