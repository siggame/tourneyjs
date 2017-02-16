// Type definitions for [tourneyjs] [0.0.1]
// Project: [Tourneyjs]
// Definitions by: [Quincy Conduff] <[https://github.com/user404d]>

/*~ You can declare types that are available via importing the module */

export type LiveMatch = [number, any[], Promise<Match>]

export interface Bracket {
    root: Match
    dep: Bracket
    matches: Match[]
    constructor(num_teams: number): Bracket
}

export interface Match {
    id: number
    teams: any[]
    next: Match
    deps: Match[]
    meta_data: {}
    notify_next(ready: Function, finished: Function): void
    constructor(id: number): Match
}

export interface SingleElimination {
    playing: LiveMatch[]
    ready: Match[]
    results: Match[]
}

