import {AnalysisType} from "./analysisType";

export type AnalysisRequest = {
    id: string;
    url: string;
    requestTime: Date;
    type: AnalysisType;
}