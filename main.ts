import amqplib, { Connection, Channel } from 'amqplib';
import { AxiosHttpClient } from "./src/core/implementations/AxiosHttpClient"
import { CSVOutput } from "./src/core/implementations/CSVOutput"
import { HeaderAnalyser, HeaderAnalyserResult } from "./src/core/services/HeaderAnalyser"
import { SecurityHeaderService } from "./src/core/services/SecurityHeaderService"
import config from './config/config';
import {RabbitMQConsumer} from "./common/lib/broker/rabbitMQConsumer";
import {ExitCode} from "./common/lib/models/exiteCode";
import Logger from "./common/lib/log/logger";
import { RabbitMQConsumerConfig} from "./common/lib/broker/models/models";
import HTTPHeadersScanner from './src/core/services/httpheadersScanner/httpheadersScanner';

Logger.init(config.log).info(`Starting ${config.appName} in '${config.env}' mode...`);


const rabbitMQConsumerConfig: RabbitMQConsumerConfig = {
    queue: config.rabbit.queue,
    resultQueue: config.rabbit.resultQueue,
    scanner: HTTPHeadersScanner.getInstance(),
    logger: Logger.getInstance(),
    connectionOptions: {
        protocol: config.rabbit.protocol,
        username: config.rabbit.username,
        password: config.rabbit.password,
        hostname: config.rabbit.hostname,
        port: config.rabbit.port,
        vhost: config.rabbit.vhost,
        heartbeat: config.rabbit.heartbeat,
        connection_timeout: config.rabbit.connection_timeout,
        authMechanism: config.rabbit.authMechanism
    }
};


new RabbitMQConsumer(rabbitMQConsumerConfig).start().catch((error) => {
    Logger.getInstance().error(`Consumer failed to start: ${error}`);
    process.exit(ExitCode.Failure);
});

/*
const url = "www.google.pt"
AxiosHttpClient
HeaderAnalyser

async function analyse(...urls: string[]) {
    const httpClient = new AxiosHttpClient()
    const service = new SecurityHeaderService(httpClient)
    const output = new CSVOutput("output.csv")
    const requests: Promise<HeaderAnalyserResult>[] = []
    try {
    for (let url of urls) {
        requests.push(service.hasSecurityHeaders(url))
    }
    const response = await Promise.all(requests)
    output.writeMany(response)
    } catch (error) {
        console.log(error)
    }
   
}


analyse("https://academicos.ipvc.pt/netpa/page")*/