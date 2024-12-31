import { HttpClient } from "../src/core/interfaces/HttpClient"
import { SecurityHeaderService } from "../src/core/services/SecurityHeaderService"
import { Response } from "../src/core/models/Response"
jest.setTimeout(999999)
class MockHttpClient implements HttpClient{

    async makeRequest(url: string, method:string): Promise<Response> {
        return {
            method: "get",
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
            requestUrl: url
        }
    }
        
}
describe('SecurityHeaderService', () => {
    const mockHttpClient = new MockHttpClient()
    const sut = new SecurityHeaderService(mockHttpClient)
    it('should return a object with exisiting headers and requestUrl', async () => {
        const response = await sut.hasSecurityHeaders("https://www.google.com")
        expect(response.headers).toEqual({
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
        expect(response.requestUrl).toEqual("https://www.google.com")
   })
   it('should return a object with a error if request fails', async () => {
    mockHttpClient.makeRequest = jest.fn().mockRejectedValueOnce(new Error('Request failed with status 404'))
    const response = await sut.hasSecurityHeaders("https://www.google.com")
    expect(response.requestUrl).toBe("https://www.google.com")
    expect(response.error).toBe('Request failed with status 404')

   })

   it('should return a object with error if request returns status different of 200', async () => {
    mockHttpClient.makeRequest = jest.fn().mockResolvedValueOnce({
        status: 404,
        body: "mocked error",
    })
    const response = await sut.hasSecurityHeaders("https://www.google.com")
    expect(response.requestUrl).toBe("https://www.google.com")
    expect(response.error).toBe('Request failed with error mocked error')
})
})
