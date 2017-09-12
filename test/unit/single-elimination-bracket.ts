import * as should from "should";

import { SingleEliminationBracket } from "../../src";

export default function () {
  describe("Single Elimination Bracket", () => {
    it("should be constructible", (done) => {
      const t = new SingleEliminationBracket(8);
      should(t).not.be.null;
      done();
    });

    it("should have root with no next match(es)", (done) => {
      const t = new SingleEliminationBracket(8);
      should(t.matches[0].next).be.undefined;
      done();
    });
  });
}
