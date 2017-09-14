import { IMatch, Match } from "./match";

export interface IBracket<T, U extends IMatch<T>> {
  root: U;
  dep?: IBracket<T, U>;
  matches: U[];
  toString(): string;
}

export abstract class Bracket<T, U extends Match<T>> implements IBracket<T, U> {
  public root: U;
  public dep?: Bracket<T, U>;
  public matches: U[];

  constructor() { }

  toString() {
    const matchToString = (match: IMatch<T>, level: number): string => {
      const [left, right] = match.deps || [undefined, undefined];
      const currentMatch = `${Array(level).fill("\t").join("")}${match.toString()}`;
      if (left && right) {
        return `${matchToString(right, level + 1)}\n${currentMatch}\n${matchToString(left, level + 1)}`;
      } else {
        return `${currentMatch}`;
      }
    };

    return matchToString(this.root, 0);
  }
}
