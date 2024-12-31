import { Request } from "../models/Request"
import { Response } from "../models/Response"
export type Header = Record<string, string>
export interface HttpClient {
    makeRequest(request: Request, method: string, headers?: Header): Promise<Response>
}