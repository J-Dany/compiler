import TokenType from "./TokenType";

export type ValueType = string | number | boolean | null | undefined;

export default class Token {
  public constructor(
    public readonly type: TokenType,
    public readonly value: ValueType,
    public readonly start?: number,
    public readonly end?: number,
    public readonly line?: number,
    public readonly columnStart?: number,
    public readonly columnEnd?: number
  ) {}
}
