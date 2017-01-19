// Bracket API

/*
 *Bracket internally is just a tree structure
 *
 *A match in a bracket has the two matches it depends on
 *and then the match which depends on it. To construct
 *the bracket, simply take the number of competitors 
 *provided to the bracket (N) and find the closest
 *power of two greater than N. This will fit all of the
 *necessary matches into the dependency tree. 
 *
 *Since the majority of the time N will not be a power
 *of two it will be necessary for some competitors to
 *get a first round by. The number of competitors to get
 *a by will be the size of the tree minus N. 
 *
 *Things the bracket MUST support:
 *
 * -- matches that are ready to be played
 * -- asynchronous updates of the bracket
 *
 *Nice things the bracket should support:
 *
 * -- importing/exporting JSON
 * -- querying dependency tree
 * 
 *
 *
 */

class Match {
    public teams: {};
    public winner: string;
    public meta_data: {};

    constructor() {
        this.teams = {};
        this.winner = null;
        this.meta_data = {};
    }
}

export class Bracket {
    private t: Match[];
    public ready: [number, Match][];

    constructor(num_teams: number) {
        let leaves = Math.floor(Math.log2(num_teams));

        if (leaves !== Math.log2(num_teams)) {
            leaves += 1;
        }

        this.t = Array<Match>(2 * leaves - 1);
    }

    matches_required(id: number): Match[][] {
        if (this.t[id].winner === null) {
            return [];
        }

        let children = [2 * id + 1, 2 * id + 2];
        let deps = [children.map(x => this.t[x])];

        return deps;
    }
}
