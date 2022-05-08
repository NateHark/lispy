# Lispy

An interpreter for a Lisp-like toy language.

# Basic Usage

``` bash
# Evaluate expressions a file
$ echo "(begin (def square(x) (* x x)) (square 2))" > square.test
$ ./bin/lispy -f square.test
4

# Start a REPL
$ ./bin/lispy
lispy REPL. Type 'exit' to quit
> (def square (x) (* x x))

> (square 2)
4
> exit
$ 
```

# Language Features

The following section demonstrates some of the supported language features. For a more comprehensive set of examples, see `test/interpreter.test.ts`.

`fizzbuzz.lspy`
```lisp
(def fizzbuzz (max)
  (begin
    (for (var i 1) (< i max) (++ i)
      (switch ((= (% i 15) 0) (print "fizzbuzz"))
              ((= (% i 3) 0) (print "fizz"))
              ((= (% i 5) 0) (print "buzz"))
              (else (print i))))))

(fizzbuzz 100)
```
```bash
$ ./bin/lispy -f fizzbuzz.lspy
```