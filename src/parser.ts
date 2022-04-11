import { ASTNode, ASTNodeType } from './ast';
import { Token, Tokenizer, TokenType } from './tokenizer';

export class Parser {
    readonly formula: string
    readonly tokenizer: Tokenizer;

    lookahead?: Token;

    constructor(formula: string) {
        this.formula = formula;
        this.tokenizer = new Tokenizer(formula);
    }

    parse(): ASTNode {
        // Obtain the first token as our lookahead value
        this.lookahead = this.tokenizer.getNextToken();

        return this.program();
    }

    eat(tokenType: TokenType): Token {
        const token = this.lookahead;
        if (token == null) {
            throw new InvalidSyntaxError(`Unexpected end of input, expected: ${tokenType}`);
        }

        if (token.type != tokenType) {
            throw new InvalidSyntaxError(`Unexpected token: ${token.type}, expected: ${tokenType}`);
        }

        // Move to the next token
        this.lookahead = this.tokenizer.getNextToken();

        return token;
    }

    /**
     * Main entry point.
     * 
     * Program
     *  : NumericLiteral
     *  ;
     */
    program(): ASTNode {
        return new ASTNode(ASTNodeType.Program, this.literal());
    }

    /**
     * Literal
     *  : NumericLiteral
     *  | StringLiteral
     * ;
     */
    literal() {
        switch (this.lookahead?.type) {
            case TokenType.Number: return this.numericLiteral();
            case TokenType.String: return this.stringLiteral();
        }

        throw new InvalidSyntaxError(`Unexpected literal`);
    }

    /**
     * NumericLiteral
     *  : Number
     *  ;
     */
    numericLiteral(): ASTNode {
        let token = this.eat(TokenType.Number);
        return new ASTNode(ASTNodeType.NumericLiteral, token.value);
    }

    /**
     * StringLiteral
     *  : String
     *  ;
     */
    stringLiteral(): ASTNode {
        let token = this.eat(TokenType.String);
        return new ASTNode(ASTNodeType.StringLiteral, token.value.replaceAll('"', ''));
    }
}

export class InvalidSyntaxError extends Error {
    constructor(message: string) {
        super(message);
    }
}