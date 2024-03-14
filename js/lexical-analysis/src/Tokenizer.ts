import Token from "./Token";
import TokenType from "./TokenType";
import EmptySourceCodeException from "./exceptions/EmptySourceCodeException";

interface BasicToken {
  start: number;
  end: number;
  value: string;
  columnStart: number;
  columnEnd: number;
}

interface ReadTemplate extends BasicToken {}

interface ReadIdentifier extends BasicToken {}

interface ReadString extends BasicToken {}

interface ReadPunctuation extends BasicToken {}

interface ReadNumber extends Omit<BasicToken, "value"> {
  value: number;
}

interface Params {
  radix: number;
  startsWithDot: boolean;
}

/**
 * @author Daniele Castiglia
 */
export default class Tokenizer {
  private currentLine: number;
  private currentPosition: number;
  private currentToken: Token;
  private previousToken: Token;
  private currentChar: string | null = null;
  private nextChar: string | null = null;
  private currentCharCode: number | null = null;
  private nextCharCode: number | null = null;
  private currentLineColumnCount: number;

  // Unicode code points
  private static readonly BMP_MIN = 0xd7ff; // 55295
  private static readonly BMP_MAX = 0xdc00; // 56320
  private static readonly SURROGATE_MIN = 0xdbff; // 56319
  private static readonly SURROGATE_MAX = 0xe000; // 57344

  public constructor(private readonly source: string) {
    if (source.length === 0) {
      throw new EmptySourceCodeException();
    }

    this.currentLineColumnCount = 0;
    this.currentLine = 1;
    this.currentPosition = 0;
    this.currentChar = source[0];
    this.nextChar = source[1];
    this.currentToken = new Token(TokenType.EOF, "");
    this.previousToken = new Token(TokenType.EOF, "");

    if (this.currentChar && this.nextChar) {
      this.currentCharCode = this.charCodeAtCurrentPosition();
    }

    if (this.nextChar && source[2]) {
      this.nextCharCode = this._charCodeAtPosition(this.nextChar, source[2]);
    }
  }

  public *tokenize() {
    this.goToNextToken();

    while (this.currentPosition < this.source.length) {
      this.previousToken = this.currentToken;

      if (this.currentCharCode === 96) {
        for (const template of this.readTemplate()) {
          yield template;
        }
        continue;
      } else {
        this.currentToken = this.readToken();
      }

      yield this.currentToken;
      this.goToNextToken();
    }

    yield new Token(TokenType.EOF, "");
  }

  private *readTemplate() {
    this.currentToken = new Token(
      TokenType.TemplateStart,
      "`",
      this.currentPosition,
      this.currentPosition + 1,
      this.currentLine,
      this.currentLineColumnCount,
      this.currentLineColumnCount + 1
    );
    this.updatePosition();
    yield this.currentToken;

    let content = '';
    let currentChar = this.currentCharCode!;
    let nextChar = this.nextCharCode!;
    let count = this.currentPosition;
    while (currentChar !== 96) {
      // ${
      if (currentChar === 36 && nextChar === 123) {
        yield new Token(
          TokenType.TemplateContent,
          content,
          count - content.length,
          count,
          this.currentLine,
          this.currentLineColumnCount - content.length,
          this.currentLineColumnCount
        );

        yield new Token(
          TokenType.TemplateExpressionStart,
          "${",
          count,
          count + 1,
          this.currentLine,
          this.currentLineColumnCount,
          this.currentLineColumnCount + 2
        );
        ++count;

        this.updatePosition(2);

        while (this.currentCharCode !== 125) {
          yield this.readToken();
        }

        this.updatePosition();
        yield new Token(
          TokenType.TemplateExpressionEnd,
          "}",
          count,
          count + 1,
          this.currentLine,
          this.currentLineColumnCount,
          this.currentLineColumnCount + 1
        );
        ++count;
      }

      content += this.source[count];
      currentChar = this._charCodeAtPosition(
        this.source[++count],
        this.source[count + 1]
      );
    }

    yield new Token(
      TokenType.TemplateContent,
      content,
      count - content.length,
      count,
      this.currentLine,
      this.currentLineColumnCount - content.length,
      this.currentLineColumnCount
    );

    this.currentToken = new Token(
      TokenType.TemplateEnd,
      "`",
      count,
      count + 1,
      this.currentLine,
      this.currentLineColumnCount,
      this.currentLineColumnCount + 1
    );

    yield this.currentToken;
    this.updatePosition(count);
  }

  private readToken(): Token {
    if (this.isReadingIdentifier()) {
      const identifier = this.readIdentifier();

      if (identifier.value === "true" || identifier.value === "false") {
        return new Token(
          identifier.value === "true" ? TokenType.True : TokenType.False,
          identifier.value === "true",
          identifier.start,
          identifier.end,
          this.currentLine,
          identifier.columnStart,
          identifier.columnEnd
        );
      }

      return new Token(
        TokenType.getTokenTypeFromString(identifier.value),
        identifier.value,
        identifier.start,
        identifier.end,
        this.currentLine,
        identifier.columnStart,
        identifier.columnEnd
      );
    }

    switch (this.currentCharCode) {
      case 40: // (
      case 41: // )
      case 44: // ,
      case 58: // :
      case 59: // ;
      case 91: // [
      case 93: // ]
      case 123: // {
      case 125: // }
      case 63: // ?
      case 125: {
        const punctuation = new Token(
          TokenType.Punctuation,
          this.currentChar!,
          this.currentPosition,
          this.currentPosition + 1,
          this.currentLine,
          this.currentLineColumnCount,
          this.currentLineColumnCount + 1
        );
        this.updatePosition();
        return punctuation;
      }
      case 46: // .
        if (this.nextCharCode! >= 48 && this.nextCharCode! <= 57) {
          const number = this.readNumber();
          return new Token(
            TokenType.decorateTokenWithInfo(TokenType.Number, {
              isHexNumber: false,
            }),
            number.value,
            number.start,
            number.end,
            this.currentLine,
            number.columnStart,
            number.columnEnd
          );
        }

        const dots = this.readDots();
        return new Token(
          TokenType.Punctuation,
          dots.value,
          dots.start,
          dots.end,
          this.currentLine,
          dots.columnStart,
          dots.columnEnd
        );
      case 43: // +
      case 45: // -
      case 42: // *
      case 47: // /
      case 37: // %
      case 38: // &
      case 124: // |
      case 94: // ^
      case 60: // <
      case 62: // >
      case 33: // !
      case 61: // =
      case 126: // ~
        const op = this.readOperator();
        return op;
      case 48: // 0
      case 49: // 1
      case 50: // 2
      case 51: // 3
      case 52: // 4
      case 53: // 5
      case 54: // 6
      case 55: // 7
      case 56: // 8
      case 57: {
        const isNextCharX =
          this.nextCharCode === 120 || this.nextCharCode === 88;
        if (this.currentCharCode !== 48 && isNextCharX) {
          throw new Error(
            `Unexpected character '${this.nextChar}' after number ${this.currentChar}`
          );
        }

        const number = this.readNumber(isNextCharX ? 16 : 10);
        return new Token(
          TokenType.decorateTokenWithInfo(TokenType.Number, {
            isHexNumber: isNextCharX,
          }),
          number.value,
          number.start,
          number.end,
          this.currentLine,
          number.columnStart,
          number.columnEnd
        );
      }
      case 34: // "
      case 39: // '
        const str = this.readString();
        return new Token(
          TokenType.String,
          str.value,
          str.start,
          str.end,
          this.currentLine,
          str.columnStart,
          str.columnEnd
        );
      default:
        return new Token(TokenType.EOF, "");
    }
  }

  private readTemplatePart(): ReadTemplate {
    const initialColumn = this.currentLineColumnCount;

    let template = "";
    const res = {
      value: "",
      start: this.currentPosition,
      end: this.currentPosition,
      columnStart: initialColumn,
      columnEnd: initialColumn,
    } satisfies ReadTemplate;

    this.updatePosition();
    res.columnEnd += 1;
    while (this.currentCharCode !== 96) {
      if (this.currentCharCode === 92) {
        this.updatePosition();
        res.columnEnd += 1;
        switch (this.currentChar) {
          case "n" as string:
            template += "\n";
            break;
          case "t" as string:
            template += "\t";
            break;
          case "r" as string:
            template += "\r";
            break;
          case "0" as string:
            template += "\0";
            break;
          case "\\":
            template += "\\";
            break;
          case '"' as string:
            template += '"';
            break;
          case "'" as string:
            template += "'";
            break;
          default:
            template += this.currentChar;
        }
        this.updatePosition();
        res.columnEnd += 1;
      } else {
        template += this.currentChar;
      }
      this.updatePosition();
      res.end += 1;
      res.columnEnd += 1;
    }

    res.value = template;
    return res;
  }

  private readDots(): ReadPunctuation {
    const res = {
      value: ".",
      start: this.currentPosition,
      end: this.currentPosition + 1,
      columnStart: this.currentLineColumnCount,
      columnEnd: this.currentLineColumnCount,
    } satisfies ReadPunctuation;

    const nextChar = this.source[this.currentPosition + 2];
    const nextNextChar = this.source[this.currentPosition + 3];

    if (nextChar && nextNextChar) {
      const nextNextCharCode = this._charCodeAtPosition(
        this.source[this.currentPosition + 2],
        this.source[this.currentPosition + 3]
      );

      if (
        this.currentCharCode === 46 &&
        this.nextCharCode === 46 &&
        nextNextCharCode === 46
      ) {
        this.updatePosition(3);
        res.value = "...";
        res.end += 3;
        res.columnEnd += 3;
        return res;
      }
    }

    this.updatePosition();
    return res;
  }

  private readOperator(): Token {
    const initialPosition = this.currentPosition;
    const initialColumn = this.currentLineColumnCount;
    let opValue = this.currentChar!;
    this.updatePosition();

    let columnCount = initialColumn + 1;

    // Check if the next character is part of the operator
    while (this.isCurrentCharPartOfOperator()) {
      opValue += this.currentChar!;
      this.updatePosition();
      ++columnCount;
    }

    const op = new Token(
      TokenType.Operator,
      opValue,
      initialPosition,
      initialPosition + opValue.length,
      this.currentLine,
      initialColumn,
      columnCount
    );
    return op;
  }

  private readNumber(radix = 10): ReadNumber {
    const initialColumn = this.currentLineColumnCount;
    let columnCount = this.currentLineColumnCount;

    const startsWithDot =
      this.previousToken.type.label === TokenType.Punctuation.label &&
      this.previousToken.value === ".";
    const res = {
      value: "",
      start: this.currentPosition,
      end: this.currentPosition,
    };

    if (radix === 16 || radix === 8) {
      if (startsWithDot) {
        throw new Error(
          `${
            radix === 16 ? "Hexadecimal" : "Octal"
          } number cannot start with a dot`
        );
      }
      this.updatePosition(2);
      res.end += 2;
      columnCount += 2;
    }

    let dotCount = 0;
    let eCount = 0;
    while (this.isCurrentCharPartOfNumber(radix, eCount > 0)) {
      // 'e' or 'E'
      if (this.currentCharCode === 101 || this.currentCharCode === 69) {
        if (eCount > 0) {
          break;
        }
        eCount += 1;
        this.updatePosition();
        res.value += "e";
        res.end += 1;
        columnCount += 1;

        // Check for '+' or '-'
        if (
          (this.currentCharCode as number) === 43 ||
          (this.currentCharCode as number) === 45
        ) {
          res.value += this.currentChar;
          this.updatePosition();
          res.end += 1;
          columnCount += 1;
        }

        continue;
      }

      // '_'
      if (this.currentCharCode === 95) {
        this.updatePosition();
        res.end += 1;
        columnCount += 1;
        continue;
      }

      // '.'
      if (this.currentCharCode === 46) {
        if (dotCount > 0) {
          break;
        }
        dotCount += 1;
        this.updatePosition();
        res.value += ".";
        res.end += 1;
        columnCount += 1;
        continue;
      }

      let number = this.readNumberBasedOnRadix(radix);
      this.updatePosition();
      res.end += 1;
      res.value += number.toString();
      columnCount += 1;
    }

    return {
      value: parseFloat(res.value),
      start: res.start,
      end: res.end,
      columnStart: initialColumn,
      columnEnd: columnCount,
    } satisfies ReadNumber;
  }

  private readNumberBasedOnRadix(radix: number): number {
    if (this.currentCharCode! >= 48 && this.currentCharCode! <= 57) {
      return this.currentCharCode! - 48;
    } else if (
      radix === 16 &&
      this.currentCharCode! >= 65 &&
      this.currentCharCode! <= 70
    ) {
      return this.currentCharCode! - 65 + 10;
    } else if (
      radix === 16 &&
      this.currentCharCode! >= 97 &&
      this.currentCharCode! <= 102
    ) {
      return this.currentCharCode! - 97 + 10;
    } else if (
      radix === 8 &&
      this.currentCharCode! >= 48 &&
      this.currentCharCode! <= 55
    ) {
      return this.currentCharCode! - 48;
    } else {
      throw new Error(
        `Unexpected character ${this.currentChar} at position ${this.currentPosition}`
      );
    }
  }

  private readIdentifier(): ReadIdentifier {
    const initialColumn = this.currentLineColumnCount;

    let identifier = "";
    const res = {
      value: "",
      start: this.currentPosition,
      end: this.currentPosition,
      columnStart: initialColumn,
      columnEnd: initialColumn,
    } satisfies ReadIdentifier;

    while (this.isCurrentCharPartOfIdentifier()) {
      identifier += this.currentChar;
      this.updatePosition();
      res.end += 1;
      res.columnEnd += 1;
    }

    res.value = identifier;
    return res;
  }

  private readString(): ReadString {
    const initialColumn = this.currentLineColumnCount;

    let string = "";
    const res = {
      value: "",
      start: this.currentPosition,
      end: this.currentPosition,
      columnStart: initialColumn,
      columnEnd: initialColumn,
    } satisfies ReadString;

    this.updatePosition();
    res.columnEnd += 1;
    while (this.isCurrentCharPartOfString()) {
      if (this.currentCharCode === 92) {
        this.updatePosition();
        res.columnEnd += 1;
        switch (this.currentChar) {
          case "n" as string:
            string += "\n";
            break;
          case "t" as string:
            string += "\t";
            break;
          case "r" as string:
            string += "\r";
            break;
          case "0" as string:
            string += "\0";
            break;
          case "\\":
            string += "\\";
            break;
          case '"' as string:
            string += '"';
            break;
          case "'" as string:
            string += "'";
            break;
          default:
            string += this.currentChar;
        }
        this.updatePosition();
        res.columnEnd += 1;
      } else {
        string += this.currentChar;
      }
      this.updatePosition();
      res.end += 1;
      res.columnEnd += 1;
    }
    this.updatePosition();

    res.columnEnd += 1;
    res.value = string;
    return res;
  }

  private isReadingIdentifier(): boolean {
    const code = this.currentCharCode!;

    if (code < 65) {
      return code === 36;
    }

    if (code < 91) {
      return true;
    }

    if (code < 97) {
      return code === 95;
    }

    if (code < 123) {
      return true;
    }

    return false;
  }

  private isCurrentCharPartOfOperator(): boolean {
    // Define the characters that can be part of an operator
    const operatorChars = [
      "+",
      "-",
      "*",
      "/",
      "=",
      ">",
      "<",
      "%",
      "&",
      "|",
      "^",
      "!",
    ];

    return operatorChars.includes(this.currentChar!);
  }

  private isCurrentCharPartOfNumber(radix = 10, afterE = false): boolean {
    const code = this.currentCharCode ?? 0;

    if (radix === 10) {
      return (
        (code >= 48 && code <= 57) ||
        this.currentCharCode === 95 ||
        this.currentCharCode === 46 ||
        (!afterE &&
          (this.currentCharCode === 101 || this.currentCharCode === 69)) // e or E
      ); // 95 => _ | 46 => .
    }

    if (radix === 16) {
      return (
        (code >= 48 && code <= 57) ||
        (code >= 65 && code <= 70) ||
        (code >= 97 && code <= 102)
      );
    }

    return false;
  }

  private isCurrentCharPartOfString(): boolean {
    return (
      this.currentCharCode !== 34 && // "
      this.currentCharCode !== 39 // '
    );
  }

  private isCurrentCharPartOfIdentifier(): boolean {
    const code = this.currentCharCode ?? 0;

    if (code < 48) {
      return code === 36; // 36 -> $
    }

    // 0-9 (9 being 57)
    if (code < 58) {
      return true;
    }

    if (code < 65) {
      return false;
    }

    if (code < 91) {
      return true;
    }

    if (code < 97) {
      return code === 95; // 95 -> _
    }

    if (code < 123) {
      return true;
    }

    return false;
  }

  private updateCurrentLineAndPositionIfNewLine(): void {
    while (this.currentChar === "\n" || this.currentChar === "\r") {
      this.nextLine();
      this.updatePosition();
    }
  }

  private goToNextToken(): void {
    if (this.currentPosition >= this.source.length) {
      return;
    }

    let skipCharCount = 0;
    let currentCharCode = this.currentCharCode!;
    // Skip whitespaces and tabs
    while (
      currentCharCode === 32 ||
      currentCharCode === 160 ||
      currentCharCode === 9
    ) {
      if (currentCharCode === 9) {
        this.currentLineColumnCount += 4;
      }

      ++skipCharCount;

      const nextChar = this.source[this.currentPosition + skipCharCount];
      const nextCharPlusOne =
        this.source[this.currentPosition + skipCharCount + 1];
      if (!!!nextChar || !!!nextCharPlusOne) {
        break;
      }

      currentCharCode = this._charCodeAtPosition(nextChar, nextCharPlusOne);
    }
    this.updatePosition(skipCharCount);

    switch (this.currentCharCode!) {
      case 47: // /
        if (this.nextCharCode === 42) {
          // reading /* */
          this.updatePosition();
          let char = this.currentCharCode! as number;
          let nextChar = this.nextCharCode! as number;
          let count = 0;
          while (char !== 42 || nextChar !== 47) {
            if (char === 10) {
              this.nextLine();
            }

            char = nextChar;

            const nextCharPlusCount = this.source[this.currentPosition + count];
            const nextCharPlusCountPlusOne =
              this.source[this.currentPosition + count + 1];

            if (!!!nextCharPlusCount || !!!nextCharPlusCountPlusOne) {
              ++count;
              break;
            }

            nextChar = this._charCodeAtPosition(
              nextCharPlusCount,
              nextCharPlusCountPlusOne
            );
            ++count;
          }
          this.updatePosition(count + 1);
          this.goToNextToken();
        } else if (this.nextCharCode === 47) {
          // reading //
          let char = this.currentCharCode! as number;
          let count = 0;
          while (char !== 10) {
            let charPlusCount = this.source[this.currentPosition + count];
            let charPlusCountPlusOne =
              this.source[this.currentPosition + count + 1];

            if (!!!charPlusCount || !!!charPlusCountPlusOne) {
              ++count;
              break;
            }

            char = this._charCodeAtPosition(
              charPlusCount,
              charPlusCountPlusOne
            );
            ++count;
          }
          this.updatePosition(count);
          this.goToNextToken();
        }
        break;
      default:
        break;
    }

    this.updateCurrentLineAndPositionIfNewLine();

    switch (this.currentCharCode) {
      case 9:
      case 10:
      case 13:
      case 32:
      case 160:
        this.goToNextToken();
        break;
      case 47:
        if (this.nextCharCode === 47 || this.nextCharCode === 42) {
          this.goToNextToken();
        }
        break;
    }
  }

  private charCodeAtCurrentPosition(): number | null {
    if (!this.currentChar || !this.nextChar) {
      return null;
    }

    return this._charCodeAtPosition(this.currentChar, this.nextChar);
  }

  private updatePositionState(): void {
    this.currentChar = this.source[this.currentPosition];
    this.nextChar = this.source[this.currentPosition + 1];

    this.currentCharCode = this._charCodeAtPosition(
      this.currentChar,
      this.nextChar
    );

    if (this.nextChar !== undefined) {
      this.nextCharCode = this._charCodeAtPosition(
        this.nextChar,
        this.source[this.currentPosition + 2]
      );
    }
  }

  private nextLine() {
    this.currentLine += 1;
    this.currentLineColumnCount = 0;
  }

  private updatePosition(count = 1) {
    this.currentPosition += count;
    this.currentLineColumnCount += count;

    if (this.currentPosition < this.source.length) {
      this.updatePositionState();
    } else {
      this.currentChar = null;
      this.nextChar = null;
      this.currentCharCode = null;
      this.nextCharCode = null;
      this.currentPosition = this.source.length;
    }
  }

  private _charCodeAtPosition(char: string, nextChar: string): number {
    const unicodeCode = char.charCodeAt(0);
    if (unicodeCode <= Tokenizer.BMP_MIN || unicodeCode >= Tokenizer.BMP_MAX) {
      return unicodeCode;
    }

    const unicodeNextCode = nextChar.charCodeAt(0);
    if (
      unicodeNextCode <= Tokenizer.SURROGATE_MIN &&
      unicodeNextCode >= Tokenizer.SURROGATE_MAX
    ) {
      return unicodeCode;
    }

    return (unicodeCode << 10) + unicodeNextCode - 0x35fdc00;
  }
}
