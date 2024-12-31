import { HeaderAnalyser, HeaderAnalyserResult } from "../services/HeaderAnalyser";

export interface Output {
    writeMany(objects: HeaderAnalyserResult[]): void
}