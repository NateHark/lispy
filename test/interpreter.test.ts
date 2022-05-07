import Interpreter from "../src/interpreter";
import parser from "../generated/parser";

import fs from 'fs';

describe('Interpreter Tests', () => {

    const test = (string: string): any => {
        const interpreter = new Interpreter();
        return interpreter.eval(parser.parse(string));
    };

    describe('Identity Tests', () => {
        it('should return numeric identity', () => {
            expect(test('1')).toBe(1);
            expect(test('-1')).toBe(-1);
            expect(test('0.1')).toBe(0.1);
            expect(test('.1')).toBe(.1);
            expect(test('-0.1')).toBe(-0.1);
            expect(test('3.14159')).toBe(3.14159);
            expect(test('-3.14159')).toBe(-3.14159);
        });

        it('should return string identity', () => {
            expect(test('""')).toBe('');
            expect(test('"hello"')).toBe('hello');
        });
    });
   
    describe('Variable Tests', () => {
        it('should define a variable', () => {
            expect(test('(var foo 3)')).toBe(3);
        });

        it('should define a variable with complex sub-expression', () => {
            expect(test('(var foo (+ 1 2))')).toBe(3);
        });
    });

    describe('Block Expression Tests', () => {
        it('should evaluate a block', () => {
            expect(test(`
                (begin
                    (var x 10)
                    (var y 20)
                    (+ (* x y) 30)
                )
                `)).toBe(230);
        });

        it('should evaluate nested blocks', () => {
            expect(test(`
                (begin
                    (var x 10)
                    (begin
                        (var x 20)
                        x
                    )
                    x
                )
                `)).toBe(10);
        });

        it('should allow access to variables defined in the outer scope', () => {
            expect(test(`
                (begin
                    (var value 10)
                    (var result (begin
                       (var x (+ value 10)) 
                       x)
                    )
                    result
                )
                `)).toBe(20);
        });

        it('should allow assignment to variables defined in the outer scope', () => {
            expect(test(`
                (begin
                    (var data 10)
                    (begin 
                        (set data 100)
                    )
                    data
                )
                `)).toBe(100);
        });

        it('should not allow assignment to variables that are not defined', () => {
            expect(() => test(`
                (begin
                    (set foo 10)
                )
                `)).toThrow('Variable "foo" is not defined.');
        });
    });

    describe('Logical Operator Tests', () => {
        it('should evaluate and expression', () => {
            expect(test(`
            (and true true)
            `)).toBe(true);
        });

        it('should evaluate and expression', () => {
            expect(test(`
            (and false true)
            `)).toBe(false);
        });
            
        it('should evaluate and expression', () => {
            expect(test(`
            (and false false)
            `)).toBe(false);
        });

        it('should evaluate and expression', () => {
            expect(test(`
            (and (> 1 0) (> 10 5))
            `)).toBe(true);
        });

        it('should evaluate or expression', () => {
            expect(test(`
            (or true true)
            `)).toBe(true);
        });

        it('should evaluate or expression', () => {
            expect(test(`
            (or false true)
            `)).toBe(true);
        });
            
        it('should evaluate or expression', () => {
            expect(test(`
            (or false false)
            `)).toBe(false);
        });

        it('should evaluate or expression', () => {
            expect(test(`
            (or (> 1 0) (< 10 5))
            `)).toBe(true);
        });
    });

    describe('Conditional Expression Tests', () => {
        it('should evaluate if expression', () => {
            expect(test(`
                (begin
                    (var x 10)
                    (var y 0)
                    (if (> x 10)
                        (set y 20)
                        (set y 30))
                    y
                )`)).toBe(30);
        });
    });

    describe('Loop Tests', () => {
        it('should evaluate while expression', () => {
            expect(test(`
                (begin
                    (var counter 0)
                    (var result 0)
                    (while (< counter 10)
                        (begin
                            (set result (+ result 1))
                            (set counter (+ counter 1))
                        )
                    )
                    result
                )
                `)).toBe(10);
                
        });
    });

    describe('Built-in Function Tests', () => {
        it('should execute + function', () => {
            expect(test('(+ 1 1)')).toBe(2); 
            expect(test('(+ (+ 2 3) 5)')).toBe(10);
        });

        it('should execute - function', () => {
            expect(test('(- 1 1)')).toBe(0); 
            expect(test('(- 1)')).toBe(-1);
        });

        it('should execute * function', () => {
            expect(test('(* 2 3)')).toBe(6); 
            expect(test('(* 6 0)')).toBe(0);
        });

        it('should execute / function', () => {
            expect(test('(/ 6 2)')).toBe(3); 
            expect(test('(/ 2 4)')).toBe(0.5);
        });

        it('should execute % function', () => {
            expect(test('(% 6 2)')).toBe(0); 
            expect(test('(% 6 5)')).toBe(1);
        });

        it('should execute > function', () => {
             expect(test('(> 1 2)')).toBe(false);
             expect(test('(> 2 1)')).toBe(true);
        });

        it('should execute < function', () => {
             expect(test('(< 1 2)')).toBe(true);
             expect(test('(< 2 1)')).toBe(false);
        });

        it('should execute >= function', () => {
            expect(test('(>= 5 5)')).toBe(true);
            expect(test('(>= 4 5)')).toBe(false);
        });

        it('should execute <= function', () => {
            expect(test('(<= 5 5)')).toBe(true);
            expect(test('(<= 6 5)')).toBe(false);
        });
        
        it('should execute = function', () => {
            expect(test('(= 5 5)')).toBe(true);
            expect(test('(= 5 1)')).toBe(false);
        });

        it('should execute ++ function', () => {
            expect(test(`
                (begin
                    (var x 1)
                    (++ x)
                    x
                )
                `)).toBe(2);
        });

        it('should execute -- function', () => {
            expect(test(`
                (begin
                    (var x 2)
                    (-- x)
                    x
                )
                `)).toBe(1);
        });

        it('should execute print function', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            test('(print "hello world")');
            expect(consoleSpy).toHaveBeenCalledWith('hello world');
        });
    });

    describe('User-defined Function Tests', () => {
        it('should execute square function', () => {
            expect(test(
                `(begin
                    (def square (x)
                        (* x x))
                    (square 2)
                )`
            )).toBe(4);
        });

        it('should support function closures', () => {
            expect(test(
                `(begin
                    (var a 1)
                    (def outer ()
                        (begin
                            (var b 2)
                            (def inner()
                                (begin
                                    (var c 3)
                                    (+ a (+ b c))
                                )
                            )
                            (inner)
                        )
                    )
                    (outer)
                )`
            )).toBe(6); 
        });
    });
    
    describe('Lambda Function Tests', () => {
        it('should execute no-arg lambda function', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            test(
                `
                ((lambda () (print "hello world")))
                `
            );
            expect(consoleSpy).toHaveBeenCalledWith('hello world');
        });

        it('should execute lambda function as reference', () => {
            expect(test(
                `(begin
                    (def handler (callback)
                        (begin
                            (var x 10)
                            (var y 20)
                            (callback (+ x y))
                        )
                    )
                    (handler (lambda (data) (* data 10)))
                )
                `
            )).toBe(300);
        });

        it('should execute immediately invoked lambda expression', () => {
            expect(test(
                `((lambda (x) (* x x)) 2)
                ` 
            )).toBe(4);
        });
        
        it('should save lambda function to a variable', () => {
            expect(test(
                `(begin
                    (var square (lambda (x) (* x x)))
                    (square 2)
                )
                ` 
            )).toBe(4);
        });
    });

    describe('Recursion Tests', () => {
        it('should execute recursive function', () => {
            expect(test(
                `(begin
                    (def factorial (x)
                        (if (= x 1)
                            1
                            (* x (factorial (- x 1)))
                        )
                    )     
                    (factorial 5)
                )`
            )).toBe(120);
        });
    });

    describe('Switch Statement Tests', () => {
        it('should return a matching condition', () => {
            expect(test(
                `(begin
                    (var x 1)
                    (switch ((> x 1) 100)
                            ((= x 1) (+ 100 1))
                            ((< x 1) 300)
                            (else 0))
                )
                `
            )).toBe(101);
        });

        it('should return the default condition', () => {
            expect(test(`
                (begin
                    (var x 0)
                    (switch ((> x 1) 100)
                            ((= x 1) 200)
                            (else 0))
                )
            `)).toBe(0);
        });
    });

    describe('For-Loop Tests', () => {
        it('should execute for loop', () => {
            expect(test(`
                (begin
                    (var x 0)
                    (for (var y 0)
                         (< y 10)
                         (++ y) 
                         (set x (+ x y)))
                    x
                )
            `)).toBe(45);
        });
    });

    describe('Increment and Decrement Tests', () => {
        it('should increment x', () => {
            expect(test(`
                (begin
                    (var x 0)
                    (++ x)
                    x
                )
            `)).toBe(1);
        });

        it('should increment x by 2', () => {
            expect(test(`
                (begin
                    (var x 0)
                    (+= x 2)
                    x
                )
            `)).toBe(2);
        });        

        it('should increment x by y', () => {
            expect(test(`
                (begin
                    (var x 0)
                    (var y 2)
                    (+= x y)
                    x
                )
            `)).toBe(2);
        });

        it('should decrement x', () => {
            expect(test(`
                (begin
                    (var x 1)
                    (-- x)
                    x
                )
            `)).toBe(0);
        });

        it('should decrement x by 2', () => {
            expect(test(`
                (begin
                    (var x 2)
                    (-= x 2)
                    x
                )
            `)).toBe(0);
        });
    });

    describe ('Class Declaration Tests', () => {
        it('should declare and instantiate a class', () => {
            expect(test(`
                (begin
                    (class Point null
                        (begin
                            (def constructor (self x y)
                                (begin
                                    (set (prop self x) x)
                                    (set (prop self y) y)
                                )
                            )
                            (def calc (self)
                                (+ (prop self x) (prop self y))
                            )
                        )
                    )
                    (var p (new Point 10 20))
                    ((prop p calc) p)
                )
            `)).toBe(30);
        });

        it('should support class inheritance', () => {
            expect(test(`
                (begin
                    (class Point null
                        (begin
                            (def constructor (self x y)
                                (begin
                                    (set (prop self x) x)
                                    (set (prop self y) y)
                                )
                            )
                            (def calc (self)
                                (+ (prop self x) (prop self y))
                            )
                        )
                    )
                    (class Point3D Point
                        (begin
                            (def constructor (self x y z)
                                (begin
                                    ((prop (super Point3D) constructor) self x y)
                                    (set (prop self z) z)
                                )
                            )
                            (def calc (self)
                                (+ ((prop (super Point3D) calc) self) (prop self z))
                            )
                        )
                    )
                    (var p (new Point3D 10 20 30))
                    ((prop p calc) p)
                )
            `)).toBe(60);
        });

        describe ('Module Tests', () => {
            it('should define and use a module', () => {
                expect(test(`
                    (begin
                        (module Math
                            (begin
                                (def square (x) 
                                    (* x x))
                            )
                        )

                        ((prop Math square) 2)
                    )
                `)).toBe(4)
            });

            it('should import a module from a file and use it', () => {
                expect(test(`
                    (begin
                        (import Math)

                        ((prop Math square) 2)
                    )
                `)).toBe(4);
            });

            it('should import a function from a module and use it', () => {
                expect(test(`
                    (begin
                        (import (square factorial) Math)
                        (square (factorial 2))
                    )
                `)).toBe(4);
            });

            it('should cache loaded modules', () => {
                const fsSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
                    return '(def square (x) (* x x))';
                });
                test(`
                    (begin
                        (begin
                            (import Math)

                            ((prop Math square) 2)
                        )
                        (import Math)
                        ((prop Math square) 2)
                    )
                `);
                expect(fsSpy).toBeCalledTimes(1);
            });
        });
    });
});