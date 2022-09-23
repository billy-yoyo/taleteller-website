import { RollMethod, RollMethods, Value, ValueType } from "./rollast";

interface TokenTypeMap {
    roll: {
        amount: number;
        variable?: string;
        sides: number;
        dropLowest: number;
        dropHighest: number;
        method: RollMethod;
    },
    keyword: string
    number: number
    add: {},
    minus: {},
    multiply: {},
    divide: {},
    bracketOpen: {},
    bracketClose: {},
    curlyOpen: {},
    curlyClose: {},
    comma: {},
    null: {}
}
type TokenType = keyof TokenTypeMap;
type TokenData<T extends TokenType> = TokenTypeMap[T]

interface Token<T extends TokenType> {
    type: T;
    length: number;
    data: TokenData<T>
};

// avg:3d20-w2-b2

type Tokenizer = (s: string) => Token<TokenType>;

const nullToken = (): Token<'null'> => {
    return { type: 'null', length: 0, data: {} };
}

// [1,20]1d20

const diceRegex = /^(\[([0-9]+)\s*,\s*([0-9]+)\])?(([a-zA-Z]+):)?([0-9]+)([a-zA-Z]*)d([0-9]+)(-w([0-9]+))?(-b([0-9]+))?/;
const wordRegex = /^[a-zA-Z]+/g;
const numberRegex = /^([0-9]+\.)?[0-9]+/g;
const whitespaceRegex = /^\s+/g

const tokenizers: Tokenizer[] = [
    (s: string) => {
        const groups = s.match(diceRegex);
        if (groups) {
            const method: RollMethod = (groups[5] ?? "sum") as RollMethod;
            if (RollMethods.includes(method)) {
                const sides = parseInt(groups[8]);
                const variable = groups[7];
                return {
                    type: 'roll',
                    length: groups[0].length,
                    data: {
                        amount: parseInt(groups[6]),
                        variable: variable ? variable : undefined,
                        sides: sides,
                        critRange: groups[1] ? [parseInt(groups[2]), parseInt(groups[3])] : [1, sides],
                        dropLowest: groups[10] ? parseInt(groups[10]) : 0, 
                        dropHighest: groups[12] ? parseInt(groups[12]) : 0,
                        method,
                    }
                };
            } else {
                return nullToken();
            }
        } else {
            return nullToken();
        }
    },
    (s) => {
        const groups = s.match(wordRegex);
        if (groups) {
            return {
                type: 'keyword',
                length: groups[0].length,
                data: groups[0]
            };
        } else {
            return nullToken();
        }
    },
    (s) => {
        const groups = s.match(numberRegex);
        if (groups) {
            return {
                type: 'number',
                length: groups[0].length,
                data: parseFloat(groups[0])
            };
        } else {
            return nullToken();
        }
    },
    (s) => {
        if (s.startsWith("+")) {
            return { type: 'add', length: 1, data: {} }
        } else {
            return nullToken();
        }
    },
    (s) => {
        if (s.startsWith("-")) {
            return { type: 'minus', length: 1, data: {} }
        } else {
            return nullToken();
        }
    },
    (s) => {
        if (s.startsWith("*")) {
            return { type: 'multiply', length: 1, data: {} }
        } else {
            return nullToken();
        }
    },
    (s) => {
        if (s.startsWith("/")) {
            return { type: 'divide', length: 1, data: {} }
        } else {
            return nullToken();
        }
    },
    (s) => {
        if (s.startsWith("(")) {
            return { type: 'bracketOpen', length: 1, data: {} }
        } else {
            return nullToken();
        }
    },
    (s) => {
        if (s.startsWith(")")) {
            return { type: 'bracketClose', length: 1, data: {} }
        } else {
            return nullToken();
        }
    },
    (s) => {
        const groups = s.match(whitespaceRegex);
        if (groups) {
            return { type: 'null', length: groups[0].length, data: {} }
        } else {
            return nullToken();
        }
    },
    (s) => {
        if (s.startsWith("{")) {
            return { type: 'curlyOpen', length: 1, data: {} }
        } else {
            return nullToken();
        }
    },
    (s) => {
        if (s.startsWith("}")) {
            return { type: 'curlyClose', length: 1, data: {} }
        } else {
            return nullToken();
        }
    },
    (s) => {
        if (s.startsWith(",")) {
            return { type: 'comma', length: 1, data: {} }
        } else {
            return nullToken();
        }
    }
];

const nextToken = (s: string): [Token<TokenType>, string] => {
    let best: Token<TokenType> = undefined;
    tokenizers.forEach(tokenizer => {
        const token = tokenizer(s);
        if (token.length > 0 && (best === undefined || token.length > best.length)) {
            best = token;
        }
    });
    return [best, best === undefined ? s : s.slice(best.length)];
}

const tokenize = (s: string): Token<TokenType>[] => {
    const tokens: Token<TokenType>[] = [];
    
    let remaining = s;
    let token: Token<TokenType>;

    [token, remaining] = nextToken(remaining);
    while (token !== undefined && remaining.length > 0) {
        tokens.push(token);
        [token, remaining] = nextToken(remaining);
    }
    if (token !== undefined) {
        tokens.push(token);
    }

    if (remaining.length > 0) {
        throw new Error(`Failed to parse roll string at character ${s.length - remaining.length}: ${s}`);
    }
    
    return tokens.filter(t => t.type !== 'null');
}

const nextValue = (queue: Token<TokenType>[]): Value<ValueType> => {
    const token = queue.shift();
    if (token.type === 'roll') {
        return {
            type: 'roll',
            data: token.data
        };
    } else if (token.type === 'number') {
        return {
            type: 'flatMod',
            data: {
                amount: token.data
            }
        };
    } else if (token.type === 'keyword') {
        // check if this is the start of a function call
        if (queue.length > 0 && queue[0].type === 'curlyOpen') {
            queue.shift();

            let subvalues = [];

            let level = 1;
            let index = 0;
            for (let i = 0; i < queue.length; i++) {
                if (queue[i].type === 'curlyOpen') {
                    level++;
                } else if (queue[i].type === 'curlyClose') {
                    level--;
    
                    if (level === 0) {
                        subvalues.push(tokensToAst(queue.slice(index, i)));
                        index = i;
                        break;
                    }
                } else if (queue[i].type === 'comma' && level === 1) {
                    subvalues.push(tokensToAst(queue.slice(index, i)));
                    index = i + 1;
                }
            }
    
            if (level === 0) {
                queue.splice(0, index + 1);
                return {
                    type: 'func',
                    data: {
                        method: token.data,
                        values: subvalues
                    }
                };
            } else {
                throw Error('Unterminated curly bracket');
            }
        } else {
            const kwd = (token.data as string).toLowerCase();
            if (kwd === 'a' || kwd === 'agi' || kwd === 'agility') {
                return {
                    type: 'abilityMod',
                    data: {
                        ability: 'agility'
                    }
                };
            } else if (kwd === 'm' || kwd === 'mig' || kwd === 'mgt' || kwd === 'mit' || kwd === 'might') {
                return {
                    type: 'abilityMod',
                    data: {
                        ability: 'might'
                    }
                };
            } else if (kwd === 'c' || kwd === 'cha' || kwd === 'char' || kwd === 'charisma') {
                return {
                    type: 'abilityMod',
                    data: {
                        ability: 'charisma'
                    }
                };
            } else if (kwd === 'i' || kwd === 'int' || kwd === 'intelligence') {
                return {
                    type: 'abilityMod',
                    data: {
                        ability: 'intelligence'
                    }
                };
            } else if (kwd === 'h' || kwd === 'hit' || kwd === 'hitmod' || kwd === 'mod') {
                return {
                    type: 'hitMod',
                    data: {}
                };
            } else if (kwd === 'p' || kwd === 'prof' || kwd === 'proficiency') {
                return {
                    type: 'proficiencyMod',
                    data: {}
                };
            } else {
                return {
                    type: 'variableMod',
                    data: {
                        variable: kwd
                    }
                }
            }
        }
    } else if (token.type === 'bracketOpen') {
        let level = 1;
        let index = 0;
        for (let i = 0; i < queue.length; i++) {
            if (queue[i].type === 'bracketOpen') {
                level++;
            } else if (queue[i].type === 'bracketClose') {
                level--;

                if (level === 0) {
                    index = i;
                    break;
                }
            }
        }

        if (level === 0) {
            const tokens = queue.splice(0, index + 1);
            return tokensToAst(tokens);
        } else {
            throw Error('Unterminated bracket');
        }
    } else if (token.type === 'bracketClose') {
        throw Error('Unexpected bracket close');
    } else if (token.type === 'minus') {
        return {
            type: 'negate',
            data: {
                value: nextValue(queue)
            }
        };
    } else {
        throw Error(`Unexpected token type ${token.type}`)
    }
}

const splitByOp = (values: Value<ValueType>[], ops: TokenType[], splitOp: TokenType): [values: Value<ValueType>[], ops: TokenType[]][] => {
    let splits = [];
    let subvalues = [];
    let subops = [];

    for (let i = 0; i < ops.length; i++) {
        subvalues.push(values[i]);
        if (ops[i] === splitOp) {
            splits.push([subvalues, subops]);
            subvalues = [];
            subops = [];
        } else {
            subvalues.push(values[i]);
            subops.push(ops[i]);
        }
    }

    subvalues.push(values[values.length - 1]);
    splits.push([subvalues, subops]);
    return splits;
};

const parseValuesAndOps = (values: Value<ValueType>[], ops: TokenType[], opstack: TokenType[]): Value<ValueType> => {
    if (opstack.length === 0) {
        if (values.length === 1) {
            return values[0]
        } else {
            throw new Error('Reached end of opstack with too many values');
        }
    }

    const splitOp = opstack.shift();
    if (ops.includes(splitOp)) {
        const splits = splitByOp(values, ops, splitOp);

        const subvalues = splits.map(([subvalues, subops]) => parseValuesAndOps(subvalues, subops, opstack.slice()));
        
        if (splitOp === 'add') {
            return {
                type: 'sum',
                data: {
                    values: subvalues
                }
            };
        } else if (splitOp === 'minus') {
            return {
                type: 'sum',
                data: {
                    values: subvalues.map(sv => ({
                        type: 'negate',
                        data: {
                            value: sv
                        }
                    }))
                }
            };
        } else if (splitOp === 'multiply') {
            subvalues.slice(1).reduce((prev, cur) => ({
                type: 'multiply',
                data: {
                    value: prev,
                    multiplier: cur
                }
            }), subvalues[0]);
        } else if (splitOp === 'divide') {
            subvalues.slice(1).reduce((prev, cur) => ({
                type: 'divide',
                data: {
                    value: prev,
                    divisor: cur
                }
            }), subvalues[0]);
        } else {
            throw new Error(`Invalid operator ${splitOp}, don't know how to parse it.`);
        }
    } else {
        return parseValuesAndOps(values, ops, opstack.slice());
    }
}

const tokensToAst = (tokens: Token<TokenType>[]): Value<ValueType> => {
    let values = [];
    let ops = [];

    const queue = [...tokens];
    values.push(nextValue(queue));
    while (queue.length > 0) {
        const op = queue.shift();
        if (['add', 'multiply', 'minus', 'divide'].includes(op.type)) {
            ops.push(op.type);
        } else {
            throw Error(`Unexpected token type ${op.type}`);
        }

        values.push(nextValue(queue));
    }

    return parseValuesAndOps(values, ops, ['add', 'minus', 'multiply', 'divide']);
};

export const parse = (roll: string): Value<ValueType> => {
    const tokens = tokenize(roll);
    return tokensToAst(tokens);
};
