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

    it("should implement toString correctly", (done) => {
      const t = new SingleEliminationBracket(8);
      should(t.toString()).equal("\t\t[ 6, ]\n\t[ 2, ]\n\t\t[ 5, ]\n[ 0, ]\n\t\t[ 4, ]\n\t[ 1, ]\n\t\t[ 3, ]");
      done();
    });
  });
}
