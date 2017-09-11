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
  public playing: Duel<T>[];
  public queued: Duel<T>[];
  private upperBracket: SingleEliminationBracket<T>;
  private lowerBracket?: SingleEliminationBracket<T>;
  private playTimer: NodeJS.Timer;
  private playHandler: () => Promise<void>;

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
      this.playHandler = async () => {
        this.queued.forEach(async (match: Duel<T>) => {
          try {
            match.metaData = await fight(match).catch((e) => error(match, e));
            success(match);
            match.update((next: Duel<T>) => {
              this.emit("enqueue", next);
            }, () => {
              this.emit("finished?");
            });
          } catch (e) {
            this.emit("error", match, e);
          }
        });
        this.playing.concat(this.queued);
      };

      this._play();
    });

    this.queued = [];
    this.playing = [];
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

    (randomize ? permute(teams) : teams).forEach((team, i) => {
      // convert index to gray code
      let position = i ^ (i >> 1);
      let match = this.upperBracket.root;

      // follow gray code binary digits into position
      while (match.deps) {
        match = match.deps[position & 1];
        position >>= 1;
      }

      // add team to match found
      const teamCount = match.teams.push(team);
      if (teamCount > 1) {
        this.queued.push(match);
      }
    });

    this.on("enqueue", (match: Duel<T>) => {
      this.queued.push(match);
    }).on("finished?", () => {
      if (this.upperBracket.root.metaData) {
        if (this.upperBracket.dep && this.upperBracket.dep.root.metaData) {
          this.emit("finished", [this.upperBracket.root.metaData, this.upperBracket.dep.root.metaData]);
        } else {
          this.emit("finished", [this.upperBracket.root.metaData]);
        }
        this.queued = [];
        this.playing = [];
        this.stop();
      }
    }).on("error", (match: IMatch<T>, error: Error) => {
      this.pause();
      console.log(error.stack.toString());
    });
  }

  private _play(): void {
    this.on("play", this.playHandler);
    this.playTimer = setInterval(() => {
      this.playing = this.playing.filter((match) => !match.metaData);
      this.emit("play");
    }, 10);
    this.status = "playing";
  }

  pause() {
    if (this.status === "paused") {
      return;
    }
    clearInterval(this.playTimer);
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
    clearInterval(this.playTimer);
    this.removeAllListeners();
  }
}
