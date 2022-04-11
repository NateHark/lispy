export enum TokenType {
    Number,
    String,
}

export class Token {
    readonly type: TokenType;
    readonly value: any;

    constructor(type: TokenType, value: any) {
        this.type = type;
        this.value = value;
    }
}

export class Tokenizer {
    readonly input: string[];

    pos: number = 0;

    constructor(formula: string) {
        this.input = Array.from(formula);
    }

    hasMoreTokens(): boolean {
        return this.pos < this.input.length; 
    }

    isEOF(): boolean {
        return this.pos == this.input.length;
    }

    getNextToken(): any  {
        if (!this.hasMoreTokens()) {
            return null;
        }

        // NumericLiteral
        if (!Number.isNaN(Number(this.input[this.pos]))) {
            let number = '';
            while (!Number.isNaN(Number(this.input[this.pos]))) {
                number += this.input[this.pos++];
            }

            return new Token(TokenType.Number, Number(number));
        }

        // StringLiteral
        if (this.input[this.pos] === '"') {
            let s = this.input[this.pos++];
            while (this.input[this.pos] !== '"' && !this.isEOF()) {
                s += this.input[this.pos++];
            }
            // Consume closing double-quote
            s+= this.input[this.pos++];

            return new Token(TokenType.String, s);
        }
    }
}