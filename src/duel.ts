import { IMatch, IMatchResult, IMatchUpdateHandler, Match, MatchResult } from "./match";

/**
 * Implementation of `MatchResult`.
 * 
 * @export
 */
export class DuelResult<T> extends MatchResult<T> implements IMatchResult<T> {
    constructor() {
        super();
    }
}

/**
 * A `Match` which pits opponents head to head meaning there is one
 * winner and one loser. Optionally handles notifying a `Match` from a
 * lower `Bracket`.
 * 
 * @export
 */
export class Duel<T> extends Match<T> implements IMatch<T> {
    public deps?: Duel<T>[];
    public metaData?: DuelResult<T>;
    public next?: Duel<T>[];

    constructor(id?: number) {
        super(id);
    }

    public readonly update: IMatchUpdateHandler<T> =
    (notify, finished) => {
        if (this.next && this.metaData) {
            const [upper, lower] = this.next;
            const { winner, losers: [loser] } = this.metaData;
            let teamCount = upper.teams.push(winner);
            if (teamCount > 1) {
                notify(upper);
            }
            if (lower) {
                teamCount = lower.teams.push(loser);
                if (teamCount > 1) {
                    notify(lower);
                }
            }
        } else {
            finished();
        }
    }
}
