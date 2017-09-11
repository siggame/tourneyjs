# siggame/tourneyjs

Tournament Algorithms

[![Travis](https://img.shields.io/travis/siggame/tourneyjs.svg?style=flat-square)](https://travis-ci.org/siggame/tourneyjs)
[![Docker Pulls](https://img.shields.io/docker/pulls/siggame/tourneyjs.svg?style=flat-square)](https://hub.docker.com/r/siggame/tourneyjs/)
[![GitHub Tag](https://img.shields.io/github/tag/siggame/tourneyjs.svg?style=flat-square)](https://github.com/siggame/tourneyjs/tags)
[![Dependencies](https://img.shields.io/david/siggame/tourneyjs.svg)](https://github.com/siggame/tourneyjs)
[![NPM Version](https://img.shields.io/npm/@siggame/tourneyjs.svg?style=flat-square)](https://www.npmjs.com/package/@siggame/tourneyjs)
[![NPM Total Downloads](https://img.shields.io/npm/dt/@siggame/tourneyjs.svg?style=flat-square)](https://www.npmjs.com/package/@siggame/tourneyjs)

## Table Of Contents

- [Description](#description)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributors](#contributors)
- [Change Log](#change-log)
- [License](#license)
- [Contributing](#contributing)

## Description

A long description of the project.

## Getting Started

How to get/install the service or library.

## Usage

### Single Elimination

```javascript
import { SingleEliminationTournament } from "tourneyjs";

// create single elimination tournament without bronze finals
/**
 * SingleElimination( teams: any[], settings: Settings )
 * Settings : { with_bronze_final : boolean, randomize : boolean }
*/

const single_elim = new SingleEliminationTournament([ ... teams ... ]);

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
single_elim.when("finished", some_callback);

// add error event listener
single_elim.when("error", some_error_handler);

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

## Contributors

- [Russley Shaw](https://github.com/russleyshaw)
- [user404d](https://github.com/user404d)
- [Hannah Reinbolt](https://github.com/LoneGalaxy)
- [Matthew Qualls](https://github.com/MatthewQualls)

## Change Log

View our [CHANGELOG.md](https://github.com/siggame/tourneyjs/blob/master/CHANGELOG.md)

## License

View our [LICENSE.md](https://github.com/siggame/colisee/blob/master/LICENSE.md)

## Contributing

View our [CONTRIBUTING.md](https://github.com/siggame/colisee/blob/master/CONTRIBUTING.md)# tourneyjs
