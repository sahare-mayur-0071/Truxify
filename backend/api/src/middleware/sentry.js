import * as Sentry from '@sentry/node';
import logger from './logger.js';

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({ dsn, environment: process.env.NODE_ENV || 'development' });
  logger.info('Sentry error tracking initialized.');
}

export function captureException(err, context = {}) {
  if (!process.env.SENTRY_DSN) return;
  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureException(err);
  });
}

export function sentryErrorHandler() {
  return Sentry.expressErrorHandler();
}
