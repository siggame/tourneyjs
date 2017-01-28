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
        const t = new tourney.SingleElimination(["abc", "def", "ghi", "lmn", "opq"], false);
        t.play(undefined);
        should(t.playing).not.be.empty;
        done();
    });

    it('should finish tournament', (done) => {
        const t = new tourney.SingleElimination(Array(1000).fill(null), false);
        while (t.ready.length > 0) {
            t.play(null);
        }
        should(t.ready).be.empty();
        should(t.queued).be.empty();
        done();
    });
});



