import { Bracket } from "./bracket";
import { Match } from "./match"
import { permute } from "./utilities";
import { EventEmitter } from "events";

export type LiveMatch = [number, any[], Promise<Match>]

export class SingleElimination {
    playing: LiveMatch[];
    ready: Match[];
    results: Match[];

    private bronze_final: Bracket;
    private play_handler: Function;
    private play_timer: NodeJS.Timer;
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
            let match: Match = this.winners.root;

            // follow gray code binary digits into position
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
            if (match.teams.length < 2) { // only one team, apply bye
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
            this.play_timer = setImmediate(_ => this.tournament_events.emit("play"));
        }).on("done", _ => {
            setImmediate(_ => {
                if (Math.floor(Math.random() * 3) == 0) {
                    this.playing = this.playing.filter((live_match) => {
                        return live_match[2].then(match => {
                            return match.meta_data === null;
                        })
                    });
                }
            });
        }).on("finished?", _ => {
            setImmediate((is_finished) => {
                if (is_finished) {
                    this.playing = [];
                    this.ready = [];
                    this.tournament_events.emit("on_finished");
                }
            }, this.results.reduce((accum, match) => {
                return accum && match.meta_data !== null;
            }, true));
        }).on("error", (err) => {
            this.pause();
            console.error(err.stack);
        });
    }

    private make_live(match, fight) {
        return new Promise((resolve, reject) => {
            fight(match)
                .then(result => {
                    match.meta_data = result;
                    return match;
                })
                .then(resolve)
                .catch(reject)
        })
    }

    enqueue(id: number) {
        const match = this.winners.matches[id];
        if (this.ready.indexOf(match) < 0) {
            this.ready.push(match);
            return true;
        }
        return false;
    }

    play(fight, success, error) {
        if (this.tournament_events.listeners("play").length !== 0) {
            console.log("Tournament already playing.");
            return;
        }
        else if (this.tournament_events.listenerCount("error") == 0) {
            throw new Error("Tournament has been stopped.");
        }

        this.play_handler = _ => {
            const live_matches = this.ready.map((match): LiveMatch => {
                return [
                    match.id,
                    match.teams,
                    this.make_live(match, fight)
                        .then((match: Match) => {
                            if (!("winner" in match.meta_data && "loser" in match.meta_data)) {
                                throw new Error("Missing meta data.")
                            }
                            match.notify_next((next_match) => {
                                this.tournament_events.emit("ready", next_match);
                            }, _ => this.tournament_events.emit("finished?"));
                            success(match);
                            this.tournament_events.emit("done");
                            return match;
                        }).catch((err) => {
                            this.tournament_events.emit("error", err);
                            error(match, err);
                        })
                ]
            });

            this.playing.concat(live_matches);
            this.ready = [];
        };

        this.tournament_events.on("play", this.play_handler);
        this.play_timer = setImmediate(_ => this.tournament_events.emit("play"));
    }

    pause() {
        clearImmediate(this.play_timer);
        this.tournament_events.removeListener("play", this.play_handler);
    }

    resume() {
        if (this.tournament_events.listenerCount("play") > 0) {
            console.log("Tournament already playing.");
            return;
        }
        else if (this.tournament_events.listenerCount("error") == 0) {
            throw new Error("Tournament has been stopped.");
        }

        this.tournament_events.on("play", this.play_handler);
        this.play_timer = setImmediate(_ => this.tournament_events.emit("play"));
    }

    stop() {
        clearImmediate(this.play_timer);
        this.tournament_events.removeAllListeners();
    }

    once(event, callback) {
        this.tournament_events.once(event, callback);
    }
}
