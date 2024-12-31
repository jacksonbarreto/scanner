import Score from "./score";
import {Grade} from "./grade";

export type Rating = {
    version: string;
    score: Score;
    grade: Grade;
}