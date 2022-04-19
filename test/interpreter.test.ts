import Interpreter from "../src/interpreter";
import parser from "../generated/parser";

describe('Interpreter Tests', () => {

    const test = (string: string): any => {
        const interpreter = new Interpreter();
        return interpreter.eval(parser.parse(string));
    };

    describe('Identity Tests', () => {
        it('should return numeric identity', () => {
            expect(test('1')).toBe(1);
        });

        it('should return string identity', () => {
            expect(test('"hello"')).toBe('hello');
        });
    });

    describe('Math Operator Tests', () => {
        it('should apply + operator', () => {
            expect(test('(+ 1 2)')).toBe(3);
        });

        it('should apply + operator', () => {
            expect(test('(+ 1 (+ 2 3))')).toBe(6);
        });

        it('should apply - operator', () => {
            expect(test('(- 2 1)')).toBe(1);
        });

        it('should apply - operator', () => {
            expect(test('(- 1 (- 3 2))')).toBe(0);
        });

        it('should apply * operator', () => {
            expect(test('(* 1 2)')).toBe(2);
        });

        it('should apply * operator', () => {
            expect(test('(* 1 (* 2 3))')).toBe(6);
        });

        it('should apply / operator', () => {
            expect(test('(/ 4 2)')).toBe(2);
        });

        it('should apply / operator', () => {
            expect(test('(/ 8 (/ 12 3))')).toBe(2);
        });
    });

    describe('Comparison Operator Tests', () => {
        it('should apply > operator', () => {
            expect(test('(> 2 2)')).toBe(false);
            expect(test('(> 2 1)')).toBe(true);
            expect(test('(> 1 2)')).toBe(false);
        });

        it('should apply >= operator', () => {
            expect(test('(>= 0 1)')).toBe(false);
            expect(test('(>= 1 1)')).toBe(true);
            expect(test('(>= 2 1)')).toBe(true);
        });

        it('should apply < operator', () => {
            expect(test('(< 2 2)')).toBe(false);
            expect(test('(< 2 1)')).toBe(false);
            expect(test('(< 1 2)')).toBe(true);
        });

        it('should apply <= operator', () => {
            expect(test('(<= 0 1)')).toBe(true);
            expect(test('(<= 1 1)')).toBe(true);
            expect(test('(<= 2 1)')).toBe(false);
        });

        it('should apply = operator', () => {
            expect(test('(= 0 1)')).toBe(false);
            expect(test('(= 1 1)')).toBe(true);
        });
    });

    describe('Variable Tests', () => {
        it('should define a variable', () => {
            const interpreter = new Interpreter();
            expect(test('(var foo 3)')).toBe(3);
        });

        it('should define a variable with complex sub-expression', () => {
            const interpreter = new Interpreter();
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
             expect(test('(+ 1 5)')).toBe(6); 
        });

        it('should execute + function', () => {
            expect(test('(+ (+ 2 3) 5)')).toBe(10);
        });

        it('should execute + function', () => {
            expect(test('(+ (* 2 3) 5)')).toBe(11);
        });

        it('should execute > function', () => {
             expect(test('(> 1 5)')).toBe(false);
        });

        it('should execute < function', () => {
             expect(test('(< 1 5)')).toBe(true);
        });

        it('should execute >= function', () => {
            expect(test('(>= 5 5)')).toBe(true);
        });

        it('should execute <= function', () => {
            expect(test('(<= 5 5)')).toBe(true);
        });
        
        it('should execute = function', () => {
            expect(test('(= 5 5)')).toBe(true);
        });

        it('should execute print function', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            test('(print "hello world")');
            expect(consoleSpy).toHaveBeenCalledWith('hello world');
        });
    });

});