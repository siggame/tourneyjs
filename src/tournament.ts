import { EventEmitter } from "events";

import { Bracket } from "./bracket";
import { IMatchResult, Match } from "./match";

type TournamentStatus = "init" | "playing" | "paused" | "stopped";

export interface ITournamentPlayHandler<T> {
    (
        fight: (match: Match<T>) => Promise<IMatchResult<T>>,
        success: (match: Match<T>) => void,
        error: (match: Match<T>, error: Error) => any,
    )
        : void;
}

export interface ITournament<T> {
    status: TournamentStatus;
    play: ITournamentPlayHandler<T>;
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
}
