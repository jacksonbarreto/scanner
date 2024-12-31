import LogConfig from "../lib/log/logConfig.interface";
import Logger from "../lib/log/logger";
import pino from "pino";

jest.mock('pino');

describe('Logger', () => {
    const defaultConfig: LogConfig = {
        level: 'info',
        pretty: false,
        colorize: false
    };

    const customConfig: LogConfig = {
        level: 'debug',
        pretty: true,
        colorize: true
    };

    let pinoMock: jest.MockedFunction<typeof pino>;

    beforeAll(() => {
        pinoMock = pino as jest.MockedFunction<typeof pino>;
    });

    afterEach(() => {
        // Reset the singleton instance
        (Logger as any).instance = undefined;
        jest.restoreAllMocks();
    });

    it('should initialize with default configuration if no config is provided', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => {
        });
        Logger.init();
        const logger = Logger.getInstance();
        expect(console.warn).toHaveBeenCalledWith("Logger instance initialized with default configuration.");
        expect(logger).toBeInstanceOf(Logger);
        expect(pino).toHaveBeenCalledWith({level: 'info'});
    });

    it('should initialize with provided configuration', () => {
        Logger.init(customConfig);
        const logger = Logger.getInstance();
        expect(logger).toBeInstanceOf(Logger);

        expect(pinoMock).toHaveBeenCalledWith({
            level: 'debug',
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard'
                }
            }
        });
    });

    it('should warn if initialized more than once', () => {
        jest.spyOn(console, 'error').mockImplementation(() => {
        });
        Logger.init(defaultConfig);
        Logger.init(customConfig);
        expect(console.error).toHaveBeenCalledWith('Logger instance already initialized.');
    });

    it('should return the existing instance when getInstance is called', () => {
        Logger.init(customConfig);
        const logger1 = Logger.getInstance();
        const logger2 = Logger.getInstance();
        expect(logger1).toBe(logger2);
    });

    it('should log messages using the correct methods', () => {
        const pinoLoggerMock = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            trace: jest.fn(),
            fatal: jest.fn(),
        };

        pinoMock.mockReturnValue(pinoLoggerMock as any);

        Logger.init(customConfig);
        const logger = Logger.getInstance();

        logger.info('info message');
        logger.error('error message');
        logger.warn('warn message');
        logger.debug('debug message');
        logger.trace('trace message');
        logger.fatal('fatal message');

        expect(pinoLoggerMock.info).toHaveBeenCalledWith('info message');
        expect(pinoLoggerMock.error).toHaveBeenCalledWith('error message');
        expect(pinoLoggerMock.warn).toHaveBeenCalledWith('warn message');
        expect(pinoLoggerMock.debug).toHaveBeenCalledWith('debug message');
        expect(pinoLoggerMock.trace).toHaveBeenCalledWith('trace message');
        expect(pinoLoggerMock.fatal).toHaveBeenCalledWith('fatal message');
    });

});
