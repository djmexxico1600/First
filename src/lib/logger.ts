type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  requestId?: string;
}

/**
 * Generate unique request ID for distributed tracing
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';
  private logEndpoint = process.env.NEXT_PUBLIC_LOG_ENDPOINT;

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>) {
    return `[${new Date().toISOString()}] [${level}] ${message}${
      context ? ` ${JSON.stringify(context)}` : ''
    }`;
  }

  private async sendToServer(entry: LogEntry) {
    if (!this.logEndpoint) return;

    try {
      await fetch(this.logEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      }).catch(() => {
        // Silently fail to avoid disrupting the app
      });
    } catch {
      // Ignore errors
    }
  }

  debug(message: string, context?: Record<string, any>, _requestId?: string) {
    if (this.isDev) {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
    // Debug logs not sent to server by default
  }

  info(message: string, context?: Record<string, any>, requestId?: string) {
    console.log(this.formatMessage('INFO', message, context));
    this.sendToServer({ timestamp: new Date().toISOString(), level: 'INFO', message, context, requestId });
  }

  warn(message: string, context?: Record<string, any>, requestId?: string) {
    console.warn(this.formatMessage('WARN', message, context));
    this.sendToServer({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      context,
      requestId,
    });
  }

  error(message: string, error?: Error, context?: Record<string, any>, requestId?: string) {
    console.error(
      this.formatMessage('ERROR', message, context),
      error ? `\n${error.stack}` : ''
    );
    this.sendToServer({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      context,
      error,
      requestId,
    });
  }

  /**
   * Log API request
   */
  logApiRequest(method: string, path: string, requestId: string, context?: Record<string, any>) {
    this.info(`API Request: ${method} ${path}`, { ...context }, requestId);
  }

  /**
   * Log API response
   */
  logApiResponse(method: string, path: string, statusCode: number, duration: number, requestId: string) {
    this.info(`API Response: ${method} ${path} ${statusCode}`, { durationMs: duration }, requestId);
  }

  /**
   * Log database operation
   */
  logDatabaseOperation(operation: string, table: string, duration: number, requestId?: string) {
    this.debug(`Database: ${operation} on ${table}`, { durationMs: duration }, requestId);
  }

  /**
   * Log external service call
   */
  logExternalService(service: string, method: string, statusCode: number, duration: number, requestId?: string) {
    this.info(`External Service: ${service} ${method} ${statusCode}`, { durationMs: duration }, requestId);
  }
}

export const logger = new Logger();
