
import { HttpClient } from "../interfaces/HttpClient";
import { executeForHeader } from "../mappers/HeaderDispatchTable";
import { Response } from "../models/Response";


export type HeaderAnalyserResult = {
    //requestUrl : string
    headers: Record<string, boolean>
    //error?: string
}

export class HeaderAnalyser {
    
    constructor(private httpClient: HttpClient) {
        
    }

    /**private async verifyMethods(response: Response): Promise<string[]> {
        const methods = ["GET",  "POST", "PUT", "DELETE",  "OPTIONS",  "PATCH"]
        const requests = []
        for (let method of methods) {
            requests.push(this.httpClient.makeRequest(response.requestUrl, method))
        }
        const responses = await Promise.all(requests)
        const allowedMethods = responses.filter(response => response.status !== 405)
       
        return allowedMethods.map(response => response.method)
    }*/

    private async verifyOrigin(response: Response, origin: string): Promise<boolean> {
        try {
            const resp = await this.httpClient.makeRequest(response.requestUrl, "get", {
                "Origin": origin,
                "Authorization": "Bearer token"
            })
            if(resp.status >= 200 && resp.status < 300) {
                return true
            }
            else {
                return false
            }
        }
        catch (error) {
            console.log(error)
            return false
        }
    }
    
    private async testSecurity(response: Response): Promise<boolean> {
        try {
            const requests = [
                this.verifyOrigin(response, "https://trusted-site.com"),
                this.verifyOrigin(response, "https://untrusted-site.com")
            ]

            const responses = await Promise.all(requests)
            const trusted = responses[0]
            const untrusted = responses[1]
            return trusted && !untrusted
        }
        catch (error) {
            console.log(error)
            return false
        }
    }

    private verifyEmbeddingPolicy(response: Response): boolean {
        const cspHeader = response.headers['content-security-policy'] || response.headers['content-security-policy-report-only']
        let includeFrameAncestors = false
        let includeFrameOptionsHeader = false
        if(cspHeader) {
            includeFrameAncestors = cspHeader.includes('frame-ancestors')
        }
        includeFrameAncestors = !!response.headers['x-frame-options']

        return includeFrameAncestors && includeFrameOptionsHeader
    }
    
    async hasSecurityHeaders(response: Response):Promise<HeaderAnalyserResult> {
        const headers = response.headers
      
          const requiredHeaders = ['content-type', 
            "content-disposition",
            "content-security-policy", 
            "x-content-type-options", 
            "strict-transport-security", // ignorado se em http
            "referrer-policy", 
            "allow", 
            "access-control-allow-origin",
            "x-xss-protection",
            "x-frame-options",  //new
            "permissions-policy", //suportado pelos browsers chromium
            "clear-site-data",
            "x-permitted-cross-domain-policies",
            "cross-origin-embedder-policy",
            "cross-origin-opener-policy",
            "cross-origin-resource-policy",
            'cache-control', //new
            'X-Download-Options' //new

        ];

          const result: Record<string, boolean> = {}

        for (let header of requiredHeaders) {
            if(header in headers) {
                result[header] = executeForHeader[header](headers[header])
            }
            else {
                result[header] = false
            }
        }

        const embeddingPolicy = this.verifyEmbeddingPolicy(response)
        //const methods = await this.verifyMethods(response)
        result["embeddingPolicy"] = embeddingPolicy
        result["origin"] = await this.testSecurity(response)
        return {
            headers: result
        }
    }
}
