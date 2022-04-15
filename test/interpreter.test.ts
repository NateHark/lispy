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
});