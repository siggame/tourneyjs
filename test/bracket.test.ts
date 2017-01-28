import * as tourney from '../'
import * as should from 'should';

describe('Bracket', function () {
    it('should be constructable', (done) => {
        const t = new tourney.Bracket(8);
        done();
    });

    it('should have root with no next match(es)', (done) => {
        const t = new tourney.Bracket(8);
        should(t.matches[0].next).be.equal(null);
        done();
    });
});



