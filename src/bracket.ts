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

import { Match } from "./match"

export class Bracket {
  root: Match;
  dep: Bracket;
  matches: Match[];

  constructor(num_teams: number) {
    let leaves = 2 ** Math.ceil(Math.log2(num_teams / 2));

    this.matches = Array(2 * leaves - 1).fill(null).map((_, i) => {
      return new Match(i);
    });

    this.matches.forEach((match, i) => {
      if ((2 * i + 2) < this.matches.length) {
        match.deps = [this.matches[2 * i + 1], this.matches[2 * i + 2]];
      }
      const parent = Math.floor((i - 1) / 2);
      match.next = parent >= 0 ? [this.matches[parent]] : null;
    });

    this.root = this.matches[0];
    this.dep = null;
  }
}
