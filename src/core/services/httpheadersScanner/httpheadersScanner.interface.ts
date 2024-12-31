import {SecurityHeadersResult} from "./types";
import IScanner from "../../../../common/lib/models/scanner.interface";
import {AnalysisRequest} from "../../../../common/lib/models/analysisRequest";

export default interface IDnssecScanner extends IScanner{
    scan(request: AnalysisRequest): Promise<SecurityHeadersResult>;
}