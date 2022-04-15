import Environment from "./environment";

export default class Interpreter {
    private isNumber(exp: any): boolean {
        return typeof exp === 'number';
    }

    private isString(exp: any): boolean {
        return typeof exp === 'string' && /^["'].*["']$/.exec(exp) !== null;
    }

    private isVariableName(exp: any): boolean {
        return typeof exp === 'string' && /^[a-zA-Z][a-zA-Z0-9_]*$/.exec(exp) !== null;
    }

    readonly global: Environment;

    constructor(global = new Environment()) {
        this.global = global;
    }

    /**
     * Evaluates an expression in the provided environment 
     */
    eval(exp: any, env: Environment = this.global): any {
        // Numeric literal
        if (this.isNumber(exp)) {
            return exp;
        }

        // String literal
        if (this.isString(exp)) {
            return exp.slice(1, -1);
        }

        // Addition
        if (exp[0] === '+') {
            return this.eval(exp[1]) + this.eval(exp[2]);
        }

        // Subtraction
        if (exp[0] === '-') {
            return this.eval(exp[1]) - this.eval(exp[2]);
        }

        // Multiplication
        if (exp[0] === '*') {
            return this.eval(exp[1]) * this.eval(exp[2]);
        }

        // Division
        if (exp[0] === '/') {
            return this.eval(exp[1]) / this.eval(exp[2]);
        }

        // Variables
        if (exp[0] === 'var') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value));
        }

        if (this.isVariableName(exp)) {
            return env.lookup(exp);
        }

        throw 'FIX ME';
    }
}