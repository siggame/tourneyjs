export class Match {
    id: number;
    teams: any[];
    next: Match[];
    deps: Match[];
    meta_data: {};

    constructor(id: number) {
        this.id = id;
        this.teams = [];
        this.next = null;
        this.deps = null;
        this.meta_data = null;
    }

    public notify_next(ready, finished) {
        if (this.next !== null) {
            const winner = this.meta_data["winner"];
            this.next[0].teams.push(winner);
            if (this.next[1] !== undefined) {
                const loser = this.meta_data["loser"];
                this.next[1].teams.push(loser);
            }
            this.next.forEach((next_match) => {
                if (next_match.teams.length > 1) {
                    ready(next_match);
                }
            });
        }
        else {
            finished();
        }
    }
}
