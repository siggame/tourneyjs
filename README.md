# siggame/tourneyjs

Tournament Algorithms

[![Travis](https://img.shields.io/travis/siggame/tourneyjs.svg?style=flat-square)](https://travis-ci.org/siggame/tourneyjs)
[![GitHub Tag](https://img.shields.io/github/tag/siggame/tourneyjs.svg?style=flat-square)](https://github.com/siggame/tourneyjs/tags)
[![Dependencies](https://img.shields.io/david/siggame/tourneyjs.svg)](https://github.com/siggame/tourneyjs)
[![NPM Version](https://img.shields.io/npm/v/@siggame/tourneyjs.svg?style=flat-square)](https://www.npmjs.com/package/@siggame/tourneyjs)
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

`tourneyjs` is a collection of different tournament algorithms along with the
building blocks to create custom tournaments.

## Getting Started

```bash
 npm install --save @siggame/tourneyjs
```

## Usage

### Single Elimination

```javascript
import { SingleEliminationTournament } from "tourneyjs";

// create single elimination tournament without bronze finals
/**
 * SingleEliminationTournament( teams: any[], settings: Settings )
 * Settings : { bronzeFinal : boolean, randomize : boolean }
*/

const single_elim = new SingleEliminationTournament<T>([...teams]: T[]);

// add finished event listener
single_elim.when("finished", some_callback);

// add error event listener
single_elim.when("error", some_error_handler);

/**
 * Allow for asynchronous progress of the tournament.
 *
 * fight(match: Duel<T>) => Promise<IMatchResult<T>>
 *
 * IMatchResult<T> = {
 *  winner: T; losers: T[];
 * }
 *
 * success(match: Duel<T>) => void
 *
 * will have the match with updated meta_data where the
 * result is stored
 *
 * failure(match: Duel<T>, error: any) => void
 *
 * will be called for each failure, but the error event
 * listener will only execute once. the match and error
 * are parameters to the callback
*/

single_elim.play(
    async (match) => {
        // define how match winner should be decided
    }, (match) => {
        // get access to match after winner has been decided
    }, (match, error) => {
        // report or recover from error
});

single_elim.pause();
single_elim.resume();

single_elim.stop();
single_elim.resume();
// Error thrown
```

## Contributors

- [user404d](https://github.com/user404d)

## Change Log

View our [CHANGELOG.md](https://github.com/siggame/tourneyjs/blob/master/CHANGELOG.md)

## License

View our [LICENSE](https://github.com/siggame/colisee/blob/master/LICENSE)

## Contributing

View our [CONTRIBUTING.md](https://github.com/siggame/colisee/blob/master/CONTRIBUTING.md)
