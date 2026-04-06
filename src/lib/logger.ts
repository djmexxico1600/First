type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
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
      });
    } catch (error) {
      // Silently fail to avoid disrupting the app
      console.error('Failed to send log to server:', error);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.isDev) {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  info(message: string, context?: Record<string, any>) {
    console.log(this.formatMessage('INFO', message, context));
    this.sendToServer({ timestamp: new Date().toISOString(), level: 'INFO', message, context });
  }

  warn(message: string, context?: Record<string, any>) {
    console.warn(this.formatMessage('WARN', message, context));
    this.sendToServer({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      context,
    });
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
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
    });
  }
}

export const logger = new Logger();
