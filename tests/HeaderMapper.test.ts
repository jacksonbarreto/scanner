import { mapHeaders } from "../src/core/mappers/HeaderMapper"

describe("HeaderMapper", () => {
    it("should map headers to lowercase", () => {
        const headers = {
            'Strict-Transport-Security': "true",
            'X-Frame-Options': "true",
            'X-Content-Type-Options': "true",
            'Content-Security-Policy': "true",
            'X-Permitted-Cross-Domain-Policies': "true",
            'Referrer-Policy': "true",
            'Clear-Site-Data': "true",
            'Cross-Origin-Embedder-Policy': "true",
            'Cross-Origin-Opener-Policy': "true",
            'Cross-Origin-Resource-Policy': "true",
            'Cache-Control': "true"
        }
        const result = mapHeaders(headers)
        expect(result).toEqual({
            'strict-transport-security': "true",
            'x-frame-options': "true",
            'x-content-type-options': "true",
            'content-security-policy': "true",
            'x-permitted-cross-domain-policies': "true",
            'referrer-policy': "true",
            'clear-site-data': "true",
            'cross-origin-embedder-policy': "true",
            'cross-origin-opener-policy': "true",
            'cross-origin-resource-policy': "true",
            'cache-control': "true"
        })
    })

    it("should return an empty object if there are no headers", () => {
        const result = mapHeaders({})
        expect(result).toEqual({})
    })
})
