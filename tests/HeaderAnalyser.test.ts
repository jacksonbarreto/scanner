import { Response } from "../src/core/models/Response"
import { HeaderAnalyser } from "../src/core/services/HeaderAnalyser"

describe("HeaderAnalyser", () => {
    let response: Response = {
        status: 200,
        headers: {
            'strict-transport-security': true,
            'x-frame-options': true,
            'x-content-type-options': true,
            'content-security-policy': true,
            'x-permitted-cross-domain-policies': true,
            'referrer-policy': true,
            'clear-site-data': true,
            'cross-origin-embedder-policy': true,
            'cross-origin-opener-policy': true,
            'cross-origin-resource-policy': true,
            'cache-control': true
        },
        body: "mocked response",
        requestUrl: "https://www.google.com"
    }

    it("should return a object with exisiting headers and requestUrl", () => {
        const result = HeaderAnalyser.hasSecurityHeaders(response)
        expect(result.headers).toEqual({
            'strict-transport-security': true,
            'x-frame-options': true,
            'x-content-type-options': true,
            'content-security-policy': true,
            'x-permitted-cross-domain-policies': true,
            'referrer-policy': true,
            'clear-site-data': true,
            'cross-origin-embedder-policy': true,
            'cross-origin-opener-policy': true,
            'cross-origin-resource-policy': true,
            'cache-control': true
        })
        expect(result.requestUrl).toEqual("https://www.google.com")
    })

    it('should return a object with falses for missing headers', () => {
        response.headers = {}
        const result = HeaderAnalyser.hasSecurityHeaders(response)
        expect(result.headers).toEqual({
            'strict-transport-security': false,
            'x-frame-options': false,
            'x-content-type-options': false,
            'content-security-policy': false,
            'x-permitted-cross-domain-policies': false,
            'referrer-policy': false,
            'clear-site-data': false,
            'cross-origin-embedder-policy': false,
            'cross-origin-opener-policy': false,
            'cross-origin-resource-policy': false,
            'cache-control': false
        })
        expect(result.requestUrl).toEqual("https://www.google.com")
    })

})