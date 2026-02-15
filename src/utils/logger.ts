import { existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const LOG_DIR = join(homedir(), '.ccs');
const LOG_FILE = join(LOG_DIR, 'debug.log');

export const logger = {
  logError(context: string, error: unknown): void {
    try {
      if (!existsSync(LOG_DIR)) {
        mkdirSync(LOG_DIR, { recursive: true });
      }
      const timestamp = new Date().toISOString();
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : '';
      appendFileSync(LOG_FILE, `[${timestamp}] [${context}] ${message}\n${stack ? stack + '\n' : ''}`, 'utf-8');
    } catch {
      // Logging should never throw
    }
  },
};
