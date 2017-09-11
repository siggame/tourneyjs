import duel from "./duel";
import SEBracket from "./single-elimination-bracket";
import SETournament from "./single-elimination-tournament";
import utilities from "./utilities";

export default () => {

    describe("Unit Tests |", () => {
        duel();
        SEBracket();
        SETournament();
        utilities();
    });

};
