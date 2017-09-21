import { EventEmitter } from "events";

import { Bracket, IBracket } from "./bracket";
import { IMatch, IMatchResult, Match, MatchResult } from "./match";

export type TournamentStatus = "init" | "playing" | "paused" | "stopped";
export type TournamentEvents = "error" | "finished" | "ready";

export interface ITournamentUpdateHandler<T, U extends IMatch<T> = Match<T>> {
    (
        fight: (match: U) => Promise<IMatchResult<T>>,
        success: (match: U) => void,
        error: (match: U, error: Error) => any,
    ): void;
}

export interface ITournament<T, U extends IMatch<T> = Match<T>, V extends IBracket<T, U> = Bracket<T, U>>
    extends EventEmitter {
    readonly bracket: V;
    readonly status: TournamentStatus;
    readonly play: ITournamentUpdateHandler<T, U>;
    when(event: TournamentEvents, cb: (...args: any[]) => any): ITournament<T>;
    pause(): void;
    resume(): void;
    stop(): void;
    toString(): string;
}

export abstract class Tournament<T, U extends IMatch<T> = Match<T>, V extends IBracket<T, U> = Bracket<T, U>>
    extends EventEmitter {

    public abstract bracket: V;

    constructor(
        public readonly play: ITournamentUpdateHandler<T, U>,
        public status: TournamentStatus = "init",
    ) {
        super();
    }

    abstract pause(): void;
    abstract resume(): void;
    abstract stop(): void;
    toString(): string { return `status: ${this.status}\n${this.bracket}`; }
    when(event: TournamentEvents, cb: (...args: any[]) => any) { return this.once(event, cb); }
}
