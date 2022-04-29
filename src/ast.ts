interface Environment {
    readonly record: Map<string, any>;
    readonly parent?: Environment;

    assign: (name: string, value: any) => any;
    define: (name: string, value: any) => any;
    lookup: (name: string) => any;
    resolve: (name: string) => Environment;
};

type StringLiteral = string;
type NumericLiteral = number;
type Identifier = string;

type Atom = NumericLiteral | StringLiteral | Identifier | Function;
type ListExpression = [string, ...any];
type LambdaExpression = {
    params: ListExpression,
    body: ListExpression,
    env: Environment,
};

type Expression = Atom | ListExpression | LambdaExpression | Environment;