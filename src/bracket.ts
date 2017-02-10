// Bracket Type

/*
 *Bracket internally is just a graph structure (DAG)
 *
 *A match in a bracket has the two matches it depends on
 *and then the match which depends on it. To construct
 *the bracket, simply take the number of competitors 
 *provided to the bracket (N), divide by two, then find 
 *the closest power of two greater than floor(N/2). This 
 *will fit all of the necessary matches into the 
 *dependency graph.
 *
 *Since the majority of the time N will not be a power
 *of two it will be necessary for some competitors to
 *get a first round bye. The number of competitors to get
 *a bye will be the size of the graph minus N. 
 *
 *Things the bracket MUST support:
 *
 * -- matches that are ready to be played
 * -- asynchronous updates of the bracket
 *
 *Nice things the bracket should support:
 *
 * -- importing/exporting JSON
 * -- querying dependency graph
 * 
 *
 *
 */

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

export class Bracket {
    root: Match;
    dep: Bracket;
    matches: Match[];

    constructor(num_teams: number) {
        let leaves = Math.ceil(Math.log2(num_teams / 2));

        if (leaves !== Math.log2(num_teams / 2) || leaves == 0) {
            leaves += 1;
        }

        this.matches = Array(2 * leaves - 1).fill(null).map((_, i) => {
            return new Match(i);
        });

        this.matches.forEach((match, i) => {
            if ((2 * i + 1) < this.matches.length) {
                match.deps = [this.matches[2 * i + 1], this.matches[2 * i + 2]];
            }
            const parent = Math.floor((i - 1) / 2);
            match.next = parent >= 0 ? [this.matches[parent]] : null;
        });

        this.root = this.matches[0];
        this.dep = null;
    }
}
