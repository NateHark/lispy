import { Tokenizer, TokenType } from '../src/tokenizer';

describe('Tokenizer', () => {

  describe('NumericLiteral', () => {
    it('should return a single digit', () => {
      let tokenizer = new Tokenizer('1');
      let token = tokenizer.getNextToken();
      expect(token.type).toBe(TokenType.Number);
      expect(token.value).toBe('1');
    });

    it('should return a multi digit number', () => {
      let tokenizer = new Tokenizer('123');
      let token = tokenizer.getNextToken();
      expect(token.type).toBe(TokenType.Number);
      expect(token.value).toBe('123');
    });
  });

  describe('StringLiteral', ()=> {
    it('should return an empty string token', () => {
      let tokenizer = new Tokenizer('\'\'');
      let token = tokenizer.getNextToken();
      expect(token.type).toBe(TokenType.String);
      expect(token.value).toBe('\'\'');
    });

    it('should return an empty string token', () => {
      let tokenizer = new Tokenizer('""');
      let token = tokenizer.getNextToken();
      expect(token.type).toBe(TokenType.String);
      expect(token.value).toBe('""');
    });

    it('should return a single character token', () => {
      let tokenizer = new Tokenizer('"a"');
      let token = tokenizer.getNextToken();
      expect(token.type).toBe(TokenType.String);
      expect(token.value).toBe('"a"');
    });

    it('should return a multi-character token', () => {
      let tokenizer = new Tokenizer('"abc"');
      let token = tokenizer.getNextToken();
      expect(token.type).toBe(TokenType.String);
      expect(token.value).toBe('"abc"');
    });

    it('should return a number as a string', () => {
      let tokenizer = new Tokenizer('"123"');
      let token = tokenizer.getNextToken();
      expect(token.type).toBe(TokenType.String);
      expect(token.value).toBe('"123"');
    });
  });

})