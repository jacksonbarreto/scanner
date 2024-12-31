import { HttpClient, Header } from "../interfaces/HttpClient";
import { Request } from "../models/Request";
import { Response } from "../models/Response";
import axios from "axios";

export class AxiosHttpClient implements HttpClient {
    async makeRequest(request: Request, method: string="get", headers?: Header): Promise<Response> {
        try {
        let response = await axios({
            url: request,
            method: method,
            headers: {
                ...headers
            }
        })
        return {
            method: method,
            status: response.status,
            headers: JSON.parse(JSON.stringify(response.headers)),
            body: response.data,
            requestUrl: request
        }
    }
        catch (error:any) {
            
            if(error.response === undefined) {
                return {
                    method: method,
                    status: 0,
                    headers: {},
                    body: error.message,
                    requestUrl: request
                }
            }

            return {
                method: method,
                status: error.response.status,
                headers: error.response.headers,
                body: error.message,
                requestUrl: request
            }
        }
       
    }
}