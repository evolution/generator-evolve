# [Evolution][1] Generator

> [Yeoman][2] generator for [Evolution][1] frameworks.

This generator will dynamically find & list all available [Evolution][1] framework to use.

*The generators themselves are housed within each project, so this project is little more than
an entry-point to them.*


## Installation

```shell
$ npm install -g yo
$ npm install -g generator-evolve
```

## Usage

To dynamically choose which type of project to scaffold:

```shell
$ yo evolve
```

If you want to scaffold one in particular, you may specify it:

```shell
$ yo evolve wordpress
```


## Testing

When testing this project:

```shell
$ cd ~/path/to/evolution/generator-evolve
$ npm link .
$ yo evolve
```

When testing this sub-generators, you can manually specify the framework's path:

```shell
$ yo evolve wordpress --framework-path=~/path/to/evolution/wordpress
```

`framework-path` defaults to Yeoman's cache: `~/.cache/yeoman/evolution/{{ project }}/{{ tag }}`


## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[1]: https://github.com/evolution/
[2]: http://yeoman.io/
