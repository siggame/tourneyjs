export interface IMatchUpdateHandler<T> {
  (notify: (next: IMatch<T>) => void, finished: () => void): void;
}

export interface IMatch<T> {
  id: number;
  teams: T[];
  next?: IMatch<T>[];
  deps?: IMatch<T>[];
  update: IMatchUpdateHandler<T>;
}

export interface IMatchResult<T> {
  winner: T;
  losers: T[];
}

export abstract class Match<T> implements IMatch<T> {
  public teams: T[];
  public next?: Match<T>[];
  public deps?: Match<T>[];

  constructor(public id: number) {
    this.id = id;
    this.teams = [];
  }

  update: IMatchUpdateHandler<T> = () => { };
}
