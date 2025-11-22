import { opentelemetry } from '@elysiajs/opentelemetry';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { SentrySpanProcessor } from '@sentry/opentelemetry';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

export const instrumentation = opentelemetry({
  instrumentations: [
    new PgInstrumentation({
      enhancedDatabaseReporting: true,
    }),
    getNodeAutoInstrumentations(),
  ],
  spanProcessors: [
    new BatchSpanProcessor(new OTLPTraceExporter()),
    new SentrySpanProcessor() as never,
  ],
});

console.info('[OpenTelemetry] Instrumentation initialized successfully');
