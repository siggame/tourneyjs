import { IMatch, IMatchResult, IMatchUpdateHandler, Match } from "./match";

export class Duel<T> extends Match<T> implements IMatch<T> {

    public deps?: Duel<T>[];
    public next?: Duel<T>[];
    public metaData: IMatchResult<T>;

    constructor(id: number) {
        super(id);
    }

    public update: IMatchUpdateHandler<T> =
    (notify, finished) => {
        if (this.next) {
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
