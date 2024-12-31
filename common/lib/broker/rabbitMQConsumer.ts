import amqplib, {Connection, Channel} from 'amqplib';
import {RabbitMQConsumerConfig} from "./models/models";
import ILogger from "../log/logger.interface";
import IScanner from "../models/scanner.interface";
import IBroker from "./broker.interface";
import {AnalysisRequest} from "../models/analysisRequest";
import {AnalysisResult} from "../models/analysisResult";
import ValidationError from "../models/validationError";

export const INITIAL_DELAY: number = 1000; // 1 second
export const MAX_RECONNECT_DELAY: number = 1800000; // 30 minutes
const MAX_WORKERS: number = 4;

export class RabbitMQConsumer implements IBroker {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly logger: ILogger;
    private scanPromises: Promise<void>[] = [];
    private reconnectDelay: number = INITIAL_DELAY;
    private readonly maxReconnectDelay: number = MAX_RECONNECT_DELAY;
    private shuttingDown: boolean = false;

    constructor(private rabbitMQConfig: RabbitMQConsumerConfig,
                private scanner: IScanner = rabbitMQConfig.scanner) {
        this.logger = this.rabbitMQConfig.logger;
        process.on('SIGINT', () => this.handleSignal('SIGINT'));
        process.on('SIGTERM', () => this.handleSignal('SIGTERM'));
        process.on('SIGQUIT', () => this.handleSignal('SIGQUIT'));
    }

    public async start(): Promise<void> {
        try {
            await this.connect();
            await this.createConsumer();
        } catch (error) {
            if (this.shuttingDown) {
                return;
            }
            this.logger.error(`Failed : ${this.getMsgError(error)}`);
            await this.handleReconnection();
        }
    }

    private async connect(): Promise<void> {
        try {
            this.connection = await amqplib.connect(this.rabbitMQConfig.connectionOptions);
            this.channel = await this.connection.createChannel();
            this.logger.info(`Connected to RabbitMQ server at ${this.rabbitMQConfig.connectionOptions.hostname}`);
            this.connection.on('close', () => this.handleConnectionClose());
            this.connection.on('error', (err) => this.handleConnectionError(err));
        } catch (error) {
            this.logger.error(`Connection failed: ${this.getMsgError(error)}`);
            throw error;
        }
    }


    private async createConsumer(): Promise<void> {
        if (!this.channel) throw new Error('Channel is not established.');

        await this.channel.assertQueue(this.rabbitMQConfig.queue, {
            durable: true,
        });
        await this.channel.prefetch(MAX_WORKERS);

        await this.channel.consume(this.rabbitMQConfig.queue, async (msg) => {
            if (msg !== null && !this.shuttingDown) {
                const content = msg.content.toString();
                this.processMessage(content)
                    .then(() => {
                        this.channel!.ack(msg, false);
                    })
                    .catch((error) => {
                        if (error instanceof ValidationError) {
                            this.channel!.reject(msg, false);
                        } else {
                            this.channel!.nack(msg, false, true);
                        }
                    });
            }  else if (msg !== null && this.shuttingDown) {
                this.channel!.nack(msg, false, true);
            }
        }, {noAck: false});
        this.logger.info(`Consumer is now consuming messages from the '${this.rabbitMQConfig.queue}' queue`);
    }

    private async processMessage(msg: string): Promise<void> {
        let scanPromise: Promise<void>;
        try {
            const request: AnalysisRequest = JSON.parse(msg);
            this.logger.info(`Received a request to scan: ${request.url}`);

            scanPromise = this.handleScan(request);
            this.scanPromises.push(scanPromise);

            await scanPromise;
        } catch (error) {
            this.logger.error(`Failed to process message: ${error}`);
            throw error;
        } finally {
            this.scanPromises = this.scanPromises.filter(p => p !== scanPromise)
        }
    }

    private async handleScan(request: AnalysisRequest): Promise<void> {
        try {
            const result: AnalysisResult = await this.scanner.scan(request);
            this.logger.info(`Successfully scanned ${request.url}`);

            if (this.channel) {
                this.channel.sendToQueue(this.rabbitMQConfig.resultQueue, Buffer.from(JSON.stringify(result)), {persistent: true});
                this.logger.info(`Results of ${request.url} successfully sent to RabbitMQ in the '${this.rabbitMQConfig.resultQueue}' queue`);
            }
        } catch (error) {
            this.logger.error(`Error processing scan for ${request.url}: ${this.getMsgError(error)}`);
            throw error;
        }
    }


    private async handleReconnection(): Promise<void> {
        if (!this.shuttingDown) {
            try {
                await this.delay(this.reconnectDelay);
                await this.connect();
                this.reconnectDelay = INITIAL_DELAY;
                await this.createConsumer();
            } catch (error) {
                this.logger.error(`Reconnection attempt failed: ${this.getMsgError(error)}`);
                if (this.reconnectDelay === this.maxReconnectDelay) {
                    this.logger.info('Max attempts reached. Resetting reconnection delay.');
                    this.reconnectDelay = INITIAL_DELAY;
                } else {
                    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
                }
                setTimeout(() => this.handleReconnection(), this.reconnectDelay);
            }
        }
    }

    private async handleSignal(signal: string): Promise<void> {
        this.logger.info(`Received signal: ${signal}`);
        this.shuttingDown = true;
        try {
            await this.handleShutdown();
        } catch (error) {
            throw error;
        }
    }

    private async handleShutdown(): Promise<void> {
        this.logger.info("Shutting down gracefully started...");
        try {
            this.logger.info("Waiting for pending scans to complete...");
            await Promise.allSettled(this.scanPromises);

            if (this.connection) {
                this.logger.info("Closing connection to RabbitMQ server...");
                this.connection.removeAllListeners();
                await this.connection.close();
            }
            this.logger.info("Graceful shutdown complete.");
        } catch (error) {
            this.logger.error(`Failed to shut down gracefully due to an error. Error: ${this.getMsgError(error)}`);
            throw error;
        }
    }

    private async handleConnectionClose(): Promise<void> {
        this.logger.warn('Connection to RabbitMQ closed. Attempting to reconnect...');
        await this.handleReconnection()
    }

    private async handleConnectionError(error: Error): Promise<void> {
        this.logger.error(`Connection to RabbitMQ got an error: ${this.getMsgError(error)}`);
        await this.handleReconnection()
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private getMsgError(error: any): string {
        return (error instanceof Error) ? error.message : String(error);
    }
}
