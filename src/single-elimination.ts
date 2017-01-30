import { Bracket } from "./bracket";
import { permute } from "./permute";
import { EventEmitter } from "events";

export class SingleElimination {
    private bronze_final: Bracket;
    public playing: any[];
    public ready: any[];
    public results: any[];
    private tournament_events: EventEmitter;
    private winners: Bracket;

    constructor(teams: any[], randomize: boolean) {
        if (teams.length == 0) {
            throw new Error("Team list cannot be empty.");
        }
        else if (teams.length < 2) {
            throw new Error("Not enough teams to form a tournament.");
        }

        this.bronze_final = new Bracket(2);
        this.tournament_events = new EventEmitter();
        this.winners = new Bracket(teams.length);
        this.playing = [];
        this.ready = [];
        this.results = [this.winners.root, this.bronze_final.root];

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

        // remove matches which are effectively "bye"s
        let completed = 0;

        Array(this.ready.length).fill(null).map((_, i) => {
            const match = this.ready[i];
            if (match.teams.length < 2) {
                const winner = match.teams[0];
                const loser = match.teams[1];
                match.meta_data = { "winner": winner, "loser": loser };
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

        this.tournament_events.on("ready", (match) => {
            this.ready.push(match);
            //TODO: have play event be emitted periodically
            this.tournament_events.emit("play");
        });

        this.tournament_events.on("done", () => {
            if (Math.floor(Math.random() * 3) == 0) {
                this.playing = this.playing.filter((match) => {
                    return match.meta_data === null;
                });
            }
        });

        this.tournament_events.on("finished?", () => {
            if (this.winners.root.meta_data !== null
                && this.bronze_final.root.meta_data !== null) {
                this.playing = [];
                this.ready = [];
                this.tournament_events.emit("on_finished");
            }
        });
    }

    play(callback) {
        if (this.tournament_events.listeners("play").length !== 0) {
            console.log("Play event already registered. Remove the event before calling play.");
            return;
        }

        this.tournament_events.on("play", () => {
            this.playing.concat(this.ready.map((match) => {
                return [match.teams, new Promise((res, rej) => {
                    const result = callback(match.teams[0], match.teams[1]);
                    if (result.error === undefined) {
                        match.meta_data = result;
                        res(match);
                    }
                    else {
                        rej(result.error);
                    }
                }).then((match: any) => {
                    if (match.next !== null) {
                        match.next[0].teams.push(match.meta_data.winner);
                        if (match.next[1] !== undefined) {
                            match.next[1].teams.push(match.meta_data.loser);
                        }
                        match.next.forEach((next_match) => {
                            if (next_match.teams.length > 1) {
                                this.tournament_events.emit("ready", next_match);
                            }
                        });
                    }
                    else { // root of bracket, check if the tournament is finished
                        this.tournament_events.emit("finished?");
                    }
                    this.tournament_events.emit("done");
                }).catch((err) => {
                    //TODO: Implement error handling/recovery
                    console.log(err, "should emit error event in order to notify "
                        + "that the tournament has an issue");
                })];
            }));
            this.ready = [];
        });
        this.tournament_events.emit("play");
    }

    pause() {
        //TODO: Implement pausing of tournaments
        console.log("rip"); //much professional
    }

    resume() {
        //TODO: Implement resuming of tournaments
        console.log("rip"); //much professional
    }

    stop() {
        //TODO: Throw error after stopping tournament
        this.tournament_events.removeAllListeners();
    }

    once(event, callback) {
        this.tournament_events.once(event, callback);
    }
}
