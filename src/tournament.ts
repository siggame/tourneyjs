import { EventEmitter } from "events";

import { IMatchResult, Match } from "./match";

export type TournamentStatus = "init" | "playing" | "paused" | "stopped";
export type TournamentEvents = "error" | "finished" | "ready";

export interface ITournamentPlayHandler<T> {
    (
        fight: (match: Match<T>) => Promise<IMatchResult<T>>,
        success: (match: Match<T>) => void,
        error: (match: Match<T>, error: Error) => any,
    )
        : void;
}

export interface ITournamentEventHandler<T> {
    (event: TournamentEvents, cb: (...args: any[]) => any): Tournament<T>;
}

export interface ITournament<T> {
    status: TournamentStatus;
    play: ITournamentPlayHandler<T>;
    when: ITournamentEventHandler<T>;
    pause(): void;
    resume(): void;
    stop(): void;
}

export abstract class Tournament<T> extends EventEmitter implements ITournament<T>{

    constructor(
        public play: ITournamentPlayHandler<T> = () => { },
        public status: TournamentStatus = "init",
    ) {
        super();
    }

    pause(): void { }
    resume(): void { }
    stop(): void { }
    when: ITournamentEventHandler<T> = (event, cb) => this.once(event, cb);
}
