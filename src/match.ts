export interface IMatchUpdateHandler<T> {
  (notify: (next: IMatch<T>) => void, finished: () => void): void;
}

export interface IMatchResult<T> {
  losers: T[];
  winner: T;
  toString(buffer: number): string;
}

export interface IMatch<T> {
  deps?: IMatch<T>[];
  id: number;
  metaData?: IMatchResult<T>;
  next?: IMatch<T>[];
  teams: T[];
  toString(): string;
  update: IMatchUpdateHandler<T>;
}

export abstract class MatchResult<T> implements IMatchResult<T> {
  public losers: T[];
  public winner: T;
  constructor() { }
  toString(buffer: number) { return `{ winner: ${this.winner} losers: ${this.losers} }`; }
}

export abstract class Match<T> implements IMatch<T> {
  public deps?: IMatch<T>[];
  public metaData?: IMatchResult<T>;
  public next?: IMatch<T>[];
  public teams: T[];

  constructor(public id: number = -1) {
    this.teams = [];
  }

  toString() { return `[ ${[this.id, this.metaData]} ]`; }
  update: IMatchUpdateHandler<T> = () => { };
}
