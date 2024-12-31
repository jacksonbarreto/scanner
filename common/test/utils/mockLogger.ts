import Mocked = jest.Mocked;
import ILogger from "../../lib/log/logger.interface";

export const mockLogger:  Mocked<ILogger> = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn(),
}

export const resetMockLogger = () => {
    mockLogger.info.mockReset();
    mockLogger.error.mockReset();
    mockLogger.warn.mockReset();
    mockLogger.debug.mockReset();
    mockLogger.trace.mockReset();
    mockLogger.fatal.mockReset();
}