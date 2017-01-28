# tourneyjs

Tournament algorithms

[![Build Status](https://travis-ci.org/siggame/tourneyjs.svg?branch=master)](https://travis-ci.org/siggame/tourneyjs)

##Example API

```javascript
// create single elimination tournament with bronze finals
const single_elim = new tourney.SingleElimination([ ... teams ... ], false);

// allow for asynchronous progress of the tournament
single_elim.play(some_async_callback);

// display current status of _ready_, _playing_, and _queued_ matches
single_elim.progress();
```

