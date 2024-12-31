import {AnalysisRequest} from "./analysisRequest";
import {Rating} from "./rating";

export type AnalysisResult = AnalysisRequest & {
    rawResult: string;
    startTime: Date;
    endTime: Date;
    rating: Rating;
}






