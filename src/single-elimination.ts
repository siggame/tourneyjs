import { Bracket } from "./bracket";
import { permute } from "./permute";
import { EventEmitter } from "events";

//TODO: Have a better method for preventing play after stopping

export class SingleElimination {
    public playing: any[];
    public ready: any[];
    public results: any[];
    private bronze_final: Bracket;
    private play_event: Function;
    private tournament_events: EventEmitter;
    private winners: Bracket;

    constructor(teams: any[], with_bronze_final: boolean, randomize: boolean) {
        if (teams.length == 0) {
            throw new Error("Team list cannot be empty.");
        }
        else if (teams.length < 2) {
            throw new Error("Not enough teams to form a tournament.");
        }
        else if (with_bronze_final && teams.length == 2) {
            throw new Error("Not enough teams to have bronze final.");
        }

        this.winners = new Bracket(teams.length);
        this.playing = [];
        this.ready = [];
        this.results = [this.winners.root];
        this.tournament_events = new EventEmitter();

        if (with_bronze_final) {
            this.bronze_final = new Bracket(2);
            this.bronze_final.dep = this.winners;
            this.bronze_final.root.deps = this.winners.root.deps;

            // add another parent for winners final deps
            // to point to bronze final
            this.winners.root.deps.forEach((match) => {
                match.next.push(this.bronze_final.root);
            });
            this.results.push(this.bronze_final.root);
        }

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
        }).on("done", () => {
            setImmediate(() => {
                if (Math.floor(Math.random() * 3) == 0) {
                    this.playing = this.playing.filter((match) => {
                        return match.meta_data === null;
                    });
                }
            });
        }).on("finished?", () => {
            setImmediate(() => {
                const is_finished = this.results.reduce((res, match) => {
                    return res && match.meta_data !== null;
                }, true);
                if (is_finished) {
                    this.playing = [];
                    this.ready = [];
                    this.tournament_events.emit("on_finished");
                }
            });
        }).on("error", () => {
            console.log("A spooky error.");
        });
    }

    play(fight, success, error) {
        if (this.tournament_events.listeners("play").length !== 0) {
            console.log("Tournament already playing.");
            return;
        }
        else if (this.tournament_events.listenerCount("error") == 0) {
            throw new Error("Tournament has been stopped.");
        }

        // TODO: refactor this so it isn't GROSS
        this.play_event = () => {
            this.playing.concat(this.ready.map((match) => {
                return [match.teams, new Promise((res, rej) => {
                    const result = fight(match.teams[0], match.teams[1]);
                    if (result.error === undefined) {
                        match.meta_data = result;
                        res(match);
                    }
                    else {
                        rej({ match: match, error: result.error });
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
                    success(match);
                    this.tournament_events.emit("done");
                }).catch((err) => {
                    //TODO: Implement error handling/recovery
                    error(err.match, err.error);
                })];
            }));
            this.ready = [];
        };

        this.tournament_events.on("play", this.play_event);
        this.tournament_events.emit("play");
    }

    pause() {
        this.tournament_events.removeListener("play", this.play_event);
    }

    resume() {
        if (this.tournament_events.listenerCount("play") > 0) {
            console.log("Tournament already playing.");
            return;
        }
        else if (this.tournament_events.listenerCount("error") == 0) {
            throw new Error("Tournament has been stopped.");
        }

        this.tournament_events.on("play", this.play_event);
        this.tournament_events.emit("play");
    }

    status() {
        //TODO: Implement status reporting of tournaments
        // perhaps allow something to register to an event
        // and be updated when changes are made
        console.log("rip"); //much professional
    }

    stop() {
        this.tournament_events.removeAllListeners();
    }

    once(event, callback) {
        this.tournament_events.once(event, callback);
    }
}
