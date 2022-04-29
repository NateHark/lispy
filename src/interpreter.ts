import Environment from './environment';
import Transformer from './transformer';
import parser from '../generated/parser';

import * as fs from 'fs';

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
    private isNumber(exp: Expression): boolean {
        return typeof exp === 'number';
    }

    private isStringLiteral(exp: Expression): boolean {
        return typeof exp === 'string' && /^["'].*["']$/.exec(exp) !== null;
    }

    private isVariableName(exp: Expression): boolean {
        return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_]*$/.exec(exp) !== null;
    }

    private evalNumericLiteral(literal: NumericLiteral): NumericLiteral {
        return literal;
    }
    
    private evalStringLiteral(literal: StringLiteral): StringLiteral {
        // Trim quotes of both ends of the string 
        return literal.slice(1, -1);
    }
    
    private evalIncrementExpression(exp: ListExpression, env: Environment): Expression {
        const assignmentExp = this.transformer.transformIncrementToAssignment(exp);
        return this.eval(assignmentExp, env);
    }

    private evalIncrementByValueExpression(exp: ListExpression, env: Environment): Expression {
        const assignmentExp = this.transformer.transformIncrementByValueToAssignment(exp);
        return this.eval(assignmentExp, env);
    }
    
    private evalDecrementExpression(exp: ListExpression, env: Environment): Expression {
        const assignmentExp = this.transformer.transformDecrementToAssignment(exp);
        return this.eval(assignmentExp, env);
    }

    private evalDecrementByValueExpression(exp: ListExpression, env: Environment): Expression {
        const assignmentExp = this.transformer.transformDecrementByValueToAssignment(exp);
        return this.eval(assignmentExp, env);
    }

    private evalFunctionCall(exp: ListExpression, env: Environment): Expression {
        // First arg is the function name. Call eval() to look up the function name in the environment
        const fn = this.eval(exp[0], env);

        // Eval function arguments
        const args = exp.slice(1).map(arg => this.eval(arg, env)); 

        // Handle native functions
        if (typeof fn === 'function') {
            return fn(...args);
        }

        // User-defined functions
        return this.callUserDefinedFunction(fn as LambdaExpression, args);
    }

    private evalAssignmentExpression(exp: ListExpression, env: Environment): Expression {
        const [_, ref, value] = exp;
        if (ref[0] === 'prop') {
            const [_tag, instance, propName] = ref;
            const instanceEnv = this.eval(instance, env) as Environment;
            return instanceEnv.define(propName, this.eval(value, env));
        }
        return env.assign(ref, this.eval(value, env));
    }
    
    private evalIfExpression(exp: ListExpression, env: Environment): Expression {
        const [_, condition, consequent, alternate] = exp;
        if (this.eval(condition, env)) {
            return this.eval(consequent, env);
        }
        return this.eval(alternate, env);
    }

    private evalSwitchExpression(exp: ListExpression, env: Environment): Expression {
        const ifExp = this.transformer.transformSwitchToIf(exp);
        return this.eval(ifExp, env);
    }

    private evalForExpression(exp: ListExpression, env: Environment): Expression {
        const whileExp = this.transformer.transformForToWhile(exp);
        return this.eval(whileExp, env);
    }

    private evalWhileExpression(exp: ListExpression, env: Environment): Expression {
        const [_tag, condition, body] = exp;
        let result: Expression;
        while(this.eval(condition, env)) {
            result = this.eval(body, env);
        }
        return result!;
    }

    private evalDefExpression(exp: ListExpression, env: Environment): Expression {
        const varExp = this.transformer.transformDefToVarLambda(exp);
        return this.eval(varExp, env);
    }

    private evalLambdaExpression(exp: ListExpression, env: Environment): Expression {
        const [_, params, body] = exp;
        return {
            params,
            body,
            env, // closure
        };
    }

    private evalClassExpression(exp: ListExpression, env: Environment): Expression {
        // Class declaration
        const [_, name, parent, body] = exp;
        const parentEnv = this.eval(parent, env) as Environment || env;
        const classEnv = new Environment(new Map(), parentEnv);

        this.evalBody(body, classEnv);

        return env.define(name, classEnv);
    }

    private evalClassInstantiationExpression(exp: ListExpression, env: Environment): Expression {
        const classEnv = this.eval(exp[1], env) as Environment;
        const instanceEnv = new Environment(new Map(), classEnv); 
        const args = exp.slice(2).map((arg: any) => this.eval(arg, env));

        this.callUserDefinedFunction(classEnv.lookup('constructor'), [instanceEnv, ...args]);

        return instanceEnv;
    }

    private evalSuperExpression(exp: ListExpression, env: Environment): Expression {
        const [_, className] = exp;
        return (this.eval(className, env) as Environment).parent!;
    }

    private evalPropExpression(exp: ListExpression, env: Environment): Expression {
        const [_, instance, name] = exp;
        const instanceEnv = this.eval(instance, env) as Environment;
        return instanceEnv.lookup(name);
    }

    private evalModuleExpression(exp: ListExpression, env: Environment): Expression {
        const [_tag, name, body] = exp;
        const moduleEnv = new Environment(new Map(), env);
        this.evalBody(body, moduleEnv);
        return env.define(name, moduleEnv);
    }

    private evalImportExpression(exp: ListExpression, env: Environment): Expression {
        let [_, args, name] = exp;

        // function imports were not specified
        if (typeof(args) === 'string') {
            name = args;
        } 

        
        let module: any;
        try {
            module = env.lookup(name);
        } catch {}

        if (!module) {
            const moduleSrc = fs.readFileSync(
                `${__dirname}/modules/${name}.lsp`,
                'utf-8',
            );

            const body = parser.parse(`(begin ${moduleSrc})`);
            const moduleExp: Expression = ['module', name, body];
            module = this.eval(moduleExp, this.global);
        }

        if (Array.isArray(args)) {
            let result: Expression;
            args.forEach(arg => {
                const varExp: Expression =  ['var', arg, ['prop', name, arg]];
                result = this.eval(varExp, env);
            });
            return result!;
        }

        return module;
    }

    private evalListExpression(exp: ListExpression, env: Environment): Expression {
        switch (exp[0]) {
            case '++': {
                return this.evalIncrementExpression(exp, env);
            }
            case '+=': {
                return this.evalIncrementByValueExpression(exp, env);
            }
            case '--': {
                return this.evalDecrementExpression(exp, env);
            }
            case '-=': {
                return this.evalDecrementByValueExpression(exp, env);
            }
            case 'begin': {
                const blockEnv = new Environment(new Map(), env);
                return this.evalBlock(exp, blockEnv);
            }
            case 'var': {
                const [_, name, value] = exp;
                return env.define(name, this.eval(value, env));
            }
            case 'set': {
                return this.evalAssignmentExpression(exp, env);
            }
            case 'if': {
                return this.evalIfExpression(exp, env);
            }
            case 'switch': {
                return this.evalSwitchExpression(exp, env);
            }
            case 'for': {
                return this.evalForExpression(exp, env);
            }
            case 'while': {
                return this.evalWhileExpression(exp, env);
            }
            case 'def': {
                return this.evalDefExpression(exp, env);
            }
            case 'lambda': {
                return this.evalLambdaExpression(exp, env);
            }
            case 'class': {
                return this.evalClassExpression(exp, env);
            }
            case 'new': {
                return this.evalClassInstantiationExpression(exp, env);
            }
            case 'super': {
                return this.evalSuperExpression(exp, env);
            }
            case 'prop': {
                return this.evalPropExpression(exp, env);
            }
            case 'module': {
                return this.evalModuleExpression(exp, env);
            }
            case 'import': {
                return this.evalImportExpression(exp, env);
            }
            default:
                return this.evalFunctionCall(exp, env);
        } 
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

    private callUserDefinedFunction(fn: LambdaExpression, args: Expression[]): Expression {
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

    readonly global: Environment;
    readonly transformer: Transformer;

    constructor(global = GlobalEnvironment()) {
        this.global = global;
        this.transformer = new Transformer();
    }

    /**
     * Evaluates an expression wrapped in a block 
     */
    evalGlobal(exp: any): any {
        return this.evalBody(exp, this.global);
    }    

    /**
     * Evaluates an expression in the provided environment 
     */
    eval(exp: Expression, env: Environment = this.global): Expression {
        // Numeric literal
        if (this.isNumber(exp)) {
            return this.evalNumericLiteral(exp as NumericLiteral);
        }

        // String literal
        if (this.isStringLiteral(exp)) {
            return this.evalStringLiteral(exp as StringLiteral);
        }

        // Variable access
        if (this.isVariableName(exp)) {
             return env.lookup(exp as string);
        }

        // List
        if (Array.isArray(exp)) {
            const listExp = exp as ListExpression;
            return this.evalListExpression(exp as ListExpression, env);
        }

        throw `Unknown expression: ${JSON.stringify(exp)}`;
    }
}