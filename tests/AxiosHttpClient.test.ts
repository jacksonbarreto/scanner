import { idText } from "typescript"
import { AxiosHttpClient } from "../src/core/implementations/AxiosHttpClient"
import axios from "axios"


jest.setTimeout(999999)

describe('AxiosHttpClient', () => {
    it('should return status 0 if there is an invalid url"', async () => {
        const httpClient = new AxiosHttpClient()
        const response = await httpClient.makeRequest('invalid url')
        expect(response.status).toBe(0)
    })
})