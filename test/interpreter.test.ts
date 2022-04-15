import Interpreter from "../src/interpreter";

describe('Interpreter', () => {
    it('should return numeric identity', () => {
        const interpreter = new Interpreter();
        expect(interpreter.eval(1)).toBe(1);
    });

    it('should return string identity', () => {
        const interpreter = new Interpreter();
        expect(interpreter.eval('"hello"')).toBe('hello');
    });

    it('should apply + operator', () => {
        const interpreter = new Interpreter();
        expect(interpreter.eval(['+', 1, 2])).toBe(3);
    });

    it('should apply + operator', () => {
        const interpreter = new Interpreter();
        expect(interpreter.eval(['+', 1, ['+', 2, 3]])).toBe(6);
    });

    it('should apply - operator', () => {
        const interpreter = new Interpreter();
        expect(interpreter.eval(['-', 2, 1])).toBe(1);
    });

    it('should apply - operator', () => {
        const interpreter = new Interpreter();
        expect(interpreter.eval(['-', 1, ['-', 3, 2]])).toBe(0);
    });

    it('should apply * operator', () => {
        const interpreter = new Interpreter();
        expect(interpreter.eval(['*', 1, 2])).toBe(2);
    });

    it('should apply * operator', () => {
        const interpreter = new Interpreter();
        expect(interpreter.eval(['*', 1, ['*', 2, 3]])).toBe(6);
    });

    it('should apply / operator', () => {
        const interpreter = new Interpreter();
        expect(interpreter.eval(['/', 4, 2])).toBe(2);
    });

    it('should apply / operator', () => {
        const interpreter = new Interpreter();
        expect(interpreter.eval(['/', 8, ['/', 12, 3]])).toBe(2);
    });

    it('should define a variable', () => {
        const interpreter = new Interpreter();
        expect(interpreter.eval(['var', 'foo', 3])).toBe(3);
        expect(interpreter.eval('foo')).toBe(3);
    });

    it('should define a variable with complex sub-expression', () => {
        const interpreter = new Interpreter();
        expect(interpreter.eval(['var', 'foo', ['+', 1, 2]])).toBe(3);
        expect(interpreter.eval('foo')).toBe(3);
    });

    it('should evaluate a block', () => {
        const interpreter = new Interpreter();
        expect(interpreter.eval(
            ['begin',
                ['var', 'x', 10],
                ['var', 'y', 20],
                ['+', ['*', 'x', 'y'], 30]
        ])).toBe(230);
    });

    it('should evaluate nested blocks', () => {
        const interpreter = new Interpreter();
        expect(interpreter.eval(
            ['begin',
                ['var', 'x', 10],
                ['begin',
                    ['var', 'x', 20],
                    'x'
                ],
                'x' 
        ])).toBe(10);
    });

    it('should allow access to variables defined in the outer scope', () => {
        const interpreter = new Interpreter();
        expect(interpreter.eval(
            ['begin',
                ['var', 'value', 10],
                ['var', 'result', ['begin',
                    ['var', 'x', ['+', 'value', 10]],
                    'x'
                ]],
                'result' 
        ])).toBe(20);
    });

    it('should allow assignment to variables defined in the outer scope', () => {
        const interpreter = new Interpreter();
        expect(interpreter.eval(
            ['begin',
                ['var', 'data', 10],
                ['begin',
                    ['set', 'data', 100],
                ],
                'data' 
        ])).toBe(100);
    });

    it('should not allow assignment to variables that are not defined', () => {
        const interpreter = new Interpreter();
        expect(() => interpreter.eval(
            ['begin',
                ['set', 'foo', 10],
            ] 
        )).toThrow('Variable "foo" is not defined.');
    });

});