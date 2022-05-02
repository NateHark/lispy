import Scope from "./scope";
import Transformer from "./transformer";
import parser from "../generated/parser";

import * as fs from "fs";
import { InvalidSyntaxError } from "./exceptions";

const GlobalEnvironment = () => {
  return new Scope(
    new Map<string, null | boolean | Function>([
      ["null", null],

      ["true", true],
      ["false", false],

      // Mathmatical operators
      [
        "+",
        (op1: number, op2: number) => {
          return op1 + op2;
        },
      ],
      [
        "*",
        (op1: number, op2: number) => {
          return op1 * op2;
        },
      ],
      [
        "-",
        (op1: number, op2: number | null = null) => {
          if (op2 == null) {
            return -op1;
          }
          return op1 - op2;
        },
      ],
      [
        "/",
        (op1: number, op2: number) => {
          return op1 / op2;
        },
      ],

      // Comparison functions
      [
        ">",
        (op1: number, op2: number) => {
          return op1 > op2;
        },
      ],
      [
        "<",
        (op1: number, op2: number) => {
          return op1 < op2;
        },
      ],
      [
        ">=",
        (op1: number, op2: number) => {
          return op1 >= op2;
        },
      ],
      [
        "<=",
        (op1: number, op2: number) => {
          return op1 <= op2;
        },
      ],
      [
        "=",
        (op1: number, op2: number) => {
          return op1 === op2;
        },
      ],

      [
        "print",
        (...args: any[]) => {
          console.log(...args);
        },
      ],
    ])
  );
};

export default class Interpreter {
  private isNumber(exp: Expression): boolean {
    return typeof exp === "number";
  }

  private isStringLiteral(exp: Expression): boolean {
    return typeof exp === "string" && /^["'].*["']$/.exec(exp) !== null;
  }

  private isVariableName(exp: Expression): boolean {
    return (
      typeof exp === "string" && /^[+\-*/<>=a-zA-Z0-9_]*$/.exec(exp) !== null
    );
  }

  private evalNumericLiteral(literal: NumericLiteral): NumericLiteral {
    return literal;
  }

  private evalStringLiteral(literal: StringLiteral): StringLiteral {
    // Trim quotes of both ends of the string
    return literal.slice(1, -1);
  }

  private evalIncrementExpression(
    exp: IncrementExpression,
    env: Scope
  ): Expression {
    const assignmentExp = this.transformer.transformIncrementToAssignment(exp);
    return this.eval(assignmentExp, env);
  }

  private evalIncrementByValueExpression(
    exp: IncrementByValueExpression,
    env: Scope
  ): Expression {
    const assignmentExp =
      this.transformer.transformIncrementByValueToAssignment(exp);
    return this.eval(assignmentExp, env);
  }

  private evalDecrementExpression(
    exp: DecrementExpression,
    env: Scope
  ): Expression {
    const assignmentExp = this.transformer.transformDecrementToAssignment(exp);
    return this.eval(assignmentExp, env);
  }

  private evalDecrementByValueExpression(
    exp: DecrementByValueExpression,
    env: Scope
  ): Expression {
    const assignmentExp =
      this.transformer.transformDecrementByValueToAssignment(exp);
    return this.eval(assignmentExp, env);
  }

  private evalFunctionCall(exp: ListExpression, env: Scope): Expression {
    // First arg is the function name. Call eval() to look up the function name in the environment
    const fn = this.eval(exp[0], env);

    // Eval function arguments
    const args = exp.slice(1).map((arg) => this.eval(arg, env));

    // Handle native functions
    if (typeof fn === "function") {
      return fn(...args);
    }

    // User-defined functions
    return this.callUserDefinedFunction(fn as FunctionDefinition, args);
  }

  private evalVarExpression(exp: VarExpression, env: Scope): Expression {
    const [_, name, value] = exp;
    return env.define(name, this.eval(value, env));
  }

  private evalSetExpression(exp: SetExpression, env: Scope): Expression {
    const [_, ref, value] = exp;
    if (ref[0] === "prop") {
      const [_tag, instance, propName] = ref;
      const instanceEnv = this.eval(instance, env) as Scope;
      return instanceEnv.define(propName, this.eval(value, env));
    }
    return env.assign(ref, this.eval(value, env));
  }

  private evalIfExpression(exp: IfExpression, env: Scope): Expression {
    const [_, condition, consequent, alternate] = exp;
    if (this.eval(condition, env)) {
      return this.eval(consequent, env);
    }
    return this.eval(alternate, env);
  }

  private evalSwitchExpression(exp: SwitchExpression, env: Scope): Expression {
    const ifExp = this.transformer.transformSwitchToIf(exp);
    return this.eval(ifExp, env);
  }

  private evalForExpression(exp: ForExpression, env: Scope): Expression {
    const whileExp = this.transformer.transformForToWhile(exp);
    return this.eval(whileExp, env);
  }

  private evalWhileExpression(exp: WhileExpression, env: Scope): Expression {
    const [_, condition, body] = exp;
    let result: Expression;
    while (this.eval(condition, env)) {
      result = this.eval(body, env);
    }
    return result!;
  }

  private evalDefExpression(exp: DefExpression, env: Scope): Expression {
    const varExp = this.transformer.transformDefToVarLambda(exp);
    return this.eval(varExp, env);
  }

  private evalLambdaExpression(
    exp: LambdaExpression,
    env: Scope
  ): FunctionDefinition {
    const [_, params, body] = exp;
    return {
      params,
      body,
      env, // closure
    };
  }

  private evalClassExpression(exp: ClassExpression, env: Scope): Expression {
    // Class declaration
    const [_, name, parent, body] = exp;
    const parentEnv = (this.eval(parent, env) as Scope) || env;
    const classEnv = new Scope(new Map(), parentEnv);

    this.evalBody(body, classEnv);

    return env.define(name, classEnv);
  }

  private evalClassInstantiationExpression(
    exp: ClassInstantiationExpression,
    env: Scope
  ): Expression {
    const classEnv = this.eval(exp[1], env) as Scope;
    const instanceEnv = new Scope(new Map(), classEnv);
    const args = exp.slice(2).map((arg: Expression) => this.eval(arg, env));

    this.callUserDefinedFunction(classEnv.lookup("constructor"), [
      instanceEnv,
      ...args,
    ]);

    return instanceEnv;
  }

  private evalSuperExpression(exp: SuperExpression, env: Scope): Expression {
    const [_, className] = exp;
    return (this.eval(className, env) as Scope).parent!;
  }

  private evalPropExpression(exp: PropExpression, env: Scope): Expression {
    const [_, instance, name] = exp;
    const instanceEnv = this.eval(instance, env) as Scope;
    return instanceEnv.lookup(name);
  }

  private evalModuleExpression(exp: ModuleExpression, env: Scope): Expression {
    const [_, name, body] = exp;
    const moduleEnv = new Scope(new Map(), env);
    this.evalBody(body, moduleEnv);
    return env.define(name, moduleEnv);
  }

  private evalImportExpression(exp: ImportExpression, env: Scope): Expression {
    let [_, args, name] = exp;

    // function imports were not specified
    if (typeof args === "string") {
      name = args;
    }

    let module: any;
    try {
      module = env.lookup(name);
    } catch {}

    if (!module) {
      const moduleSrc = fs.readFileSync(
        `${__dirname}/modules/${name}.lsp`,
        "utf-8"
      );

      const body = parser.parse(`(begin ${moduleSrc})`);
      const moduleExp: Expression = ["module", name, body];
      module = this.eval(moduleExp, this.global);
    }

    if (Array.isArray(args)) {
      let result: Expression;
      args.forEach((arg) => {
        const varExp: Expression = ["var", arg, ["prop", name, arg]];
        result = this.eval(varExp, env);
      });
      return result!;
    }

    return module;
  }

  private evalListExpression(exp: ListExpression, env: Scope): Expression {
    switch (exp[0]) {
      case "++": {
        return this.evalIncrementExpression(exp as IncrementExpression, env);
      }
      case "+=": {
        return this.evalIncrementByValueExpression(
          exp as IncrementByValueExpression,
          env
        );
      }
      case "--": {
        return this.evalDecrementExpression(exp as DecrementExpression, env);
      }
      case "-=": {
        return this.evalDecrementByValueExpression(
          exp as DecrementByValueExpression,
          env
        );
      }
      case "begin": {
        const blockEnv = new Scope(undefined, env);
        return this.evalBlockExpression(exp as BlockExpression, blockEnv);
      }
      case "var": {
        return this.evalVarExpression(exp as VarExpression, env);
      }
      case "set": {
        return this.evalSetExpression(exp as SetExpression, env);
      }
      case "if": {
        return this.evalIfExpression(exp as IfExpression, env);
      }
      case "switch": {
        return this.evalSwitchExpression(exp as SwitchExpression, env);
      }
      case "for": {
        return this.evalForExpression(exp as ForExpression, env);
      }
      case "while": {
        return this.evalWhileExpression(exp as WhileExpression, env);
      }
      case "def": {
        return this.evalDefExpression(exp as DefExpression, env);
      }
      case "lambda": {
        return this.evalLambdaExpression(exp as LambdaExpression, env);
      }
      case "class": {
        return this.evalClassExpression(exp as ClassExpression, env);
      }
      case "new": {
        return this.evalClassInstantiationExpression(
          exp as ClassInstantiationExpression,
          env
        );
      }
      case "super": {
        return this.evalSuperExpression(exp as SuperExpression, env);
      }
      case "prop": {
        return this.evalPropExpression(exp as PropExpression, env);
      }
      case "module": {
        return this.evalModuleExpression(exp as ModuleExpression, env);
      }
      case "import": {
        return this.evalImportExpression(exp as ImportExpression, env);
      }
      default:
        return this.evalFunctionCall(exp, env);
    }
  }

  private evalBlockExpression(
    blockExpression: BlockExpression,
    env: Scope
  ): Expression {
    const [_, ...expressions] = blockExpression;

    let result: Expression;
    expressions.forEach((exp: Expression) => {
      result = this.eval(exp, env);
    });

    return result!;
  }

  private evalBody(body: Expression, env: Scope): Expression {
    if (Array.isArray(body) && body[0] === "begin") {
      return this.evalBlockExpression(body as BlockExpression, env);
    }
    return this.eval(body, env);
  }

  private callUserDefinedFunction(
    fn: FunctionDefinition,
    args: Expression[]
  ): Expression {
    const activationRecord = new Map<string, any>();

    fn.params.forEach((param: string, index: number) => {
      activationRecord.set(param, args[index]);
    });

    const activationEnv = new Scope(
      activationRecord,
      fn.env // captured environment
    );

    return this.evalBody(fn.body, activationEnv);
  }

  readonly global: Scope;
  readonly transformer: Transformer;

  constructor(global = GlobalEnvironment()) {
    this.global = global;
    this.transformer = new Transformer();
  }

  /**
   * Evaluates an expression wrapped in a block
   */
  evalGlobal(exp: Expression): Expression {
    return this.evalBody(exp, this.global);
  }

  /**
   * Evaluates an expression in the provided environment
   */
  eval(exp: Expression, env: Scope = this.global): Expression {
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

    throw new InvalidSyntaxError(`Unknown expression: ${JSON.stringify(exp)}`);
  }
}
