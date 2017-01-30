import * as tourney from "../index";
import * as should from "should";

describe('Single Elimination', () => {
    it("should be constructable", (done) => {
        const t = new tourney.SingleElimination(["abc", "def", "ghi", "lmn", "opq"], false);
        done();
    });

    it("should not allow empty team lists", (done) => {
        const bad = () => new tourney.SingleElimination([], false);
        bad.should.throw();
        done();
    });

    it("should not allow single team tournaments", (done) => {
        const bad = () => { new tourney.SingleElimination(["ahhh"], false) };
        bad.should.throw();
        done();
    });

    it('should be playable', (done) => {
        const t = new tourney.SingleElimination(Array(10000).fill(null), false);
        t.play((team_a, team_b) => {
            return Math.floor(Math.random() * 2) == 0 ?
                { "winner": team_a, "loser": team_b } : { "winner": team_b, "loser": team_a };
        });
        should(t.playing).not.be.empty;
        done();
    });

    it('should finish tournament', (done) => {
        const t = new tourney.SingleElimination(Array(10000).fill(null), false);
        t.once('on_finished', () => {
            should(t.ready).be.empty();
            done();
        });
        t.play((team_a, team_b) => {
            return Math.floor(Math.random() * 2) == 0 ?
                { "winner": team_a, "loser": team_b } : { "winner": team_b, "loser": team_a };
        });
    });
});



