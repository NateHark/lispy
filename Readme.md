# Lispy

An interpreter for a Lisp-like toy language.

# Basic Usage

``` bash
# Evaluate expressions as a string
$ ./bin/lispy -e "(+ 1 1)"
2

# Evaluate expressions from a file
$ echo "(begin (def square(x) (* x x)) (square 2))" > square.test
$ ./bin/lispy -f square.test
4
```