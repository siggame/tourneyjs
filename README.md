# tourneyjs

Tournament algorithms

[![Build Status](https://travis-ci.org/siggame/tourneyjs.svg?branch=master)](https://travis-ci.org/siggame/tourneyjs)

##Example API

```javascript
// create single elimination tournament without bronze finals
const single_elim = new tourney.SingleElimination([ ... teams ... ]);

// or with bronze finals
// const single_elim = new tourney.SingleElimination([ ... teams ... ], true);

// add on_finished event listener
single_elim.once('on_finished', some_callback);

// allow for asynchronous progress of the tournament
single_elim.play(some_async_callback, success_cb, failure_cb);

single_elim.pause();
single_elim.resume();

single_elim.stop();
single_elim.resume();
// Error thrown
```

