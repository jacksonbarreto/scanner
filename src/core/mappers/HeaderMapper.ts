export function mapHeaders(headers: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = {}
        
        for (let header of Object.keys(headers)) {
            result[header.toLowerCase()] = headers[header]
        }
        return result
}