import { Bracket } from "./bracket";
import { permute } from "./permute";

export class SingleElimination {
    private bronze_final: Bracket;
    private winners: Bracket;
    public playing: any[];
    public queued: any[];
    public ready: any[];

    constructor(teams: any[], randomize: boolean) {
        if (teams.length == 0) {
            throw new Error("Team list cannot be empty.");
        }
        else if (teams.length < 2) {
            throw new Error("Not enough teams to form a tournament.");
        }

        this.bronze_final = new Bracket(2);
        this.winners = new Bracket(teams.length);
        this.playing = [];
        this.queued = [];
        this.ready = [];

        this.bronze_final.dep = this.winners;
        this.bronze_final.root.deps = this.winners.root.deps;

        // add another parent for winners final deps
        // to point to bronze final
        this.winners.root.deps.forEach((match) => {
            match.next.push(this.bronze_final.root);
        });

        (randomize ? permute(teams) : teams).forEach((team, i) => {
            // convert index to gray code
            let position = i ^ (i >> 1);
            let match: any = this.winners.root;

            // find match for team
            while (match.deps !== null) {
                match = match.deps[position & 1];
                position >>= 1;
            }

            // add team to match found
            match.teams.push(team);

            // add match to ready list unless already in list
            if (this.ready.indexOf(match) < 0) {
                this.ready.push(match);
            }
        });

        let completed = 0;

        Array(this.ready.length).fill(null).map((_, i) => {
            const match = this.ready[i];
            if (match.teams.length < 2) {
                const winner = match.teams[0];
                const loser = match.teams[1];
                match.meta_data["winner"] = winner;
                match.meta_data["loser"] = loser;
                match.next[0].teams.push(winner);
                if (match.next[1] !== undefined) {
                    match.next[1].teams.push(loser);
                }
                this.ready[i] = this.ready[completed];
                this.ready[completed] = match;
                completed++;
            }
        });

        this.ready = this.ready.slice(completed, this.ready.length);
    }

    play(callback) {
        this.playing = this.ready.map((match) => {
            let winner, loser;
            if (Math.floor(Math.random() * 2) == 0) {
                winner = match.teams[0];
                loser = match.teams[1];
            }
            else {
                winner = match.teams[1];
                loser = match.teams[0];
            }

            match.meta_data["winner"] = winner;
            match.meta_data["loser"] = loser;

            if (match.next !== null) {
                match.next[0].teams.push(winner);
                if (match.next[1] !== undefined) {
                    match.next[1].teams.push(loser);
                }
                match.next.map((next_match) => {
                    if (next_match.teams.length > 1) {
                        this.queued.push(next_match);
                    }
                });
            }

            return match;
        });
        this.ready = this.queued;
        this.queued = [];
    }
}
