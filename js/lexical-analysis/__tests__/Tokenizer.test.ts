import { describe, test } from "@jest/globals";
import Tokenizer from "../src/Tokenizer";
import TokenType from "../src/TokenType";
import Token from "../src/Token";

describe("Tokenizer", () => {
  describe("Reading keywords", () => {
    const testCases = [
      { input: "if", expected: TokenType.If },
      { input: "else", expected: TokenType.Else },
      { input: "while", expected: TokenType.While },
      { input: "for", expected: TokenType.For },
      { input: "break", expected: TokenType.Break },
      { input: "continue", expected: TokenType.Continue },
      { input: "return", expected: TokenType.Return },
      { input: "function", expected: TokenType.Function },
      { input: "var", expected: TokenType.Var },
      { input: "const", expected: TokenType.Const },
      { input: "let", expected: TokenType.Let },
      { input: "class", expected: TokenType.Class },
      { input: "extends", expected: TokenType.Extends },
      { input: "super", expected: TokenType.Super },
      { input: "this", expected: TokenType.This },
      { input: "new", expected: TokenType.New },
      { input: "import", expected: TokenType.Import },
      { input: "from", expected: TokenType.From },
      { input: "export", expected: TokenType.Export },
      { input: "default", expected: TokenType.Default },
      { input: "null", expected: TokenType.Null },
      { input: "true", expected: TokenType.True },
      { input: "false", expected: TokenType.False },
      { input: "async", expected: TokenType.Async },
      { input: "await", expected: TokenType.Await },
      { input: "of", expected: TokenType.Of },
      { input: "in", expected: TokenType.In },
      { input: "delete", expected: TokenType.Delete },
      { input: "instanceof", expected: TokenType.Instanceof },
      { input: "debugger", expected: TokenType.Debugger },
      { input: "void", expected: TokenType.Void },
      { input: "yield", expected: TokenType.Yield },
      { input: "try", expected: TokenType.Try },
      { input: "catch", expected: TokenType.Catch },
      { input: "finally", expected: TokenType.Finally },
      { input: "throw", expected: TokenType.Throw },
      { input: "case", expected: TokenType.Case },
      { input: "switch", expected: TokenType.Switch },
      { input: "default", expected: TokenType.Default },
      { input: "static", expected: TokenType.Static },
      { input: "export", expected: TokenType.Export },
    ];

    testCases.forEach(({ input, expected }) => {
      test(`Read '${input}'`, () => {
        const tokenizer = new Tokenizer(input);
        const token = tokenizer.tokenize().next().value as Token;
        expect(token.type).toEqual(expected);

        if (
          token.type.label === TokenType.True.label ||
          token.type.label === TokenType.False.label
        ) {
          expect(typeof token.value).toBe("boolean");
        }
      });
    });
  });

  describe("Reading operators", () => {
    const testCases = [
      { input: "+", expected: TokenType.Operator },
      { input: "-", expected: TokenType.Operator },
      { input: "*", expected: TokenType.Operator },
      { input: "/", expected: TokenType.Operator },
      { input: "%", expected: TokenType.Operator },
      { input: "++", expected: TokenType.Operator },
      { input: "--", expected: TokenType.Operator },
      { input: "=", expected: TokenType.Operator },
      { input: "==", expected: TokenType.Operator },
      { input: "===", expected: TokenType.Operator },
      { input: "!=", expected: TokenType.Operator },
      { input: "!==", expected: TokenType.Operator },
      { input: ">", expected: TokenType.Operator },
      { input: "<", expected: TokenType.Operator },
      { input: ">=", expected: TokenType.Operator },
      { input: "<=", expected: TokenType.Operator },
      { input: "&&", expected: TokenType.Operator },
      { input: "||", expected: TokenType.Operator },
      { input: "!", expected: TokenType.Operator },
      { input: "&", expected: TokenType.Operator },
      { input: "|", expected: TokenType.Operator },
      { input: "^", expected: TokenType.Operator },
      { input: "~", expected: TokenType.Operator },
      { input: "<<", expected: TokenType.Operator },
      { input: ">>", expected: TokenType.Operator },
      { input: ">>>", expected: TokenType.Operator },
      { input: "+=", expected: TokenType.Operator },
      { input: "-=", expected: TokenType.Operator },
      { input: "*=", expected: TokenType.Operator },
      { input: "/=", expected: TokenType.Operator },
      { input: "%=", expected: TokenType.Operator },
      { input: "&=", expected: TokenType.Operator },
      { input: "|=", expected: TokenType.Operator },
      { input: "^=", expected: TokenType.Operator },
      { input: "<<=", expected: TokenType.Operator },
      { input: ">>=", expected: TokenType.Operator },
      { input: ">>>=", expected: TokenType.Operator },
    ];

    testCases.forEach(({ input, expected }) => {
      test(`Read '${input}'`, () => {
        const tokenizer = new Tokenizer(input);
        const token = tokenizer.tokenize().next().value as Token;
        expect(token.type).toEqual(expected);
        expect(typeof token.value).toBe("string");
      });
    });
  });

  describe("Reading punctuations", () => {
    const testCases = [
      { input: "(", expected: TokenType.Punctuation },
      { input: ")", expected: TokenType.Punctuation },
      { input: "{", expected: TokenType.Punctuation },
      { input: "}", expected: TokenType.Punctuation },
      { input: "[", expected: TokenType.Punctuation },
      { input: "]", expected: TokenType.Punctuation },
      { input: ";", expected: TokenType.Punctuation },
      { input: ",", expected: TokenType.Punctuation },
      { input: ".", expected: TokenType.Punctuation },
      { input: ":", expected: TokenType.Punctuation },
      { input: "?", expected: TokenType.Punctuation },
    ];

    testCases.forEach(({ input, expected }) => {
      test(`Read '${input}'`, () => {
        const tokenizer = new Tokenizer(input);
        const token = tokenizer.tokenize().next().value as Token;
        expect(token.type).toEqual(expected);
        expect(typeof token.value).toBe("string");
      });
    });
  });

  describe("Reading numbers", () => {
    const testCases = [
      {
        input: "0",
        expected: TokenType.decorateTokenWithInfo(TokenType.Number, {
          isHexNumber: false,
        }),
      },
      {
        input: "1",
        expected: TokenType.decorateTokenWithInfo(TokenType.Number, {
          isHexNumber: false,
        }),
      },
      {
        input: "123",
        expected: TokenType.decorateTokenWithInfo(TokenType.Number, {
          isHexNumber: false,
        }),
      },
      {
        input: "123.456",
        expected: TokenType.decorateTokenWithInfo(TokenType.Number, {
          isHexNumber: false,
        }),
      },
      {
        input: "123e4",
        expected: TokenType.decorateTokenWithInfo(TokenType.Number, {
          isHexNumber: false,
        }),
      },
      {
        input: "123e-4",
        expected: TokenType.decorateTokenWithInfo(TokenType.Number, {
          isHexNumber: false,
        }),
      },
      {
        input: "123e+4",
        expected: TokenType.decorateTokenWithInfo(TokenType.Number, {
          isHexNumber: false,
        }),
      },
    ];

    testCases.forEach(({ input, expected }) => {
      test(`Read '${input}'`, () => {
        const tokenizer = new Tokenizer(input);
        const token = tokenizer.tokenize().next().value as Token;
        expect(token.type).toEqual(expected);
        expect(typeof token.value).toBe("number");
      });
    });
  });

  describe("Reading strings", () => {
    const testCases = [
      { input: "'hello'", expected: TokenType.String },
      { input: '"hello"', expected: TokenType.String },
      { input: "'hello\nworld'", expected: TokenType.String },
    ];

    testCases.forEach(({ input, expected }) => {
      test(`Read '${input}'`, () => {
        const tokenizer = new Tokenizer(input);
        const token = tokenizer.tokenize().next().value as Token;
        expect(token.type).toEqual(expected);
        expect(typeof token.value).toBe("string");
      });
    });
  });

  describe("Reading identifiers", () => {
    const testCases = [
      { input: "a", expected: TokenType.Identifier },
      { input: "a1", expected: TokenType.Identifier },
      { input: "a1_", expected: TokenType.Identifier },
      { input: "a1_b2", expected: TokenType.Identifier },
      { input: "a1_b2_c3", expected: TokenType.Identifier },
      { input: "$abc", expected: TokenType.Identifier },
    ];

    testCases.forEach(({ input, expected }) => {
      test(`Read '${input}'`, () => {
        const tokenizer = new Tokenizer(input);
        const token = tokenizer.tokenize().next().value as Token;
        expect(token.type).toEqual(expected);
        expect(typeof token.value).toBe("string");
      });
    });
  });

  describe("Skip comments", () => {
    const testCases = [
      { input: "// comment", expected: TokenType.EOF },
      { input: "/* comment */", expected: TokenType.EOF },
      { input: "/* comment\ncomment */", expected: TokenType.EOF },
      { input: "/* comment\ncomment */", expected: TokenType.EOF },
      { input: "// comment\n// comment", expected: TokenType.EOF },
      { input: "// comment\n// comment\n", expected: TokenType.EOF },
    ];

    testCases.forEach(({ input, expected }) => {
      test(`Skip '${input}'`, () => {
        const tokenizer = new Tokenizer(input);
        const token = tokenizer.tokenize().next().value as Token;
        expect(token.type).toEqual(expected);
      });
    });
  });

  describe("Skip whitespaces", () => {
    const testCases = [
      { input: " ", expected: TokenType.EOF },
      { input: "\t", expected: TokenType.EOF },
      { input: "\n", expected: TokenType.EOF },
      { input: "\r", expected: TokenType.EOF },
      { input: "\r\n", expected: TokenType.EOF },
      { input: " \t\n\r", expected: TokenType.EOF },
      { input: " \t\n\r ", expected: TokenType.EOF },
    ];

    testCases.forEach(({ input, expected }) => {
      test(`Skip '${input}'`, () => {
        const tokenizer = new Tokenizer(input);
        const token = tokenizer.tokenize().next().value as Token;
        expect(token.type).toEqual(expected);
      });
    });
  });

  describe("Reading entire line", () => {
    const testCases = [
      { input: "if (a === 2) { return 1; }", expected: 11 },
      { input: "if (a === 1) { return 1; } else { return 2; }", expected: 17 },
      { input: "while (a < 10) { a++; }", expected: 11 },
      { input: "for (let i = 0; i < 10; i++) { a++; }", expected: 19 },
      { input: "break;", expected: 2 },
      { input: "continue;", expected: 2 },
      { input: "return 1;", expected: 3 },
      { input: "function f() { return 1; }", expected: 9 },
      { input: "var a = 1;", expected: 5 },
      { input: "const a = 1;", expected: 5 },
      { input: "let a = 1;", expected: 5 },
      { input: "class A {}", expected: 4 },
      { input: "class A extends B {}", expected: 6 },
      {
        input: "class A extends B { constructor() { super(); } }",
        expected: 15,
      },
      { input: "this", expected: 1 },
      { input: "new A()", expected: 4 },
      { input: "import A from 'a'", expected: 4 },
      { input: "import { A } from 'a'", expected: 6 },
      { input: "import * as A from 'a'", expected: 6 },
      { input: "import A, { B } from 'a'", expected: 8 },
      { input: "import A, * as B from 'a'", expected: 8 },
      { input: "import A, { B, C } from 'a'", expected: 10 },
      { input: "export default A", expected: 3 },
      { input: "export { A }", expected: 4 },
      { input: "export { A, B }", expected: 6 },
      { input: "export * from 'a'", expected: 4 },
      { input: "export { A, B } from 'a'", expected: 8 },
    ];

    testCases.forEach(({ input, expected }) => {
      test(`Read '${input}'`, () => {
        const tokenizer = new Tokenizer(input);
        let count = 0;
        for (const _ of tokenizer.tokenize()) {
          count++;
        }
        // + 1 => Count TokenType.EOF
        expect(count).toEqual(expected + 1);
      });
    });
  });

  describe("Skip comments between lines", () => {
    const testCases = [
      { input: "if (a === 2) { return 1; } // comment", expected: 11 },
      {
        input: "if (a === 1) { return 1; } else { return 2; } // comment",
        expected: 17,
      },
      { input: "while (a < 10) { a++; } // comment", expected: 11 },
      {
        input: "for (let i = 0; i < 10; i++) {\n\ta++;\n} // comment",
        expected: 19,
      },
      { input: "break; // comment", expected: 2 },
      { input: "continue; // comment", expected: 2 },
      { input: "return 1; // comment", expected: 3 },
      { input: "function f() { return 1; } // comment", expected: 9 },
      { input: "var a = 1; // comment", expected: 5 },
      { input: "const a = 1; // comment", expected: 5 },
      { input: "let a = 1; // comment", expected: 5 },
      {
        input:
          "class A {}\n// comment\nexport default A;\n/* DO NOT! */\n// Test this",
        expected: 8,
      },
      {
        input: "class A extends B {}\n// comment\nexport default A;",
        expected: 10,
      },
      { input: "this // comment", expected: 1 },
      { input: "new A() // comment", expected: 4 },
      { input: "import A from 'a' // comment", expected: 4 },
      { input: "import { A } from 'a' // comment", expected: 6 },
      { input: "import * as A from 'a' // comment", expected: 6 },
      { input: "import A, { B } from 'a' // comment", expected: 8 },
      { input: "import A, * as B from 'a' // comment", expected: 8 },
      { input: "import A, { B, C } from 'a' // comment", expected: 10 },
      { input: "export default A // comment", expected: 3 },
      { input: "export { A } // comment", expected: 4 },
      { input: "export { A, B } // comment", expected: 6 },
      { input: "export * from 'a' // comment", expected: 4 },
      { input: "export { A, B } from 'a' // comment", expected: 8 },
      {
        expected: 19,
        input:
          "class A extends B { constructor() { super(); } }\n// comment\nexport default A;",
      },
      {
        input: "if (a === 2) { return 1; } // comment\n// comment",
        expected: 11,
      },
      {
        input:
          "if (a === 1) { return 1; } else { return 2; } // comment\n// comment",
        expected: 17,
      },
      {
        input: "while (a < 10) { a++; } // comment\n// comment",
        expected: 11,
      },
      {
        input:
          "for (let i = 0; i < 10; i++) {\n\ta++;\n} // comment\n// comment",
        expected: 19,
      },
      { input: "break; // comment\n// comment", expected: 2 },
      { input: "continue; // comment\n// comment", expected: 2 },
      { input: "return 1; // comment\n// comment", expected: 3 },
      {
        input: "function f() { return 1; } // comment\n// comment",
        expected: 9,
      },
      { input: "var a = 1; // comment\n// comment", expected: 5 },
      { input: "const a = 1; // comment\n// comment", expected: 5 },
      { input: "let a = 1; // comment\n// comment", expected: 5 },
      {
        input:
          "class A {}\n// comment\nexport default A;\n/* DO NOT! */\n// Test this\n// comment",
        expected: 8,
      },
      {
        input:
          "class A extends B {}\n// comment\nexport default A;\n// comment",
        expected: 10,
      },
      { input: "this // comment\n// comment", expected: 1 },
      { input: "new A() // comment\n// comment", expected: 4 },
      { input: "import A from 'a' // comment\n// comment", expected: 4 },
      { input: "import { A } from 'a' // comment\n// comment", expected: 6 },
      { input: "import * as A from 'a' // comment\n// comment", expected: 6 },
      { input: "import A, { B } from 'a' // comment\n// comment", expected: 8 },
    ];

    testCases.forEach(({ input, expected }) => {
      test(`Read '${input}'`, () => {
        const tokenizer = new Tokenizer(input);
        let count = 0;
        for (const _ of tokenizer.tokenize()) {
          count++;
        }
        // + 1 => Count TokenType.EOF
        expect(count).toEqual(expected + 1);
      });
    });
  });

  describe("Validity of tokens", () => {
    const testCases = [
      {
        input: "if (a === 2) { return 1; }",
        expected: [
          // TokenType, value, start, end, line, columnStart, columnEnd
          new Token(TokenType.If, "if", 0, 2, 1, 0, 2),
          new Token(TokenType.Punctuation, "(", 3, 4, 1, 3, 4),
          new Token(TokenType.Identifier, "a", 4, 5, 1, 4, 5),
          new Token(TokenType.Operator, "===", 6, 9, 1, 6, 9),
          new Token(
            TokenType.decorateTokenWithInfo(TokenType.Number, {
              isHexNumber: false,
            }),
            2,
            10,
            11,
            1,
            10,
            11
          ),
          new Token(TokenType.Punctuation, ")", 11, 12, 1, 11, 12),
          new Token(TokenType.Punctuation, "{", 13, 14, 1, 13, 14),
          new Token(TokenType.Return, "return", 15, 21, 1, 15, 21),
          new Token(
            TokenType.decorateTokenWithInfo(TokenType.Number, {
              isHexNumber: false,
            }),
            1,
            22,
            23,
            1,
            22,
            23
          ),
          new Token(TokenType.Punctuation, ";", 23, 24, 1, 23, 24),
          new Token(TokenType.Punctuation, "}", 25, 26, 1, 25, 26),
          new Token(TokenType.EOF, "")
        ],
      },
      // Generate more tests
      {
        input: "if (a === 1) { return 1; } else { return 2; }",
        expected: [
          new Token(TokenType.If, "if", 0, 2, 1, 0, 2),
          new Token(TokenType.Punctuation, "(", 3, 4, 1, 3, 4),
          new Token(TokenType.Identifier, "a", 4, 5, 1, 4, 5),
          new Token(TokenType.Operator, "===", 6, 9, 1, 6, 9),
          new Token(
            TokenType.decorateTokenWithInfo(TokenType.Number, {
              isHexNumber: false,
            }),
            1,
            10,
            11,
            1,
            10,
            11
          ),
          new Token(TokenType.Punctuation, ")", 11, 12, 1, 11, 12),
          new Token(TokenType.Punctuation, "{", 13, 14, 1, 13, 14),
          new Token(TokenType.Return, "return", 15, 21, 1, 15, 21),
          new Token(
            TokenType.decorateTokenWithInfo(TokenType.Number, {
              isHexNumber: false,
            }),
            1,
            22,
            23,
            1,
            22,
            23
          ),
          new Token(TokenType.Punctuation, ";", 23, 24, 1, 23, 24),
          new Token(TokenType.Punctuation, "}", 25, 26, 1, 25, 26),
          new Token(TokenType.Else, "else", 27, 31, 1, 27, 31),
          new Token(TokenType.Punctuation, "{", 32, 33, 1, 32, 33),
          new Token(TokenType.Return, "return", 34, 40, 1, 34, 40),
          new Token(
            TokenType.decorateTokenWithInfo(TokenType.Number, {
              isHexNumber: false,
            }),
            2,
            41,
            42,
            1,
            41,
            42
          ),
          new Token(TokenType.Punctuation, ";", 42, 43, 1, 42, 43),
          new Token(TokenType.Punctuation, "}", 44, 45, 1, 44, 45),
          new Token(TokenType.EOF, "")
        ],
      },
      {
        input: "while (a < 10) { a++; }",
        expected: [
          new Token(TokenType.While, "while", 0, 5, 1, 0, 5),
          new Token(TokenType.Punctuation, "(", 6, 7, 1, 6, 7),
          new Token(TokenType.Identifier, "a", 7, 8, 1, 7, 8),
          new Token(TokenType.Operator, "<", 9, 10, 1, 9, 10),
          new Token(
            TokenType.decorateTokenWithInfo(TokenType.Number, {
              isHexNumber: false,
            }),
            10,
            11,
            13,
            1,
            11,
            13
          ),
          new Token(TokenType.Punctuation, ")", 13, 14, 1, 13, 14),
          new Token(TokenType.Punctuation, "{", 15, 16, 1, 15, 16),
          new Token(TokenType.Identifier, "a", 17, 18, 1, 17, 18),
          new Token(TokenType.Operator, "++", 18, 20, 1, 18, 20),
          new Token(TokenType.Punctuation, ";", 20, 21, 1, 20, 21),
          new Token(TokenType.Punctuation, "}", 22, 23, 1, 22, 23),
          new Token(TokenType.EOF, "")
        ],
      }
    ];

    testCases.forEach(({ input, expected }) => {
      test(`Read '${input}'`, () => {
        const tokenizer = new Tokenizer(input);
        let count = 0;
        for (const token of tokenizer.tokenize()) {
          expect(token).toEqual(expected[count]);
          count++;
        }
      });
    });
  });

  describe("Reading template", () => {
    const testCases = [
      {
        input: "const a = `hello`;",
        expected: [
          new Token(TokenType.Const, "const", 0, 5, 1, 0, 5),
          new Token(TokenType.Identifier, "a", 6, 7, 1, 6, 7),
          new Token(TokenType.Operator, "=", 8, 9, 1, 8, 9),
          new Token(TokenType.TemplateStart, "`", 10, 11, 1, 10, 11),
          new Token(TokenType.TemplateContent, "hello", 11, 16, 1, 11, 16),
          new Token(TokenType.TemplateEnd, "`", 16, 17, 1, 16, 17),
          new Token(TokenType.Punctuation, ";", 17, 18, 1, 17, 18),
          new Token(TokenType.EOF, ""),
        ],
      }
    ];

    testCases.forEach(({ input, expected }) => {
      test(`Read '${input}'`, () => {
        const tokenizer = new Tokenizer(input);
        let count = 0;
        for (const token of tokenizer.tokenize()) {
          expect(token).toEqual(expected[count]);
          count++;
        }
      });
    });
  });
});
