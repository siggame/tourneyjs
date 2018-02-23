import { IMatch, Match } from "./match";

export interface IBracket<T, U extends IMatch<T> = Match<T>> {
  root: U;
  dep?: IBracket<T, U>;
  matches: U[];
  toString(): string;
}

/**
 * Base `Bracket`
 * 
 * @export
 */
export abstract class Bracket<T, U extends IMatch<T> = Match<T>> {
  public root!: U;
  public dep?: Bracket<T, U>;
  public matches!: U[];

  toString() {
    const matchToString = (match: IMatch<T>, level: number): string => {
      const [left, right] = match.deps == null ? [undefined, undefined] : match.deps;
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
