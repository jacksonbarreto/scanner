import IScanner from "../../lib/models/scanner.interface";
import {AnalysisResult} from "../../lib/models/analysisResult";
import {AnalysisType} from "../../lib/models/analysisType";
import {Grade} from "../../lib/models/grade";
import Score from "../../lib/models/score";
import {AnalysisRequest} from "../../lib/models/analysisRequest";


export const resultAnalysis: AnalysisResult = {
    id: "001",
    url: "url",
    requestTime: new Date(),
    type: AnalysisType.DNSSEC,
    rawResult: "rawResult",
    startTime: new Date(),
    endTime: new Date(),
    rating: {
        version: "1.0",
        score: new Score(100),
        grade: Grade.A
    }

};

export class MockScanner implements IScanner {
    scan = jest.fn((request: AnalysisRequest) => {
        return new Promise<AnalysisResult>(resolve => resolve(resultAnalysis))
    });
}

export const mockScanner = new MockScanner();


export const resetMockDnssecScanner = () => {
    (mockScanner.scan as jest.Mock).mockReset();
};
