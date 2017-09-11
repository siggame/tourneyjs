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
            const [nextMatch] = this.next;
            const winner = this.metaData.winner;
            const teamCount = nextMatch.teams.push(winner);
            if (teamCount > 1) {
                notify(nextMatch);
            }
        } else {
            finished();
        }
    }
}
