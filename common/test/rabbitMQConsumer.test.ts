import amqplib, {Channel, Connection} from "amqplib";
import {INITIAL_DELAY, MAX_RECONNECT_DELAY, RabbitMQConsumer} from "../lib/broker/rabbitMQConsumer";
import {mockLogger} from "./utils/mockLogger";
import {mockScanner, resultAnalysis} from "./utils/mockScanner";
import {AnalysisRequest} from "../lib/models/analysisRequest";
import {AnalysisType} from "../lib/models/analysisType";
import ValidationError from "../lib/models/validationError";

jest.mock('amqplib');

const mockConnect = amqplib.connect as jest.MockedFunction<typeof amqplib.connect>;

describe('RabbitMQConsumer', () => {
    let consumer: RabbitMQConsumer;
    let mockConnection: Connection;
    let mockChannel: Channel;
    const analysisRequest: AnalysisRequest = {
        id: 'artt',
        url: 'http://www.ipp.pt',
        requestTime: new Date(),
        type: AnalysisType.DNSSEC
    };
    const mockRequest = {
        content: Buffer.from(JSON.stringify(analysisRequest)),
        ack: jest.fn(),
        reject: jest.fn(),
        nack: jest.fn()
    };
    beforeEach(() => {
        const rabbitMQConfig = {
            queue: "analysis-request-dev",
            resultQueue: "analysis-results-dev",
            scanner: mockScanner,
            logger: mockLogger,
            connectionOptions: {
                protocol: "amqp",
                username: "username",
                password: "pass",
                hostname: 'localhost',
                port: 5672,
                vhost: "/",
                heartbeat: 30,
                connection_timeout: 10000,
                authMechanism: [
                    "PLAIN",
                    "AMQPLAIN",
                    "EXTERNAL"
                ]
            }
        };


        consumer = new RabbitMQConsumer(rabbitMQConfig);
        mockChannel = {
            assertQueue: jest.fn(),
            prefetch: jest.fn(),
            consume: jest.fn().mockImplementation((queue, onMessage) => {
                setImmediate(() => onMessage(mockRequest));
                return Promise.resolve({consumerTag: "mockConsumerTag"});
            }),
            sendToQueue: jest.fn().mockResolvedValue(undefined),
            ack: jest.fn(),
            reject: jest.fn(),
            nack: jest.fn()
        } as any as Channel;

        mockConnection = {
            createChannel: jest.fn().mockResolvedValue(mockChannel),
            close: jest.fn().mockResolvedValue(undefined),
            on: jest.fn(),
            removeAllListeners: jest.fn()
        } as any as Connection;

        mockConnect.mockResolvedValue(mockConnection);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        jest.useRealTimers();

        process.removeAllListeners('SIGINT');
        process.removeAllListeners('SIGTERM');
        process.removeAllListeners('SIGQUIT');
    });

    describe('Reconnection', () => {

        it('should reconnect after connection close', async () => {
            jest.useFakeTimers();
            await consumer.start();

            expect(mockConnection.on).toHaveBeenCalledWith('close', expect.any(Function));
            const closeHandler = (mockConnection.on as jest.Mock).mock.calls.find(call => call[0] === 'close')[1];
            closeHandler();
            jest.advanceTimersByTime(INITIAL_DELAY + 100);
            await Promise.resolve()
            expect(mockLogger.warn).toHaveBeenCalledWith('Connection to RabbitMQ closed. Attempting to reconnect...');
            expect(mockConnect).toHaveBeenCalledTimes(2);
        });

        it('should reconnect after connection error', async () => {
            jest.useFakeTimers();
            await consumer.start();

            expect(mockConnection.on).toHaveBeenCalledWith('error', expect.any(Function));

            const errorHandler = (mockConnection.on as jest.Mock).mock.calls.find(call => call[0] === 'error')[1];
            errorHandler(new Error('Test error'));
            jest.advanceTimersByTime(INITIAL_DELAY + 100);
            await Promise.resolve()
            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Connection to RabbitMQ got an error: Test error'));
            expect(mockConnect).toHaveBeenCalledTimes(2);
        });

        it('should follow the backoff exponential strategy when reconnecting', async () => {
            jest.useFakeTimers();

            mockConnect.mockImplementation(() => Promise.reject(new Error('Connection failed')));

            consumer.start();

            const delays = [INITIAL_DELAY, INITIAL_DELAY * 2, INITIAL_DELAY * 4, INITIAL_DELAY * 8];

            for (let i = 0; i < delays.length; i++) {
                jest.advanceTimersByTime(delays[i]);
                await Promise.resolve();
                await Promise.resolve();
                await Promise.resolve();
                expect(mockConnect).toHaveBeenCalledTimes(i + 1);
            }
        });


        it('should not exceed the maximum reconnect delay and should reset after max delay', async () => {
            jest.useFakeTimers();

            mockConnect.mockImplementation(() => Promise.reject(new Error('Connection failed')));

            consumer.start();

            let currentDelay = INITIAL_DELAY;
            let reconnectDelay;
            while (true) {
                jest.advanceTimersByTime(currentDelay);
                await Promise.resolve();
                reconnectDelay = consumer['reconnectDelay'];
                if (reconnectDelay === INITIAL_DELAY) break;
                currentDelay = Math.min(currentDelay * 2, MAX_RECONNECT_DELAY);
                expect(reconnectDelay).toBeLessThanOrEqual(MAX_RECONNECT_DELAY);
            }

            expect(consumer['reconnectDelay']).toBe(INITIAL_DELAY);
        });
    });

    describe('Shutdown', () => {
        it('should shutdown gracefully', async () => {
            await consumer.start();

            const pendingScanPromise = new Promise<void>((resolve) => setTimeout(resolve, 100));
            consumer['scanPromises'].push(pendingScanPromise);

            const handleShutdownSpy = jest.spyOn(consumer as any, 'handleShutdown');

            process.emit('SIGINT');

            await new Promise(setImmediate);

            expect(mockLogger.info).toHaveBeenCalledWith('Received signal: SIGINT');
            expect(handleShutdownSpy).toHaveBeenCalled();

            await handleShutdownSpy.mock.results[0].value;

            expect(mockLogger.info).toHaveBeenCalledWith("Shutting down gracefully started...");
            expect(mockLogger.info).toHaveBeenCalledWith("Waiting for pending scans to complete...");
            expect(mockLogger.info).toHaveBeenCalledWith("Closing connection to RabbitMQ server...");
            expect(mockLogger.info).toHaveBeenCalledWith("Graceful shutdown complete.");
            expect(mockConnection.close).toHaveBeenCalled();
            expect(mockConnection.removeAllListeners).toHaveBeenCalled();
        });


        it('should handle SIGINT signal', async () => {
            const handleShutdownSpy = jest.spyOn(consumer as any, 'handleShutdown').mockResolvedValueOnce(undefined);

            try {
                process.emit('SIGINT');
            } catch (e) {
                expect(mockLogger.info).toHaveBeenCalledWith('Received signal: SIGINT');
                expect(handleShutdownSpy).toHaveBeenCalled();
            }
        });

        it('should handle SIGTERM signal', async () => {
            const handleShutdownSpy = jest.spyOn(consumer as any, 'handleShutdown').mockResolvedValueOnce(undefined);

            try {
                process.emit('SIGTERM');
            } catch (e) {
                expect(mockLogger.info).toHaveBeenCalledWith('Received signal: SIGTERM');
                expect(handleShutdownSpy).toHaveBeenCalled();
            }
        });

        it('should handle SIGQUIT signal', async () => {
            const handleShutdownSpy = jest.spyOn(consumer as any, 'handleShutdown').mockResolvedValueOnce(undefined);

            try {
                process.emit('SIGQUIT');
            } catch (e) {
                expect(mockLogger.info).toHaveBeenCalledWith('Received signal: SIGQUIT');
                expect(handleShutdownSpy).toHaveBeenCalled();
            }
        });
    });

    describe('Processing messages', () => {


        it('should process valid message correctly', async () => {
            (mockScanner.scan as jest.Mock).mockResolvedValue(resultAnalysis);
            await consumer.start();
            await new Promise(setImmediate);
            expect(mockLogger.info).toHaveBeenCalledWith("Received a request to scan: http://www.ipp.pt");

            expect(mockScanner.scan).toHaveBeenCalledWith(expect.objectContaining({
                id: 'artt',
                url: 'http://www.ipp.pt',
                type: AnalysisType.DNSSEC,
                requestTime: analysisRequest.requestTime.toISOString()
            }));
            expect(mockChannel.sendToQueue).toHaveBeenCalledWith("analysis-results-dev", Buffer.from(JSON.stringify(resultAnalysis)), {persistent: true});
            await new Promise(setImmediate);
            expect(mockLogger.info).toHaveBeenCalledWith("Successfully scanned http://www.ipp.pt");
            expect(mockChannel.ack).toHaveBeenCalled();
            process.emit('SIGINT');
            await new Promise(setImmediate);
            expect(mockConnection.close).toHaveBeenCalled();

        });

        it('should reject invalid message', async () => {
            (mockScanner.scan as jest.Mock).mockRejectedValueOnce(new ValidationError("Invalid scan request"));

            await consumer.start();

            await new Promise(setImmediate);

            expect(mockChannel.reject).toHaveBeenCalled();

            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to process message'));

        });

        it('should nack message because a processing error', async () => {
            (mockScanner.scan as jest.Mock).mockRejectedValueOnce(new Error("Processing error"));

            await consumer.start();

            await new Promise(setImmediate);

            expect(mockChannel.nack).toHaveBeenCalled();

            expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to process message'));
        });
    });


});