import { Bracket } from "./bracket";

export class SingleElimination {
    private winners: Bracket;
    private bronze_final: Bracket;

    constructor(teams: string[]) {
        this.winners = new Bracket(teams.length);
        this.bronze_final = new Bracket(2);
        this.bronze_final.dep = this.winners;
        this.bronze_final.matches[0].deps = this.winners.dep_list(0);
    }
}
