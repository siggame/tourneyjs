import * as tourney from '../'
import * as should from 'should';

describe('Swiss', function(){
    it('should be constructable', function(done){
        const t = new tourney.swiss();
        done();
    });
    
    it('should foo', function(done){
        const t = new tourney.swiss();
        should(t.foo()).be.equal('swiss');
        done();
    });
});



