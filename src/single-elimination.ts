import { Bracket } from "./bracket";
import { Duel } from "./duel";
import { IMatch, Match } from "./match";
import { ITournamentEventHandler, ITournamentPlayHandler, Tournament } from "./tournament";
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

  prepareMatches(teams: T[]) {
    const readyMatches: Duel<T>[] = [];
    teams.forEach((team, i) => {
      // convert index to gray code
      let position = i ^ (i >> 1);
      let match = this.root;

      // follow gray code binary digits into position
      while (match.deps) {
        match = match.deps[position & 1];
        position >>= 1;
      }

      // add team to match found
      match.teams.push(team);

      if (readyMatches.indexOf(match) < 0) {
        readyMatches.push(match);
      }
    });

    return readyMatches.reduce((acc: Duel<T>[], match) => {
      if (match.teams.length < 2) {
        const [winner, loser] = match.teams;
        match.metaData = { winner, losers: [loser] };
        match.update(() => { }, () => { });
        const [upper, lower] = match.next;
        if (upper && upper.teams.length === 2) {
          acc.push(upper);
        }
        if (lower && lower.teams.length === 2) {
          acc.push(lower);
        }
      } else {
        acc.push(match);
      }
      return acc;
    }, []);
  }
}

export class SingleEliminationTournament<T> extends Tournament<T> {

  public teams: T[];
  public playing: Duel<T>[];
  public queued: Duel<T>[];
  private upperBracket: SingleEliminationBracket<T>;
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
      if (this.status === "stopped") {
        throw new Error("Tournament has been stopped.");
      }

      this.playHandler = async () => {
        this.queued.forEach(async (match: Duel<T>) => {
          try {
            match.metaData = await fight(match).catch((e) => { throw e; });
            success(match);
            match.update((next: Duel<T>) => {
              this.emit("enqueue", next);
            }, () => {
              this.emit("finished?");
            });
          } catch (e) {
            this.emit("error", match, e);
            error(match, e);
          }
        });
        this.playing.concat(this.queued);
        this.queued = [];
      };

      this.pause();
      this._play();
    });

    this.when = (event, cb) => this.once(event, cb);
    this.queued = [];
    this.playing = [];
    this.upperBracket = new SingleEliminationBracket<T>(teams.length);

    if (bronzeFinal) {
      this.upperBracket.dep = new SingleEliminationBracket<T>(2);
      this.upperBracket.dep.root.deps = this.upperBracket.root.deps;
      this.upperBracket.root.deps.forEach((match) => {
        match.next.push(this.upperBracket.dep.root);
      });
    }

    // seed teams
    this.queued = this.upperBracket.prepareMatches(randomize ? permute(teams) : teams);

    this.on("enqueue", (match: Duel<T>) => this.queued.push(match));
    this.on("finished?", this._checkFinished);
    this.on("error", this._error);
  }

  private _checkFinished() {
    const { metaData: upper } = this.upperBracket.root;
    if (upper) {
      if (this.upperBracket.dep) {
        const { root: { metaData: lower } } = this.upperBracket.dep;
        this.emit("finished", [upper, lower]);
      } else {
        this.emit("finished", [upper]);
      }
      this.stop();
    }
  }

  private _error(match: IMatch<T>, error: Error) { this.pause(); }

  private _play(): void {
    this.on("play", this.playHandler);
    this.playTimer = setInterval(() => {
      this.playing = this.playing.filter((match) => !match.metaData);
      this.emit("play");
    }, 0);
    this.status = "playing";
  }

  pause() {
    clearInterval(this.playTimer);
    this.removeListener("play", this.playHandler);
    this.status = "paused";
  }

  resume() {
    if (this.status === "stopped") {
      throw new Error("Tournament has been stopped.");
    } else if (this.status === "paused") {
      this._play();
    }
  }

  stop() {
    this.status = "stopped";
    clearInterval(this.playTimer);
    this.removeAllListeners();
  }
}
