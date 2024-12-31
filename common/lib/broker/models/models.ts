import ILogger from "../../log/logger.interface";
import IScanner from "../../models/scanner.interface";

export type ConnectionOptions = {
    protocol: string;
    hostname: string;
    port: number;
    username: string;
    password: string;
    vhost: string;
    heartbeat: number;
    connection_timeout: number;
    authMechanism: string[];
}

export type RabbitMQConsumerConfig = {
    logger: ILogger;
    connectionOptions: ConnectionOptions;
    queue: string;
    resultQueue: string;
    scanner: IScanner;
}

