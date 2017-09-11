import * as should from "should";

import { Duel } from "../..";

export default function () {
    describe("Duel", () => {
        it("should be constructible", () => {
            const d = new Duel(0);
            should(d).not.be.null;
        });
    });
}
