import { Bracket } from "./bracket";
import { Duel } from "./duel";
import { IMatch } from "./match";
import { ITournament, Tournament } from "./tournament";
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
      if (parent >= 0) { match.next = [this.matches[parent]]; }
    });

    this.root = this.matches[0];
  }

  addLowerBracket() {
    this.dep = new SingleEliminationBracket<T>(2);
    if (this.root.deps) {
      this.root.deps.forEach((match) => {
        if (this.dep && match.next) { match.next.push(this.dep.root); }
      });
    }
  }

  prepareMatches(teams: T[]) {
    const maybeReadyMatches: Duel<T>[] = [];
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

      if (maybeReadyMatches.indexOf(match) < 0) {
        maybeReadyMatches.push(match);
      }
    });

    return maybeReadyMatches.reduce((readyMatches: Duel<T>[], match) => {
      if (match.teams.length < 2 && match.next) {
        const [winner, loser] = match.teams;
        match.metaData = { winner, losers: [loser] };
        match.update(() => { }, () => { });
        const [upper, lower] = match.next;
        if (upper && upper.teams.length === 2) {
          readyMatches.push(upper);
        }
        if (lower && lower.teams.length === 2) {
          readyMatches.push(lower);
        }
      } else {
        readyMatches.push(match);
      }
      return readyMatches;
    }, []);
  }
}

export class SingleEliminationTournament<T>
  extends Tournament<T, Duel<T>, SingleEliminationBracket<T>>
  implements ITournament<T, Duel<T>, SingleEliminationBracket<T>> {

  public bracket: SingleEliminationBracket<T>;
  public playing: Duel<T>[];
  public queued: Duel<T>[];
  public teams: T[];
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

    this.playing = [];
    this.queued = [];
    this.teams = randomize ? permute(teams) : teams;
    this.bracket = new SingleEliminationBracket<T>(teams.length);

    if (bronzeFinal) { this.bracket.addLowerBracket(); }

    // seed teams
    this.queued = this.bracket.prepareMatches(this.teams);

    this.on("enqueue", (match: Duel<T>) => this.queued.push(match));
    this.on("finished?", this._checkFinished);
    this.on("error", this._error);
  }

  private _checkFinished() {
    const { metaData: upper } = this.bracket.root;
    if (upper) {
      if (!this.bracket.dep) {
        this.emit("finished", [upper]);
      } else {
        const { metaData: lower } = this.bracket.dep.root;
        if (lower) { this.emit("finished", [upper, lower]); }
      }
    }
  }

  private _error(match: Duel<T>, error: Error) { this.pause(); }

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
