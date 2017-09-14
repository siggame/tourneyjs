import { EventEmitter } from "events";

import { IBracket } from "./bracket";
import { IMatch, IMatchResult } from "./match";

export type TournamentStatus = "init" | "playing" | "paused" | "stopped";
export type TournamentEvents = "error" | "finished" | "ready";

export interface ITournamentPlayHandler<T> {
    (
        fight: (match: IMatch<T>) => Promise<IMatchResult<T>>,
        success: (match: IMatch<T>) => void,
        error: (match: IMatch<T>, error: Error) => any,
    )
        : void;
}

export interface ITournamentEventHandler<T, U extends IMatch<T>, V extends IBracket<T, U>> {
    (event: TournamentEvents, cb: (...args: any[]) => any): ITournament<T, U, V>;
}

export interface ITournament<T, U extends IMatch<T>, V extends IBracket<T, U>> extends EventEmitter {
    bracket: V;
    status: TournamentStatus;
    play: ITournamentPlayHandler<T>;
    when: ITournamentEventHandler<T, U, V>;
    pause(): void;
    resume(): void;
    stop(): void;
    toString(): string;
}

export abstract class Tournament<T, U extends IMatch<T>, V extends IBracket<T, U>> extends EventEmitter implements ITournament<T, U, V>{

    public bracket: V;

    constructor(
        public play: ITournamentPlayHandler<T> = () => { },
        public status: TournamentStatus = "init",
    ) {
        super();
    }

    pause(): void { }
    resume(): void { }
    stop(): void { }
    toString(): string { return `status: ${this.status}\n${this.bracket}`; }
    when: ITournamentEventHandler<T, U, V> = (event, cb) => this.once(event, cb);
}
