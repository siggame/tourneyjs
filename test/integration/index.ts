import * as should from "should";

export default () => {

    describe("Integration Tests |", () => {
        it("should be sane", (done) => {
            should(1).be.equal(1);
            done();
        });
    });

};
