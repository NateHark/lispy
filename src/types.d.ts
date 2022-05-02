interface Scope {
    readonly record: Map<string, any>;
    readonly parent?: Scope;

    assign: (name: string, value: Expression) => Expression;
    define: (name: string, value: any) => any;
    lookup: (name: string) => any;
    resolve: (name: string) => Scope;
};

type StringLiteral = string;
type NumericLiteral = number;
type Identifier = string;
type FunctionDefinition = {
    params: ListExpression,
    body: Expression,
    env: Scope,
};

type Atom = NumericLiteral | StringLiteral | Identifier | Function;

type ListExpression = [string, ...any];
type Expression = Atom | ListExpression | FunctionDefinition | Scope;

// (++ x)
type IncrementExpression = ['++', string];

// (+= x 2)
type IncrementByValueExpression = ['+=', string, string | number];

// (-- x)
type DecrementExpression = ['--', string];

// (-= x 2)
type DecrementByValueExpression = ['-=', string, string | number];

// (set x 1)
type SetExpression = ['set', string, Expression];

// (begin ...)
type BlockExpression = ['begin', ...Expression[]];

// (var x 1)
type VarExpression = ['var', string, Expression];

// (if (condition) (expression) (else))
//
// (if (>= x 0) 
//     (print "is positive") 
//     (print "is negative"))
type IfExpression = ['if', Expression, Expression, Expression];

// (switch (case) (case) ... (default))
//
// (switch ((> x 1) 100)
//         ((= x 1) (+ 100 1))
//         ((< x 1) 300)
//         (else 0))
type SwitchExpression = ['switch', ...[[Expression, Expression]]];

// (for (init) (condition) (modifier) (body))
//
// (for (var y 0)
//      (< y 10)
//      (++ y) 
//      (set x (+ x y)))
type ForExpression = ['for', Expression, Expression, Expression, Expression];

// (while (condition) (body))
//
// (while (< counter 10)
//     (begin
//         (set result (+ result 1))
//         (set counter (+ counter 1))))
type WhileExpression = ['while', Expression, Expression];

// (def (args) (body))
//
// (def square (x)
//     (* x x))
type DefExpression = ['def', string, Expression, Expression];

// ((lambda (args) (body)))
//
// ((lambda (x) (* x x)) 2)
type LambdaExpression = ['lambda', ListExpression, Expression];

// (class name parent (body))
//
// (class Point null
//     (begin
//         (def constructor (self x y)
//             (begin
//                 (set (prop self x) x)
//                 (set (prop self y) y)))
//         (def calc (self)
//             (+ (prop self x) (prop self y)))))
type ClassExpression = ['class', string, Expression, Expression];

// (new name (args))
//
// (var p (new Point 10 20))
type ClassInstantiationExpression = ['new', string, Expression, ...Expression[]];

// (super name)
//
// (super Point)
type SuperExpression = ['super', string];

// (prop ref name)
//
// (prop this name)
type PropExpression = ['prop', string, string];

// (module name (body))
//
// (module Math
//     (begin
//         (def square (x) 
//             (* x x))))
type ModuleExpression = ['module', string, ...Expression[]];

// (import args name)
//
// (import Math)
// (import (square) Math)
type ImportExpression = ['import', ListExpression, string];