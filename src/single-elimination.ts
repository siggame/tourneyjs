import { Bracket } from "./bracket";
import { Match } from "./match"
import { permute } from "./utilities";
import { EventEmitter } from "events";

export type LiveMatch = [number, any[], Promise<Match>]
export type Settings = { with_bronze_final: boolean, randomize: boolean }
const enum Status { Init, Playing, Paused, Stopped }

export class SingleElimination extends EventEmitter {
  playing: LiveMatch[];
  ready: Match[];
  results: Match[];

  private bronze_final: Bracket;
  private play_handler: Function;
  private play_timer: NodeJS.Timer;
  private status: Status;
  private winners: Bracket;

  constructor(
    teams: any[],
    settings: Settings = {
      with_bronze_final: false,
      randomize: false
    }) {
    super()
    if (teams.length == 0) {
      throw new Error("Team list cannot be empty.");
    }
    else if (teams.length < 2) {
      throw new Error("Not enough teams to form a tournament.");
    }
    else if (settings.with_bronze_final && teams.length == 2) {
      throw new Error("Not enough teams to have bronze final.");
    }

    this.winners = new Bracket(teams.length);
    this.playing = [];
    this.ready = [];
    this.results = [this.winners.root];
    this.status = Status.Init;

    if (settings.with_bronze_final) this.make_bronze_finals();
    this.seed_teams(settings.randomize ? permute(teams) : teams)
    this.init_ready_matches()

    this.on("ready", (match) => { this.ready.push(match) })
      .on("done", this.filter_finished_matches)
      .on("finished?", this.is_tournament_finished)
      .on("error", (err) => {
        this.pause();
        console.error(err.stack);
      });
  }

  private make_bronze_finals(): void {
    this.bronze_final = new Bracket(2);
    this.bronze_final.dep = this.winners;
    this.bronze_final.root.deps = this.winners.root.deps;

    // add another parent for winners final deps
    // to point to bronze final
    this.winners.root.deps.forEach((match) => {
      match.next.push(this.bronze_final.root);
    });
    this.results.push(this.bronze_final.root);
  }

  private seed_teams(teams: any[]): void {
    teams.forEach((team, i) => {
      // convert index to gray code
      let position = i ^ (i >> 1);
      let match: Match = this.winners.root;

      // follow gray code binary digits into position
      while (match.deps !== null) {
        match = match.deps[position & 1];
        position >>= 1;
      }

      // add team to match found
      match.teams.push(team);

      // add match to ready list unless already in list
      if (this.ready.indexOf(match) < 0) {
        this.ready.push(match);
      }
    })
  }

  private init_ready_matches(): void {
    let completed = 0

    Array(this.ready.length).fill(null).map((_, i) => {
      const match = this.ready[i];
      // only one team, apply bye
      if (match.teams.length < 2) {
        const winner = match.teams[0];
        const loser = match.teams[1];
        match.meta_data = { "winner": winner, "loser": loser };
        match.next[0].teams.push(winner);
        // notify bronze finals if necessary
        if (match.next[1] !== undefined) {
          match.next[1].teams.push(loser);
        }
        // two teams had first round bye, notify next match
        if (match.next[0].teams.length == 2) {
          this.ready.push(match.next[0])
        }
        this.ready[i] = this.ready[completed];
        this.ready[completed] = match;
        completed++;
      }
    });

    this.ready = this.ready.slice(completed, this.ready.length);
  }

  private filter_finished_matches() {
    setImmediate(_ => {
      if (Math.floor(Math.random() * 3) == 0) {
        this.playing = this.playing.filter((live_match) => {
          return live_match[2].then(match => {
            return match.meta_data === null;
          })
        });
      }
    });
  }

  private is_tournament_finished() {
    setImmediate((is_finished) => {
      if (is_finished) {
        this.playing = [];
        this.ready = [];
        this.emit("on_finished");
        this.stop();
      }
    }, this.results.reduce((accum, match) => {
      return accum && match.meta_data !== null;
    }, true))
  }

  enqueue(id: number) {
    const match = this.winners.matches[id];
    if (this.ready.indexOf(match) < 0) {
      this.ready.push(match);
      return true;
    }
    return false;
  }

  private _play() {
    this.on("play", this.play_handler);
    this.play_timer = setInterval(_ => this.emit("play"), 10);
    this.status = Status.Playing;
  }

  play(fight, success, error) {
    if (this.status == Status.Playing) return;
    else if (this.status == Status.Stopped) {
      throw new Error("Tournament has been stopped.");
    }

    this.play_handler = _ => {
      const live_matches = this.ready.map((match): LiveMatch => {
        return [
          match.id,
          match.teams,
          fight(match)
            .then(result => {
              if (!("winner" in result && "loser" in result)) {
                throw new Error("Missing meta data.")
              }
              match.meta_data = result;
              return match;
            })
            .then((match: Match) => {
              match.notify_next(
                (next_match) => { this.emit("ready", next_match) },
                _ => { this.emit("finished?") }
              )
              success(match);
              this.emit("done");
              return match;
            })
            .catch((err) => {
              this.emit("error", err);
              error(match, err);
            })
        ]
      });

      this.playing.concat(live_matches);
      this.ready = [];
    };

    this._play()
  }


  pause() {
    if (this.status == Status.Paused) return;
    clearInterval(this.play_timer);
    this.removeListener("play", this.play_handler);
    this.status = Status.Paused;
  }

  resume() {
    if (this.status == Status.Playing) return;
    else if (this.status == Status.Stopped) {
      throw new Error("Tournament has been stopped.");
    }

    this._play()
  }

  stop() {
    this.status = Status.Stopped;
    clearInterval(this.play_timer);
    this.removeAllListeners();
  }
}
