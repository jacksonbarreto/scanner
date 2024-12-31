import IHTTPHeadersScanner from "./httpheadersScanner.interface";
import { AnalysisRequest } from "../../../../common/lib/models/analysisRequest";
import { SecurityHeadersResult, SecurityHeadersScannerConfig } from "./types";
import { GET_LOGGER_DEFAULT, HTTP_SECURITY_HEADERS_DEFAULT } from "./defaults";
import ILogger from "../../../../common/lib/log/logger.interface";
import { Rating } from "../../../../common/lib/models/rating";
import { Grade } from "../../../../common/lib/models/grade";
import  Score  from "../../../../common/lib/models/score";
import ValidationError from "../../../../common/lib/models/validationError";
import { AnalysisType } from "../../../../common/lib/models/analysisType";
import { mapHeaders } from "../../mappers/HeaderMapper";

import { HeaderAnalyser, HeaderAnalyserResult } from "../HeaderAnalyser";
import { Axios } from "axios";
import { AxiosHttpClient } from "../../implementations/AxiosHttpClient";

export default class HTTPHeadersScanner implements IHTTPHeadersScanner {
    private static __instance: HTTPHeadersScanner;
    //private readonly urlAnalysisAPI: string;
    private readonly logger: ILogger;
    private AxiosHttpClient: AxiosHttpClient;
    //private readonly calculateScore: (partialResult: SecurityHeadersResult) => Rating;

    private constructor(config: SecurityHeadersScannerConfig) {
       // this.urlAnalysisAPI = config.urlAnalysisAPI;
        this.logger = config.logger;
        this.AxiosHttpClient = new AxiosHttpClient();
        //this.calculateScore = config.calculateScore;
    }

    public static init(config?: SecurityHeadersScannerConfig): IHTTPHeadersScanner {
        if (!this.__instance) {
            if (!config) GET_LOGGER_DEFAULT().warn('HTTPHeadersScanner instance initialized with default configuration.');
            const Config: SecurityHeadersScannerConfig = {
                logger: config ? config.logger : GET_LOGGER_DEFAULT(),
                //calculateScore: (config) ? config.calculateScore : HTTP_SECURITY_HEADERS_DEFAULT,
            };

            this.__instance = new HTTPHeadersScanner(Config);
        } else {
            GET_LOGGER_DEFAULT().error('HTTPHeadersScanner instance already initialized.');
        }
        return this.__instance;
    }

    public static getInstance(): IHTTPHeadersScanner {
        if (!this.__instance) {
            GET_LOGGER_DEFAULT().warn('HTTPHeadersScanner instance not initialized. The default configuration will be used.');
            HTTPHeadersScanner.init();
        }
        return this.__instance;
    }

    public async scan(request: AnalysisRequest): Promise<SecurityHeadersResult> {
        this.logger.info(`Starting HTTP security headers scan for request: ${JSON.stringify(request)}`);

        try {
            if (request.type !== AnalysisType.SECURITY_HEADERS) {
                this.logger.error(`Invalid request type: ${request.type}`);
                throw new ValidationError(`Invalid request type: ${request.type}`);
            }

            const startTime: Date = new Date();
           /* const domain: string = this.extractDomain(request.url);
            this.logger.debug(`Domain extracted: ${domain}`);*/

            const response = await this.AxiosHttpClient.makeRequest(request.url, "get");
            
            
            const headers = response.headers;

            response.headers = mapHeaders(response.headers);

            const headerAnalyser = new HeaderAnalyser(new AxiosHttpClient())
            const headerResults = await headerAnalyser.hasSecurityHeaders(response)

            const result: SecurityHeadersResult = {
                id: request.id,
                url: request.url,
                requestTime: request.requestTime,
                type: request.type,
                rawResult: JSON.stringify(headers),
                startTime: startTime,
                endTime: new Date(),
                headers: headerResults,
                rating: {
                    version: "1.0",
                    grade: Grade.A,
                    score: new Score(0),
                }
            };

            console.log(result);

            // fazer o rating da implementação dos headers aqui

            this.logger.debug(`HTTP headers scan completed: ${JSON.stringify(result)}`);
            this.logger.info(`HTTP headers scan completed for request: ${JSON.stringify(request)}`);

            return result;
        } catch (error) {
            this.logger.error(`Error scanning HTTP security headers for URL '${request.url}': ${error}`);
            throw error;
        }
    }
    
/*
    private extractDomain(url: string): string {
        try {
            let normalizedUrl = url.replace(/\s+/g, '');
            if (!/^https?:\/\//i.test(normalizedUrl)) {
                normalizedUrl = `https://${normalizedUrl}`;
            }
            const parsedUrl: URL = new URL(normalizedUrl);
            return parsedUrl.hostname;
        } catch (error) {
            this.logger.error(`Invalid URL: ${url} to extract domain.`);
            throw new Error(`Invalid URL: ${url}`);
        }
    }

    private async makeHttpRequest(domain: string, method: string): Promise<any> {
        const url: string = `https://${domain}`;

        const response = await fetch(url, { method: method });
        this.logger.debug(`HTTP request to ${url} returned status: ${response.status}`);

        if (!response.ok) {
            this.logger.error(`Network response was not ok: ${response.statusText}`);
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        return response;
    }
*/
}
