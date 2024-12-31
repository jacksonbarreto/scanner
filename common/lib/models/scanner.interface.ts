import {AnalysisResult} from "./analysisResult";
import {AnalysisRequest} from "./analysisRequest";


export default interface IScanner {
    scan(request: AnalysisRequest): Promise<AnalysisResult>;
}