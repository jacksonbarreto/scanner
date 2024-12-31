import IScore from "./score.interface";

export default class Score implements IScore {

    constructor(private readonly score: number) {
        if (!this.isValidScore(score)) {
            throw new Error("Score must be between 0 and 100");
        }
    }

    public getScore(): number {
        return this.score;
    }

    private isValidScore(score: number): boolean {
        return score >= 0 && score <= 100;
    }
}