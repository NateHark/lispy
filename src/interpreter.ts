import Environment from "./environment";
import Transformer from "./transformer";

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

    private evalBody(body: any, env: Environment): any {
        if (body[0] === 'begin') {
            return this.evalBlock(body, env);
        }
        return this.eval(body, env);
    }

    readonly global: Environment;
    readonly transformer: Transformer;

    constructor(global = GlobalEnvironment()) {
        this.global = global;
        this.transformer = new Transformer();
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

        // increment
        if (exp[0] === '++') {
            const assignmentExp = this.transformer.transformIncrementToAssignment(exp);
            return this.eval(assignmentExp, env);
        }

        // increment by value
        if (exp[0] === '+=') {
            const assignmentExp = this.transformer.transformIncrementByValueToAssignment(exp);
            return this.eval(assignmentExp, env);
        }

        // decrement
        if (exp[0] === '--') {
            const assignmentExp = this.transformer.transformDecrementToAssignment(exp);
            return this.eval(assignmentExp, env);
        }

        // decrement by value
        if (exp[0] === '-=') {
            const assignmentExp = this.transformer.transformDecrementByValueToAssignment(exp);
            return this.eval(assignmentExp, env);
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

        // switch expression
        if (exp[0] === 'switch') {
            const ifExp = this.transformer.transformSwitchToIf(exp);
            return this.eval(ifExp, env);
        }

        // for expression
        if (exp[0] === 'for') {
            const whileExp = this.transformer.transformForToWhile(exp);
            return this.eval(whileExp, env);
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

        // Function declaration (def square (x) (* x x))
        // Syntactic sugar for: (var square (lambda (x) (* x x)))
        if (exp[0] === 'def') {
            const varExp = this.transformer.transformDefToVarLambda(exp);
            return this.eval(varExp, env);
        }

        // Lambda function
        if (exp[0] === 'lambda') {
            const [_tag, params, body] = exp;

            return {
                params,
                body,
                env, // closure
            };
        }

        // Function call
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

            // User-defined functions
            const activationRecord = new Map<string, any>();

            fn.params.forEach((param: string, index: number) => {
                activationRecord.set(param, args[index]);
            });

            const activationEnv = new Environment(
                activationRecord,
                fn.env, // captured environment
            );

            return this.evalBody(fn.body, activationEnv);
        }

        throw 'FIX ME';
    }
}