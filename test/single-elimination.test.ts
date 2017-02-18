import { SingleElimination as single } from "../index";
import * as should from "should";

describe("Single Elimination", () => {
  const bronze_no_rand = { with_bronze_final: true, randomize: false };
  const no_bronze_rand = { with_bronze_final: false, randomize: true };
  const bronze_rand = { with_bronze_final: true, randomize: true };

  it("should be constructable", (done) => {
    const t = new single(["abc", "def", "ghi", "lmn", "opq"]);
    done();
  });

  it("should have ready matches with two players only", (done) => {
    const t = new single(["abc", "def", "ghi", "lmn", "opq"]);
    const two_players_only = t.ready.reduce((accum, ready_match) =>
      accum && ready_match.teams.length == 2,
      true);
    two_players_only.should.be.true;
    done();
  })

  it("should not have enough ready matches", (done) => {
    const num_teams = Math.floor(Math.random() * 100 + 17);
    const t = new single(Array(num_teams).fill(null));
    const enough_matches = t.ready.length == Math.floor(num_teams / 2);
    enough_matches.should.be.true
    done();
  })

  it("should seed teams correctly without randomization", (done) => {
    const teams = [1, 2, 3, 4, 5];
    const t = new single(teams);
    should(t.ready[0].teams).deepEqual([4, 5])
    should(t.ready[1].teams).deepEqual([2, 3])
    done();
  })

  it("should allow bronze final", (done) => {
    const t = new single(["abc", "def", "ghi", "lmn", "opq"], bronze_no_rand);
    should(t.results.length).equal(2);
    done();
  });

  it("should allow randomization", (done) => {
    const t = new single(["abc", "def", "ghi", "lmn", "opq"], no_bronze_rand);
    done();
  });

  it("should not allow empty team lists", (done) => {
    const bad = () => new single([]);
    bad.should.throw("Team list cannot be empty.");
    done();
  });

  it("should not allow single team tournaments", (done) => {
    const bad = () => { new single(["ahhh"]) };
    bad.should.throw("Not enough teams to form a tournament.");
    done();
  });

  it("should not allow bronze final with two teams", (done) => {
    const bad = () => { new single(["ahhh", "woo"], bronze_no_rand) };
    bad.should.throw("Not enough teams to have bronze final.");
    done();
  });

  it("should allow tournaments with 2 teams", (done) => {
    const t = new single(Array(2).fill(null));
    t.once("on_finished", () => {
      should(t.ready).be.empty();
      done();
    });
    t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
      Promise.resolve({ "winner": match.teams[winner], "loser": match.teams[winner ^ 1] })
      , _ => { }, _ => { });
  });

  it("should be playable", (done) => {
    const t = new single(Array(1000).fill(null));
    t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
      Promise.resolve({ "winner": match.teams[winner], "loser": match.teams[winner ^ 1] })
      , _ => { }, _ => { });
    should(t.playing).not.be.empty;
    done();
  });

  it("should finish tournament", (done) => {
    const t = new single(Array(1000).fill(null), bronze_rand);
    t.once("on_finished", () => {
      should(t.ready).be.empty();
      done();
    });
    t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
      Promise.resolve({ "winner": match.teams[winner], "loser": match.teams[winner ^ 1] })
      , _ => { }, _ => { });
  });

  it("should be pausable", (done) => {
    const t = new single(Array(1000).fill(null));
    t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
      Promise.resolve({ "winner": match.teams[winner], "loser": match.teams[winner ^ 1] })
      , _ => { }, _ => { });
    t.pause();
    setImmediate(() => {
      should(t.ready).not.be.empty();
      done();
    });
  });

  it("should be resumable", (done) => {
    const t = new single(Array(1000).fill(null));
    t.once("on_finished", () => {
      should(t.ready).be.empty();
      done();
    });
    t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
      Promise.resolve({ "winner": match.teams[winner], "loser": match.teams[winner ^ 1] })
      , _ => { }, _ => { });
    t.pause();
    setImmediate(() => {
      t.resume();
    });
  });

  it("should be stoppable", (done) => {
    const t = new single(Array(1000).fill(null));
    t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
      Promise.resolve({ "winner": match.teams[winner], "loser": match.teams[winner ^ 1] })
      , _ => { }, _ => { });
    t.stop();
    const bad = () => { t.resume() };
    bad.should.throw("Tournament has been stopped.");
    done();
  });

  it("should not be playable after stopping", (done) => {
    const t = new single(Array(1000).fill(null));
    t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
      Promise.resolve({ "winner": match.teams[winner], "loser": match.teams[winner ^ 1] })
      , _ => { }, _ => { });
    t.stop();
    const bad = () => {
      t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
        Promise.resolve({ "winner": match.teams[winner], "loser": match.teams[winner ^ 1] })
        , _ => { }, _ => { });
    };
    bad.should.throw("Tournament has been stopped.");
    done();
  });

  it("should not be resumable after stopping", (done) => {
    const t = new single(Array(1000).fill(null));
    t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
      Promise.resolve({ "winner": match.teams[winner], "loser": match.teams[winner ^ 1] })
      , _ => { }, _ => { });
    t.stop();
    const bad = () => {
      t.resume();
    };
    bad.should.throw("Tournament has been stopped.");
    done();
  });

  it("should pause tournament on error", (done) => {
    const t = new single(Array(1000).fill(null));
    t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
      Promise.resolve({ "winner": match.teams[winner], "loser": match.teams[winner ^ 1] })
      , match => {
        if (match.id === 20) throw new Error("borked")
      }, (id, err) => {
        done()
      });
  });

  it("should recover tournament on error", (done) => {
    const t = new single(Array(1000).fill(null));
    t.once("on_finished", _ => done());
    t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
      Promise.resolve({ "winner": match.teams[winner], "loser": match.teams[winner ^ 1] })
      , match => {
        if (match.id === 100) throw new Error("borked")
      }, (match, err) => {
        t.ready.push(match)
        t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
          Promise.resolve({ "winner": match.teams[winner], "loser": match.teams[winner ^ 1] })
          , match => {
          }, (match, err) => {
          });
      });
  });

  it("should finish tournament with more than 1/2 teams getting a bye", (done) => {
    const t = new single(Array(1025).fill(null));
    t.once("on_finished", _ => done());
    t.play((match, winner = Math.floor(Math.random() * 2) % 2) =>
      Promise.resolve({ "winner": match.teams[winner], "loser": match.teams[winner ^ 1] })
      , match => {
      }, (match, err) => {
      });
  });
});
