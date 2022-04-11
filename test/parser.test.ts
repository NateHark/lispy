import { ASTNode, ASTNodeType } from '../src/ast';
import { Parser } from '../src/parser';


describe('Parser', () => {
  describe('NumericLiteral', () => {
    it('Program is a valid NumericLiteral', () => {
      const parser = new Parser('42');
      const ast = parser.parse();
      expect(ast.type).toBe(ASTNodeType.Program);
      const numericLiteral = ast.value;
      expect(numericLiteral.value).toBe(42);
    });
  });

  describe('StringLiteral', () => {
    it('Program is a valid StringLiteral', () => {
      const parser = new Parser('"hello"');
      const ast = parser.parse();
      expect(ast.type).toBe(ASTNodeType.Program);
      const stringLiteral = ast.value;
      expect(stringLiteral.value).toBe('hello');
    });
  });
});