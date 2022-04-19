import Environment from "./environment";

const GlobalEnvironment = () => {
    return new Environment(new Map<string, any>([
        ['null', null],

        ['true', true],
        ['false', false],

        // Mathmatical operators
        ['+', (op1: number, op2: number) => { 
            return op1 + op2; 
        }],
        ['*', (op1: number, op2: number) => { 
            return op1 * op2; 
        }],
        ['-', (op1: number, op2: number | null = null) => { 
            if (op2 == null) {
                return -op1;
            }
            return op1 - op2; 
        }],
        ['/', (op1: number, op2: number) => { 
            return op1 / op2; 
        }],

        // Comparison functions
        ['>', (op1: number, op2: number) => { 
            return op1 > op2;
        }],
        ['<', (op1: number, op2: number) => { 
            return op1 < op2;
        }],
        ['>=', (op1: number, op2: number) => { 
            return op1 >= op2; 
        }],
        ['<=', (op1: number, op2: number) => { 
            return op1 <= op2;
        }],
        ['=', (op1: number, op2: number) => { 
            return op1 === op2; 
        }],

        ['print', (...args: any[]) => {
            console.log(...args);
        }],
    ]))
};

export default class Interpreter {
    private isNumber(exp: any): boolean {
        return typeof exp === 'number';
    }

    private isString(exp: any): boolean {
        return typeof exp === 'string' && /^["'].*["']$/.exec(exp) !== null;
    }

    private isVariableName(exp: any): boolean {
        return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_]*$/.exec(exp) !== null;
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

    constructor(global = GlobalEnvironment()) {
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

        // if-expression
        if (exp[0] === 'if') {
            const [_tag, condition, consequent, alternate] = exp;
            if (this.eval(condition, env)) {
                return this.eval(consequent, env);
            }
            return this.eval(alternate, env);
        }

        // while-expression
        if (exp[0] === 'while') {
            const [_tag, condition, body] = exp;
            let result;
            while(this.eval(condition, env)) {
                 result = this.eval(body, env);
            }
            return result;
        }

        // Function
        if (Array.isArray(exp)) {
            // First arg is the function name. Call eval() to look up the function name
            // in the environment
            const fn = this.eval(exp[0], env);

            // Eval function arguments
            const args = exp.slice(1).map(arg => this.eval(arg, env)); 

            // Handle native functions
            if (typeof fn === 'function') {
                return fn(...args);
            }
        }

        throw 'FIX ME';
    }
}