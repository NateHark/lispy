import { InvalidSyntaxError } from "./exceptions";
export enum TokenType {
    Whitespace,
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

const TokenSpec: Array<[RegExp, TokenType]>  = [
    // Whitespace
    [/^\s+/, TokenType.Whitespace],

    // Numbers
    [/^\d+/, TokenType.Number],

    // Strings
    [/^"[^"]*"/, TokenType.String],
    [/^'[^']*'/, TokenType.String],
];

export class Tokenizer {
    readonly input: string;

    cursor: number = 0;

    constructor(input: string) {
        this.input = input;
    }

    hasMoreTokens(): boolean {
        return this.cursor < this.input.length; 
    }

    isEOF(): boolean {
        return this.cursor == this.input.length;
    }

    match(regexp: RegExp, str: string): String | null {
        const matched = regexp.exec(str);
        if (matched == null) {
            return null;
        }

        this.cursor += matched[0].length;
        return matched[0];
    }

    getNextToken(): any  {
        if (!this.hasMoreTokens()) {
            return null;
        }

        const str = this.input.slice(this.cursor);

        for (const [regexp, tokenType] of TokenSpec) {
            const tokenValue = this.match(regexp, str);
            if (tokenValue == null) {
                continue;
            }

            if (tokenType === TokenType.Whitespace) {
                return this.getNextToken();
            }

            return new Token(tokenType, tokenValue);
        }

        throw new InvalidSyntaxError(`Unexpected token: ${str[0]}`);
    }
}