import * as should from "should";

import { permute } from "../../src/utilities";

export default function () {

  describe("Permute", () => {
    it("should not alter original list", (done) => {
      const list = [1, 2, 3, 4, 5];
      permute(list);
      should(list).be.equal(list);
      done();
    });

    it("should return new list", (done) => {
      const list = [1, 2, 3, 4, 5];
      const permutation = permute(list);
      should(list).be.not.equal(permutation);
      done();
    });
  });

}
