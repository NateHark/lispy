export enum ASTNodeType {
    Program,
    NumericLiteral,
    StringLiteral,
}

export class ASTNode {
    readonly type: ASTNodeType;
    readonly value: any;

    constructor(type: ASTNodeType, value: any) {
        this.type = type;
        this.value = value;
    }
}