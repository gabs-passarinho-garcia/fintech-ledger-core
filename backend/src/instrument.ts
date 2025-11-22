import * as Sentry from '@sentry/bun';

/**
 * Get traces sample rate based on environment
 * @returns Sample rate for traces
 */
function getTracesSampleRate(): number {
  const appEnv = Bun.env.APP_ENV || Bun.env.NODE_ENV || 'dev';
  let sampleRate: number;

  switch (appEnv) {
    case 'prod':
    case 'production':
      sampleRate = 0.1; // 10% sampling in production
      break;
    case 'dev':
    case 'development':
      sampleRate = 1.0; // 100% sampling in development
      break;
    default:
      sampleRate = 0.5; // 50% sampling for other environments
  }

  console.info(
    `[Sentry] Traces sample rate set to ${sampleRate * 100}% for environment: ${appEnv}`,
  );
  return sampleRate;
}

Sentry.init({
  dsn: Bun.env.SENTRY_DSN,
  environment: Bun.env.SENTRY_ENVIRONMENT || Bun.env.APP_ENV || Bun.env.NODE_ENV || 'dev',
  // Tracing
  tracesSampleRate: getTracesSampleRate(),
});
