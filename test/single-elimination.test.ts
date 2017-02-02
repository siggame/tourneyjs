import * as tourney from "../index";
import * as should from "should";

describe("Single Elimination", () => {
    it("should be constructable", (done) => {
        const t = new tourney.SingleElimination(["abc", "def", "ghi", "lmn", "opq"], false, false);
        done();
    });

    it("should allow bronze final", (done) => {
        const t = new tourney.SingleElimination(["abc", "def", "ghi", "lmn", "opq"], true, false);
        should(t.results.length).equal(2);
        done();
    });

    it("should allow randomization", (done) => {
        const t = new tourney.SingleElimination(["abc", "def", "ghi", "lmn", "opq"], false, true);
        done();
    });

    it("should not allow empty team lists", (done) => {
        const bad = () => new tourney.SingleElimination([], false, false);
        bad.should.throw("Team list cannot be empty.");
        done();
    });

    it("should not allow single team tournaments", (done) => {
        const bad = () => { new tourney.SingleElimination(["ahhh"], false, false) };
        bad.should.throw("Not enough teams to form a tournament.");
        done();
    });

    it("should not allow bronze final with two teams", (done) => {
        const bad = () => { new tourney.SingleElimination(["ahhh", "woo"], true, false) };
        bad.should.throw("Not enough teams to have bronze final.");
        done();
    });

    it("should allow tournaments with 2 teams", (done) => {
        const t = new tourney.SingleElimination(Array(2).fill(null), false, false);
        t.once("on_finished", () => {
            should(t.ready).be.empty();
            done();
        });
        t.play((team_a, team_b) => {
            return Math.floor(Math.random() * 2) == 0 ?
                { "winner": team_a, "loser": team_b } : { "winner": team_b, "loser": team_a };
        }, () => { }, () => { });
    });

    it("should be playable", (done) => {
        const t = new tourney.SingleElimination(Array(10000).fill(null), false, false);
        t.play((team_a, team_b) => {
            return Math.floor(Math.random() * 2) == 0 ?
                { "winner": team_a, "loser": team_b } : { "winner": team_b, "loser": team_a };
        }, () => { }, () => { });
        should(t.playing).not.be.empty;
        done();
    });

    it("should finish tournament", (done) => {
        const t = new tourney.SingleElimination(Array(10000).fill(null), true, true);
        t.once("on_finished", () => {
            should(t.ready).be.empty();
            done();
        });
        t.play((team_a, team_b) => {
            return Math.floor(Math.random() * 2) == 0 ?
                { "winner": team_a, "loser": team_b } : { "winner": team_b, "loser": team_a };
        }, () => { }, () => { });
    });

    it("should be pausable", (done) => {
        const t = new tourney.SingleElimination(Array(10000).fill(null), false, false);
        t.play((team_a, team_b) => {
            return Math.floor(Math.random() * 2) == 0 ?
                { "winner": team_a, "loser": team_b } : { "winner": team_b, "loser": team_a };
        }, () => { }, () => { });
        t.pause();
        setImmediate(() => {
            should(t.ready).not.be.empty();
            done();
        });
    });

    it("should be resumable", (done) => {
        const t = new tourney.SingleElimination(Array(10000).fill(null), false, false);
        t.once("on_finished", () => {
            should(t.ready).be.empty();
            done();
        });
        t.play((team_a, team_b) => {
            return Math.floor(Math.random() * 2) == 0 ?
                { "winner": team_a, "loser": team_b } : { "winner": team_b, "loser": team_a };
        }, () => { }, () => { });
        t.pause();
        setImmediate(() => {
            t.resume();
        });
    });

    it("should be stoppable", (done) => {
        const t = new tourney.SingleElimination(Array(10000).fill(null), false, false);
        t.play((team_a, team_b) => {
            return Math.floor(Math.random() * 2) == 0 ?
                { "winner": team_a, "loser": team_b } : { "winner": team_b, "loser": team_a };
        }, () => { }, () => { });
        t.stop();
        const bad = () => { t.resume() };
        bad.should.throw("Tournament has been stopped.");
        done();
    });

    it("should not be playable after stopping", (done) => {
        const t = new tourney.SingleElimination(Array(10000).fill(null), false, false);
        t.play((team_a, team_b) => {
            return Math.floor(Math.random() * 2) == 0 ?
                { "winner": team_a, "loser": team_b } : { "winner": team_b, "loser": team_a };
        }, () => { }, () => { });
        t.stop();
        const bad = () => {
            t.play((team_a, team_b) => {
                return Math.floor(Math.random() * 2) == 0 ?
                    { "winner": team_a, "loser": team_b } : { "winner": team_b, "loser": team_a };
            }, () => { }, () => { });
        };
        bad.should.throw("Tournament has been stopped.");
        done();
    });
});



