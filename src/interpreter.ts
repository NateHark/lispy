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

    private evalBlock(block: any, env: Environment): any {
        let result;

        const [_tag, ...expressions] = block;

        expressions.forEach((exp: any) => {
            result = this.eval(exp, env);
        }); 

        return result;
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
            return this.eval(exp[1], env) + this.eval(exp[2], env);
        }

        // Subtraction
        if (exp[0] === '-') {
            return this.eval(exp[1], env) - this.eval(exp[2], env);
        }

        // Multiplication
        if (exp[0] === '*') {
            return this.eval(exp[1], env) * this.eval(exp[2], env);
        }

        // Division
        if (exp[0] === '/') {
            return this.eval(exp[1], env) / this.eval(exp[2], env);
        }

        // Block
        if (exp[0] === 'begin') {
            const blockEnv = new Environment(new Map(), env);
            return this.evalBlock(exp, blockEnv);
        }

        // Variable declaration (var foo 10)
        if (exp[0] === 'var') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value, env));
        }

        // Variable assignment
        if (exp[0] === 'set') {
            const [_, name, value] = exp;
            return env.assign(name, this.eval(value, env));
        }

        // Variable access: foo
        if (this.isVariableName(exp)) {
            return env.lookup(exp);
        }

        throw 'FIX ME';
    }
}