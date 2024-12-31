import pino, {Logger as PinoLogger} from 'pino';
import ILogger from "./logger.interface";
import LogConfig from "./logConfig.interface";

export default class Logger implements ILogger {
    private static instance: Logger;
    private pinoLogger: PinoLogger;

    private constructor(config: LogConfig) {
        if (config.pretty) {
            this.pinoLogger = pino({
                level: config.level,
                transport: {
                    target: 'pino-pretty',
                    options: {
                        colorize: config.colorize || false,
                        translateTime: 'SYS:standard',
                    },
                },
            });
        } else {
            this.pinoLogger = pino({level: config.level});
        }
    }

    public static init(config?: LogConfig): ILogger {
        if (!this.instance) {
            if (!config) console.warn('Logger instance initialized with default configuration.');
            const defaultConfig: LogConfig = {
                level: config?.level || 'info',
                pretty: config?.pretty || false,
                colorize: config?.colorize || false,
            };
            this.instance = new Logger(defaultConfig);
        } else {
            console.error('Logger instance already initialized.');
        }
        return this.instance;
    }

    public static getInstance(): ILogger {
        if (!this.instance) {
            this.init();
            console.warn('Logger instance not initialized. Using default configuration.');
        }
        return this.instance;
    }

    public info(message: string, ...meta: any[]): void {
        this.pinoLogger.info(message, ...meta);
    }

    public error(message: string, ...meta: any[]): void {
        this.pinoLogger.error(message, ...meta);
    }

    public warn(message: string, ...meta: any[]): void {
        this.pinoLogger.warn(message, ...meta);
    }

    public debug(message: string, ...meta: any[]): void {
        this.pinoLogger.debug(message, ...meta);
    }

    public trace(message: string, ...meta: any[]): void {
        this.pinoLogger.trace(message, ...meta);
    }

    public fatal(message: string, ...meta: any[]): void {
        this.pinoLogger.fatal(message, ...meta);
    }
}

