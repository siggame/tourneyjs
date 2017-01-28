// Bracket API

/*
 *Bracket internally is just a graph structure (DAG)
 *
 *A match in a bracket has the two matches it depends on
 *and then the match which depends on it. To construct
 *the bracket, simply take the number of competitors 
 *provided to the bracket (N) and find the closest
 *power of two greater than N. This will fit all of the
 *necessary matches into the dependency graph.
 *
 *Since the majority of the time N will not be a power
 *of two it will be necessary for some competitors to
 *get a first round by. The number of competitors to get
 *a by will be the size of the graph minus N. 
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

class Match {
    public teams: any[];
    public next: Match[];
    public deps: Match[];
    public meta_data: {};

    constructor() {
        this.teams = [];
        this.next = null;
        this.deps = null;
        this.meta_data = {};
    }
}

export class Bracket {
    public root: Match;
    public dep: Bracket;
    public matches: Match[];

    constructor(num_teams: number) {
        let leaves = Math.ceil(Math.log2(num_teams / 2));

        if (leaves !== Math.log2(num_teams / 2) || leaves == 0) {
            leaves += 1;
        }

        this.matches = Array.apply(null, { length: 2 * leaves - 1 }).map(_ => {
            return new Match();
        });

        this.matches.forEach((match, i) => {
            if ((2 * i + 1) < this.matches.length) {
                match.deps = [this.matches[2 * i + 1], this.matches[2 * i + 2]];
            }
            const parent = Math.floor((i - 1) / 2);
            match.next = parent >= 0 ? [this.matches[parent]] : null;
        });

        this.root = this.matches[0];
        this.root.next = null;
        this.dep = null;
    }

    public dep_list(id: number): Match[] {
        return this.matches[id].deps;
    }
}
