const example = `
(print "hi world!")

(print (+ 1 2))
`;

type Token = {
  type: "LParen" | "RParen" | "StringLiteral" | "Identifier" | "NumberLiteral";
  row: number;
  column: number;
  value: string | number;
};

type Tokenizer = {
  row: number;
  column: number;
  tokens: Token[];
};

function tokenize(code: string): Token[] {
  return tokenizeLines(code.split("\n")).tokens;
}

function tokenizeParen(lines: string[], tokenizer: Tokenizer): Tokenizer {
  const char = lines[tokenizer.row][tokenizer.column];
  const newTokenizer: Tokenizer = {
    ...tokenizer,
    column: tokenizer.column + 1,
    tokens: [
      ...tokenizer.tokens,
      {
        type: char == "(" ? "LParen" : "RParen",
        value: char,
        row: tokenizer.row,
        column: tokenizer.column,
      },
    ],
  };
  return tokenizeLines(lines, newTokenizer);
}

function longestIdentifier(chars: string): string {
  let curString = "";
  for (const char of chars) {
    if (["(", ")", " ", "\t"].includes(char)) break;
    curString += char;
  }
  return curString;
}

function tokenizeIdentifier(lines: string[], tokenizer: Tokenizer): Tokenizer {
  const remainingChars = lines[tokenizer.row].slice(tokenizer.column);
  const identifier = longestIdentifier(remainingChars);
  const newTokenizer: Tokenizer = {
    ...tokenizer,
    column: tokenizer.column + identifier.length,
    tokens: [
      ...tokenizer.tokens,
      {
        type: "Identifier",
        value: identifier,
        row: tokenizer.row,
        column: tokenizer.column,
      },
    ],
  };
  return tokenizeLines(lines, newTokenizer);
}

function tokenizeNumberLiteral(
  lines: string[],
  tokenizer: Tokenizer
): Tokenizer {
  const remainingChars = lines[tokenizer.row].slice(tokenizer.column);
  // TODO: add error handling for invalid number literals
  const numberString = longestIdentifier(remainingChars);
  const numberVal = Number(numberString);
  const newTokenizer: Tokenizer = {
    ...tokenizer,
    column: tokenizer.column + numberString.length,
    tokens: [
      ...tokenizer.tokens,
      {
        type: "NumberLiteral",
        value: numberVal,
        row: tokenizer.row,
        column: tokenizer.column,
      },
    ],
  };
  return tokenizeLines(lines, newTokenizer);
}

function tokenizeStringLiteral(
  lines: string[],
  tokenizer: Tokenizer
): Tokenizer {
  const remainingChars = lines[tokenizer.row].slice(tokenizer.column);
  // TODO: add error handling for unclosed string literals
  const stringLiteral = remainingChars.match(/^"([^"]*)"/)![1];
  const newTokenizer: Tokenizer = {
    ...tokenizer,
    column: tokenizer.column + stringLiteral.length + 2,
    tokens: [
      ...tokenizer.tokens,
      {
        type: "StringLiteral",
        value: stringLiteral,
        row: tokenizer.row,
        column: tokenizer.column,
      },
    ],
  };
  return tokenizeLines(lines, newTokenizer);
}

function tokenizeLines(
  lines: string[],
  tokenizer: Tokenizer = { row: 0, column: 0, tokens: [] }
): Tokenizer {
  if (tokenizer.row === lines.length) return tokenizer;
  if (tokenizer.column === lines[tokenizer.row].length) {
    return tokenizeLines(lines, {
      ...tokenizer,
      row: tokenizer.row + 1,
      column: 0,
    });
  }
  const nextChar = lines[tokenizer.row][tokenizer.column];
  if (nextChar == " " || nextChar == "\t") {
    return tokenizeLines(lines, {
      ...tokenizer,
      column: tokenizer.column + 1,
    });
  }
  if (nextChar == "(" || nextChar == ")") {
    return tokenizeParen(lines, tokenizer);
  }
  if (nextChar == '"') {
    return tokenizeStringLiteral(lines, tokenizer);
  }
  if (nextChar.match(/[0-9]/) || nextChar == ".") {
    return tokenizeNumberLiteral(lines, tokenizer);
  }
  return tokenizeIdentifier(lines, tokenizer);
}

console.log(tokenize(example));
