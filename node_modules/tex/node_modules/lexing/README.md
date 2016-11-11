# lexing

[![npm version](https://badge.fury.io/js/lexing.svg)](https://www.npmjs.com/package/lexing)
[![Travis CI Build Status](https://travis-ci.org/chbrown/lexing.svg)](https://travis-ci.org/chbrown/lexing)
[![Coverage Status](https://coveralls.io/repos/chbrown/lexing/badge.svg)](https://coveralls.io/github/chbrown/lexing)

Lexing vs. Parsing: lexers make only a single pass (no back-tracking); parsers have transition tables and do lookahead. The lexer can have state, but it should only make state transitions based on the current input, and not look at old input while processing new input.

More formally, lexers can parse Chomsky's Level 3 grammars, but you need a parser for more Level 2 grammars (you'll probably still want to use a lexer, but it won't be enough). Level 3 is the most basic of the levels, and a Level 3 language can be represented by a single regular expression, though that's probably not the most maintainable representation. Level 2 includes things like TeX's nested braces, e.g., `\textit{You don't want to \textbf{stop at the X} and not realize that the Y should still be italicized}`, or PDF's nested strings, e.g., `(This is a long string (with (in parentheses) a parenthetical))`. You'll use a lexer to split the raw input into a stream of tokens, but then you'll need a parser to resolve the stream of tokens into discrete representations, e.g., a tree in the TeX case:

    var body = [{
      style: null,
      children: [{
        style: 'italic',
        children: [
          'You don't want to ',
          {
            style: 'bold',
            children: ['stop at the X'],
          },
          ' and not realize that the Y should still be italicized'
        ]
      }]
    }]

Or just a string in the PDF string case:

    "This is a long string (with (in parentheses) a parenthetical)"


## Implementation

The `new lexing.Tokenizer(default_rules [, state_rules])` implementation provided in this module is the most basic lexer provided, representing state as a stack of strings. The `lexing.Tokenizer` constructor takes an optional second argument: an object mapping state names to lists of rules that apply only in those states. These operate like exclusive conditional states in `flex`, except there are no exceptions to the exclusivity, i.e., there is no `<*>` condition specifier. The current state is the last (top) state in the state stack. The `default_rules` rules apply only when the state stack is empty (the default).

The tokenizer has one main function, `tokenizer.map(string_iterable)`, which returns a `TokenIterable`. `string_iterable` should implement the `StringIterable` interface, i.e.:

    interface StringIterable {
      position: number;
      size: number;
      next(length: number): string;
      peek(length: number): string;
      skip(length: number): number;
    }

The following readers defined in `lexing` all return instances implementing the `StringIterable` interface:

* `new lexing.StringIterable(str)`
* `lexing.StringIterable.fromBuffer(buffer, encoding)`
* `new lexing.FileStringIterator(file_descriptor)`

There are other Buffer-based readers as well:

* `new lexing.BufferIterator(buffer)`
* `lexing.BufferIterator.fromString(str, encoding)`
* `new lexing.FileBufferIterator(file_descriptor)`

The `TokenIterable` instance returned by `tokenizer.map(...)` has one method: `next()`, which returns a non-null `Token`.
Every `Token` has a non-null `name` field (a string) and a `value` field (of any type; potentially null or undefined).

Each rule is a `[RegExp, Function]` tuple. When a rule's regular expression matches the input, the following happens:

1. We keep the value returned from `input_string.match(rule[0])` as `match`.
2. The input cursor is advanced over the length of the full match (`match[0]`).
3. The tokenizer returns the result of calling `input_string.match(rule[0])`, with the tokenizer bound as `this` inside the rule's function.

If no rules in the current state match the current input, the tokenizer will throw an "Invalid language" error.


## Quickstart

From the shell in your project's root directory:

    npm installl lexing --save

In your code:

    var lexing = require('lexing');

    // It will use the first rule with a matching regex, so go from more specific
    // to more catch-all. The ^ anchor before every regex is required!
    var rules = [
      [/^$/, function(match) {
        return lexing.Token('EOF', null);
      }],
      [/^\s+/, function(match) {
        return null; // ignore whitespace
      }],
      [/^[^!"#$%&'()*+,\-./:;<=>?@[\\\]\^_`{|}~\s]+/, function(match) {
        return lexing.Token('WORD', match[0]);
      }],
      [/^./, function(match) {
        return lexing.Token('PUNCTUATION', match[0]);
      }],
    ];

    var tokenizer = new lexing.Tokenizer(rules);
    var input = new lexing.StringIterator("'It wasn't at all my fault', I cried.");
    var output = tokenizer.map(input);

    do {
      var token = output.next();
      console.log('token=%s => %j', token.name, token.value);
    } while (token.name !== 'EOF');


## TypeScript integration

You should have the Node.js type declarations in your project at `type_declarations/DefinitelyTyped/node/node.d.ts`.

If you have an `index.d.ts` reference collector at `type_declarations/index.d.ts`, like I do, you can configure it so to pull in the `lexing.d.ts` declarations:

    // the usual imports:
    /// <reference path="DefinitelyTyped/node/node.d.ts" />
    /// <reference path="DefinitelyTyped/async/async.d.ts" />
    /// <reference path="DefinitelyTyped/yargs/yargs.d.ts" />

    // the self-declaring packages:
    /// <reference path="../node_modules/lexing/lexing.d.ts" />


## Building

You'll need the TypeScript compiler and the `node.d.ts` type declarations from the `DefinitelyTyped` repo. The following command will install / download those, compile `index.ts` to `index.js` and build `lexing.d.ts` from `index.ts`, as needed:

    make


### Development

TypeScript doesn't make exporting an importable set of type declarations easy. [adts](https://github.com/chbrown/adts) was my first foray into hacking a `tsc --declaration` build-step together, but this module takes a different approach. There are a couple requirements for making this work:

1. `////` markers in the TypeScript source to designate module boundaries when generating the declarations. TypeScript uses `///` to configure the compiler, so I use `////` to confuse their compiler into giving me what I want. The declaration build step in the Makefile strips these markers.
2. The 3rd-party package that's using `lexing` installs things with `npm` as usual, and has Node.js type declarations at `type_declarations/DefinitelyTyped/node/node.d.ts`. If `lexing` includes its own Node.js type declarations, the TypeScript compiler will complain about all kinds of duplicates / conflicts. (This is even if the two Node.js type declarations are identical -- they must be at the same filepath for TypeScript to recognize that they are the same.)


## License

Copyright 2015 Christopher Brown. [MIT Licensed](http://chbrown.github.io/licenses/MIT/#2015).
