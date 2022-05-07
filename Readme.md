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

# Language Features

The following section demonstrates some of the supported language features. For a more comprehensive set of examples, see `test/interpreter.test.ts`.

`fizzbuzz.lspy`
```lisp
(def fizzbuzz (max)
  (begin
    (for (var i 1) (< i max) (++ i)
      (if (= (% i 15) 0)
        (print "fizzbuzz")
        (if (= (% i 3) 0)
          (print "fizz")
          (if (= (% i 5) 0)
            (print "buzz")
            (print i)))))))

(fizzbuzz 100)
```
```bash
$ ./bin/lispy -f fizzbuzz.lspy
```