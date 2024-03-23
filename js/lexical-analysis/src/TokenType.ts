export interface TokenTypeAdditionalInfo {
  isKeyword?: boolean;
  isHexNumber?: boolean;
}

export default class TokenType {
  public static readonly Identifier = new TokenType("identifier");
  public static readonly String = new TokenType("string");
  public static readonly Number = new TokenType("number");
  public static readonly Operator = new TokenType("operator");
  public static readonly Punctuation = new TokenType("punctuation");
  public static readonly TemplateStart = new TokenType("templateStart");
  public static readonly TemplateEnd = new TokenType("templateEnd");
  public static readonly TemplateContent = new TokenType("templateContent");
  public static readonly TemplateExpressionStart = new TokenType(
    "templateExpressionStart"
  );
  public static readonly TemplateExpressionEnd = new TokenType(
    "templateExpressionEnd"
  );

  // utils
  public static readonly EOF = new TokenType("eof");

  // keywords
  public static readonly Break = new TokenType("break", {
    isKeyword: true,
  });
  public static readonly Case = new TokenType("case", {
    isKeyword: true,
  });
  public static readonly Catch = new TokenType("catch", {
    isKeyword: true,
  });
  public static readonly Class = new TokenType("class", {
    isKeyword: true,
  });
  public static readonly Const = new TokenType("const", {
    isKeyword: true,
  });
  public static readonly Var = new TokenType("var", {
    isKeyword: true,
  });
  public static readonly Let = new TokenType("let", {
    isKeyword: true,
  });
  public static readonly Continue = new TokenType("continue", {
    isKeyword: true,
  });
  public static readonly Debugger = new TokenType("debugger", {
    isKeyword: true,
  });
  public static readonly Default = new TokenType("default", {
    isKeyword: true,
  });
  public static readonly Delete = new TokenType("delete", {
    isKeyword: true,
  });
  public static readonly Do = new TokenType("do", {
    isKeyword: true,
  });
  public static readonly Else = new TokenType("else", {
    isKeyword: true,
  });
  public static readonly If = new TokenType("if", {
    isKeyword: true,
  });
  public static readonly In = new TokenType("in", {
    isKeyword: true,
  });
  public static readonly For = new TokenType("for", {
    isKeyword: true,
  });
  public static readonly Instanceof = new TokenType("instanceof", {
    isKeyword: true,
  });
  public static readonly New = new TokenType("new", {
    isKeyword: true,
  });
  public static readonly Return = new TokenType("return", {
    isKeyword: true,
  });
  public static readonly Switch = new TokenType("switch", {
    isKeyword: true,
  });
  public static readonly This = new TokenType("this", {
    isKeyword: true,
  });
  public static readonly Throw = new TokenType("throw", {
    isKeyword: true,
  });
  public static readonly Try = new TokenType("try", {
    isKeyword: true,
  });
  public static readonly Finally = new TokenType("finally", {
    isKeyword: true,
  });
  public static readonly Typeof = new TokenType("typeof", {
    isKeyword: true,
  });
  public static readonly Void = new TokenType("void", {
    isKeyword: true,
  });
  public static readonly While = new TokenType("while", {
    isKeyword: true,
  });
  public static readonly Yield = new TokenType("yield", {
    isKeyword: true,
  });
  public static readonly Function = new TokenType("function", {
    isKeyword: true,
  });
  public static readonly Import = new TokenType("import", {
    isKeyword: true,
  });
  public static readonly Export = new TokenType("export", {
    isKeyword: true,
  });
  public static readonly Super = new TokenType("super", {
    isKeyword: true,
  });
  public static readonly Extends = new TokenType("extends", {
    isKeyword: true,
  });
  public static readonly True = new TokenType("true", {
    isKeyword: true,
  });
  public static readonly False = new TokenType("false", {
    isKeyword: true,
  });
  public static readonly Null = new TokenType("null", {
    isKeyword: true,
  });
  public static readonly Undefined = new TokenType("undefined", {
    isKeyword: true,
  });
  public static readonly Async = new TokenType("async", {
    isKeyword: true,
  });
  public static readonly Await = new TokenType("await", {
    isKeyword: true,
  });
  public static readonly From = new TokenType("from", {
    isKeyword: true,
  });
  public static readonly Of = new TokenType("of", {
    isKeyword: true,
  });
  public static readonly Constructor = new TokenType("constructor", {
    isKeyword: true,
  });
  public static readonly Static = new TokenType("static", {
    isKeyword: true,
  });
  public static readonly Public = new TokenType("public", {
    isKeyword: true,
  });
  public static readonly As = new TokenType("as", {
    isKeyword: true,
  });
  private static readonly keywords: Record<string, TokenType> = {
    break: this.Break,
    case: this.Case,
    catch: this.Catch,
    class: this.Class,
    const: this.Const,
    var: this.Var,
    let: this.Let,
    continue: this.Continue,
    debugger: this.Debugger,
    default: this.Default,
    delete: this.Delete,
    do: this.Do,
    else: this.Else,
    if: this.If,
    in: this.In,
    for: this.For,
    instanceof: this.Instanceof,
    new: this.New,
    return: this.Return,
    switch: this.Switch,
    this: this.This,
    throw: this.Throw,
    try: this.Try,
    finally: this.Finally,
    typeof: this.Typeof,
    void: this.Void,
    while: this.While,
    yield: this.Yield,
    function: this.Function,
    import: this.Import,
    export: this.Export,
    super: this.Super,
    extends: this.Extends,
    true: this.True,
    false: this.False,
    null: this.Null,
    async: this.Async,
    await: this.Await,
    from: this.From,
    of: this.Of,
    constructor: this.Constructor,
    static: this.Static,
    public: this.Public,
    as: this.As,
  };

  public constructor(
    public readonly label: string,
    public readonly info?: TokenTypeAdditionalInfo
  ) {}

  public static decorateTokenWithInfo(
    token: TokenType,
    info: Partial<TokenTypeAdditionalInfo>
  ): TokenType {
    return new TokenType(token.label, { ...token.info, ...info });
  }

  public static getTokenTypeFromString(s: string): TokenType {
    let type = this.keywords[s];
    if (type) {
      return type;
    }

    return TokenType.Identifier;
  }
}
