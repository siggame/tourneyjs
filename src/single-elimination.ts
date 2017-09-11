import { Bracket } from "./bracket";
import { Duel } from "./duel";
import { IMatch, Match } from "./match";
import { ITournamentPlayHandler, Tournament } from "./tournament";
import { permute } from "./utilities";

export interface ISingleEliminationSettings { bronzeFinal: boolean; randomize: boolean; }

export class SingleEliminationBracket<T> extends Bracket<T, Duel<T>> {
  constructor(numTeams: number) {
    super();
    const leaves = 2 ** Math.ceil(Math.log2(numTeams / 2));
    this.matches = Array(2 * leaves - 1).fill(null).map((_, i) => new Duel<T>(i));
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

export class SingleEliminationTournament<T> extends Tournament<T> {

  public teams: T[];
  private upperBracket: SingleEliminationBracket<T>;
  private lowerBracket: SingleEliminationBracket<T>;
  private playTimer: NodeJS.Timer;
  private playHandler: (match: IMatch<T>) => Promise<void>;

  constructor(
    teams: T[],
    { bronzeFinal, randomize }: ISingleEliminationSettings =
      { bronzeFinal: false, randomize: false },
  ) {
    if (teams.length === 0) {
      throw new Error("Team list cannot be empty.");
    }
    else if (teams.length < 2) {
      throw new Error("Not enough teams to form a tournament.");
    }
    else if (bronzeFinal && teams.length === 2) {
      throw new Error("Not enough teams to have bronze final.");
    }

    super((fight, success, error) => {
      // set up playing of tournament
      this.playHandler = async (match: Duel<T>) => {
        try {
          match.metaData = await fight(match).catch((e) => error(match, e));
          success(match);
          match.update((next) => {
            this.emit("play", next);
          }, () => {
            this.emit("finished", match.metaData.winner);
          });
        } catch (e) {
          this.emit("error", match, e);
        }
      };

      this._play();
      this.emit("begin");
    });

    this.upperBracket = new SingleEliminationBracket<T>(teams.length);

    // tie in bronze final if necessary    

    if (bronzeFinal) {
      this.lowerBracket = new SingleEliminationBracket<T>(2);
      this.lowerBracket.dep = this.upperBracket;
      this.lowerBracket.root.deps = this.upperBracket.root.deps;
      this.upperBracket.root.deps.forEach((match) => {
        match.next.push(this.lowerBracket.root);
      });
    }

    //seed teams

    teams.forEach((team, i) => {
      // convert index to gray code
      let position = i ^ (i >> 1);
      let match = this.upperBracket.root;

      // follow gray code binary digits into position
      while (match.deps) {
        match = match.deps[position & 1];
        position >>= 1;
      }

      // add team to match found
      match.teams.push(team);
      this.once("begin", () => { this.playHandler(match); });
    });

    this.on("error", (match: IMatch<T>, error: Error) => {
      this.pause();
      console.log(error.stack.toString());
    });
  }

  private _play(): void {
    this.on("play", this.playHandler);
    this.status = "playing";
  }

  pause() {
    if (this.status === "paused") {
      return;
    }
    this.removeListener("play", this.playHandler);
    this.status = "paused";
  }

  resume() {
    if (this.status === "playing") {
      return;
    } else if (this.status === "stopped") {
      throw new Error("Tournament has been stopped.");
    }

    this._play();
  }

  stop() {
    this.status = "stopped";
    this.removeAllListeners();
  }
}
