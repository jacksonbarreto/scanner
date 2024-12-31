import { Output } from "../interfaces/Output";
import { HeaderAnalyserResult } from "../services/HeaderAnalyser";
import fs from 'fs'
export class CSVOutput implements Output {
    constructor(private filename: string, private errorFilename: string='errors.csv') {
        this.filename = filename
    }
    writeMany(objects: HeaderAnalyserResult[]): void {
        const csvErrorHeaders = ['url', 'errors']
        const errors = objects.filter(object => object.error)
        console.log(errors)
        const results = objects.filter(object => !object.error)
        console.log(results)
        const csvHeaders = ['url',...Object.keys(objects[0].headers)]
        if(fs.existsSync(this.errorFilename)) {
            fs.unlinkSync(this.errorFilename)
        }
        if(fs.existsSync(this.filename)) {
            fs.unlinkSync(this.filename)
        }
        fs.appendFileSync(this.errorFilename, csvErrorHeaders.join(',') + '\n')
        fs.appendFileSync(this.filename, csvHeaders.join(',') + '\n')
        for (let result of results) {
            fs.appendFileSync(this.filename, result.requestUrl  +',' + Object.values(result.headers).join(',') + '\n')
        }
        for (let error of errors) {
            fs.appendFileSync(this.errorFilename, error.requestUrl + ',' + error.error + '\n')
        }
    
    }
    
}