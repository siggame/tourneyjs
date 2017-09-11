import { IMatch, Match } from "./match";

export interface IBracket<T, U extends IMatch<T>> {
  root: U;
  dep?: IBracket<T, U>;
  matches: U[];
}

export abstract class Bracket<T, U extends Match<T>> implements IBracket<T, U> {
  public root: U;
  public dep?: Bracket<T, U>;
  public matches: U[];

  constructor() { }
}
