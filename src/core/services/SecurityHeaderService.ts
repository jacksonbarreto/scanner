
import { HttpClient } from "../interfaces/HttpClient";
import { mapHeaders } from "../mappers/HeaderMapper";
import { HeaderAnalyser, HeaderAnalyserResult } from "./HeaderAnalyser";

export class SecurityHeaderService {
    constructor(private httpClient: HttpClient) {

    }

    async hasSecurityHeaders(requestUrl: string): Promise<HeaderAnalyserResult> {
        try {

        const startTime = performance.now(); // Captura o tempo inicial
        const response = await this.httpClient.makeRequest(requestUrl, "get");
        const endTime = performance.now(); // Captura o tempo após a resposta
        const duration = endTime - startTime; // Calcula o tempo de resposta em milissegundos

        console.log(`Request duration: ${duration.toFixed(2)} ms`);
        console.log(response);
        const headerAnalyser = new HeaderAnalyser(this.httpClient)

        if(response.status !== 200) {
            throw new Error(`Request failed with error ${response.body}`)
        }
        response.headers = mapHeaders(response.headers)
        console.log(response.headers);
        return headerAnalyser.hasSecurityHeaders(response)
        } catch (error:any) {
            return { headers: {} }
        }
       
    }
}