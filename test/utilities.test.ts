import { permute } from "../src/utilities";
import * as should from "should";

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
