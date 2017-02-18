# tourneyjs

Tournament algorithms

[![Build Status](https://travis-ci.org/siggame/tourneyjs.svg?branch=master)](https://travis-ci.org/siggame/tourneyjs)

## Single Elimination

```javascript
import { SingleElimination } from "tourneyjs";

// create single elimination tournament without bronze finals
/**
 * SingleElimination( teams: any[], settings: Settings )
 * Settings : { with_bronze_final : boolean, randomize : boolean }
*/

const single_elim = new SingleElimination([ ... teams ... ]);

// or with bronze finals

/** 
 * const single_elim = new SingleElimination(
 * [ ... teams ... ],
 * {
 *     with_bronze_final: true,
 *     randomize: false
 * });
*/

// or with randomized seeding

/** 
 * const single_elim = new SingleElimination(
 * [ ... teams ... ],
 * {
 *     with_bronze_final: false,
 *     randomize: true
 * });
*/

// add on_finished event listener
single_elim.once('on_finished', some_callback);

// add error event listener
single_elim.once('error', some_error_handler);

/** 
 * Allow for asynchronous progress of the tournament.
 *
 * fight_cb(match) : Promise<{}>
 *
 * needs to return the winner and loser of
 * a match (ie { winner: "bob", loser: "tom"})
 *
 * success_cb(match) : Void
 *
 * will have the match with updated meta_data where the 
 * result is stored
 *
 * failure_cb(match, error) : Void 
 *
 * will be called for each failure, but the error event
 * listener will only execute once. the match and error 
 * are parameters to the callback
*/ 

single_elim.play(fight_cb, success_cb, failure_cb);

single_elim.pause();
single_elim.resume();

single_elim.stop();
single_elim.resume();
// Error thrown
```
