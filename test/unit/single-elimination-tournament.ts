import * as should from "should";
import { Duel, IMatchResult, ISingleEliminationSettings as ises, SingleEliminationTournament as single } from "../../src";

export default function () {
  describe("Single Elimination Tournament", function () {
    this.timeout(10000);
    const bronzeNoRand: ises = { bronzeFinal: true, randomize: false };
    const noBronzeRand: ises = { bronzeFinal: false, randomize: true };
    const bronzeRand: ises = { bronzeFinal: true, randomize: true };

    it("should be constructible", (done) => {
      const t = new single(["abc", "def", "ghi", "lmn", "opq"]);
      should(t).not.be.null;
      done();
    });

    it("should have ready matches with two players only", (done) => {
      const t = new single(["abc", "def", "ghi", "lmn", "opq"]);
      const twoPlayersOnly = t.queued.length === 2;
      twoPlayersOnly.should.be.true;
      done();
    });

    it("should have enough ready matches", (done) => {
      const numTeams = Math.floor(Math.random() * 100 + 17);
      const t = new single(Array(numTeams).fill(null));
      const enoughMatches = t.queued.length === Math.floor(numTeams / 2);
      enoughMatches.should.be.true;
      done();
    });

    it("should allow bronze final", (done) => {
      const t = new single(["abc", "def", "ghi", "lmn", "opq"], bronzeNoRand);
      t.when("finished", ([upper, lower]: IMatchResult<string>[]) => {
        should(upper.winner).not.be.null;
        should(upper.losers).be.lengthOf(1);
        should(lower.winner).not.be.null;
        should(lower.losers).be.lengthOf(1);
        done();
      });
      t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
        Promise.resolve({ winner: match.teams[winner], losers: [match.teams[winner ^ 1]] }),
        () => { },
        () => { },
      );
    });

    it("should allow randomization", (done) => {
      const teams = ["abc", "def", "ghi", "lmn", "opq"];
      const t = new single(teams, noBronzeRand);
      should(t.teams).not.be.deepEqual(teams);
      done();
    });

    it("should not allow empty team lists", (done) => {
      const bad = () => new single([]);
      bad.should.throw("Team list cannot be empty.");
      done();
    });

    it("should not allow single team tournaments", (done) => {
      const bad = () => { new single(["ahhh"]); };
      bad.should.throw("Not enough teams to form a tournament.");
      done();
    });

    it("should not allow bronze final with two teams", (done) => {
      const bad = () => { new single(["ahhh", "woo"], bronzeNoRand); };
      bad.should.throw("Not enough teams to have bronze final.");
      done();
    });

    it("should allow tournaments with 2 teams", (done) => {
      const t = new single(Array(2).fill(null));
      t.when("finished", ([upper, lower]) => {
        should(upper.winner).be.null;
        done();
      });
      t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
        Promise.resolve({ winner: match.teams[winner], losers: [match.teams[winner ^ 1]] })
        , _ => { }, _ => { });
    });

    it("should be playable", (done) => {
      const t = new single(Array(1000).fill(null));
      t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
        Promise.resolve({ winner: match.teams[winner], losers: [match.teams[winner ^ 1]] })
        , _ => { }, _ => { });
      should(t.playing).not.be.empty;
      t.on("finished", () => {
        done();
      });
    });

    it("should finish tournament", (done) => {
      const t = new single(Array(1000).fill(null), bronzeRand);
      t.when("finished", ([upper, lower]) => {
        should(upper.winner).be.null;
        done();
      });
      t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
        Promise.resolve({ winner: match.teams[winner], losers: [match.teams[winner ^ 1]] })
        , _ => { }, _ => { });
    });

    it("should be pausable", (done) => {
      const t = new single(Array(1000).fill(null));
      t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
        Promise.resolve({ winner: match.teams[winner], losers: [match.teams[winner ^ 1]] })
        , _ => { }, _ => { });
      t.pause();
      setImmediate(() => {
        should(t.queued).not.be.empty();
        done();
      });
    });

    it("should be resumable", (done) => {
      const t = new single(Array(1000).fill(null));
      t.when("finished", ([upper, lower]) => {
        should(upper.winner).be.null;
        done();
      });
      t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
        Promise.resolve({ winner: match.teams[winner], losers: [match.teams[winner ^ 1]] })
        , _ => { }, _ => { });
      t.pause();
      setImmediate(() => {
        t.resume();
      });
    });

    it("should be stoppable", (done) => {
      const t = new single(Array(1000).fill(null));
      t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
        Promise.resolve({ winner: match.teams[winner], losers: [match.teams[winner ^ 1]] })
        , _ => { }, _ => { });
      t.stop();
      const bad = () => { t.resume(); };
      bad.should.throw("Tournament has been stopped.");
      done();
    });

    it("should not be playable after stopping", (done) => {
      const t = new single(Array(1000).fill(null));
      t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
        Promise.resolve({ winner: match.teams[winner], losers: [match.teams[winner ^ 1]] })
        , _ => { }, _ => { });
      t.stop();
      const bad = () => {
        t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
          Promise.resolve({ winner: match.teams[winner], losers: [match.teams[winner ^ 1]] })
          , _ => { }, _ => { });
      };
      bad.should.throw("Tournament has been stopped.");
      done();
    });

    it("should not be resumable after stopping", (done) => {
      const t = new single(Array(1000).fill(null));
      t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
        Promise.resolve({ winner: match.teams[winner], losers: [match.teams[winner ^ 1]] })
        , _ => { }, _ => { });
      t.stop();
      const bad = () => {
        t.resume();
      };
      bad.should.throw("Tournament has been stopped.");
      done();
    });

    it("should pause tournament on error", (done) => {
      const t = new single<null>(Array(1000).fill(null));
      t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
        Promise.resolve({ winner: match.teams[winner], losers: [match.teams[winner ^ 1]] })
        , (match) => {
          if (match.id === 20) throw new Error("borked");
        }, (match, err) => {
          done();
        });
      t.when("finished", () => {
        should(1).not.equal(1, "Tournament was able to finish despite being paused.");
        done();
      });
    });

    it("should recover tournament on error", (done) => {
      const t = new single(Array(1000).fill(null));
      t.when("finished", () => done());
      t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
        Promise.resolve({ winner: match.teams[winner], losers: [match.teams[winner ^ 1]] })
        , match => {
          if (match.id === 100) throw new Error("borked");
        }, (match: Duel<any>, err) => {
          t.queued.push(match);
          t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
            Promise.resolve({ winner: match.teams[winner], losers: [match.teams[winner ^ 1]] }),
            (match) => { },
            (match, err) => { });
        });
    });

    it("should finish tournament with more than 1/2 teams getting a bye", (done) => {
      const t = new single(Array(1025).fill(null));
      t.when("finished", () => done());
      t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
        Promise.resolve({ winner: match.teams[winner], losers: [match.teams[winner ^ 1]] }),
        (match) => { },
        (match, err) => { },
      );
    });
  });
}
