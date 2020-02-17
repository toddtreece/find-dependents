# rg-imports

Recursively find files that `import` a file and its dependents using [ripgrep].

## Installation

This package expects that `rg` with be available in your `$PATH`.

```
npm i -g rg-imports
```

## Usage

```
$ rg-imports --help
rg-imports [options] <file>

Recursively find imports of a file and its dependents.

Positionals:
  file                Target file                                       [string]

Options:
  --help              Show help                                        [boolean]
  --version           Show version number                              [boolean]
  --json              JSON output                     [boolean] [default: false]
  --directory, --dir  Directory to search      [string] [default: "/Users/todd"]
```

## License

Copyright (c) 2020 Todd Treece. Licensed under the MIT license.

[ripgrep]: https://github.com/BurntSushi/ripgrep
