const fs = require('fs');

class BNFParser {
    constructor(grammarJson) {
        this.rawGrammar = grammarJson;
        this.parsedGrammar = {};
        this.compileGrammar();
    }

    // --- Grammar Compilation Phase ---

    compileGrammar() {
        for (const [key, value] of Object.entries(this.rawGrammar)) {
            this.parsedGrammar[key] = this.parseRuleDefinition(value);
        }
    }

    parseRuleDefinition(defString) {
        // Tokenize the definition string
        // Tokens: <ident>, "literal", 'literal', |
        const tokens = [];
        const regex = /\s*(?:(<[^>]+>)|("[^"]*")|('[^']*')|(\|))/g;
        let match;

        while ((match = regex.exec(defString)) !== null) {
            if (match[1]) { // <ident>
                tokens.push({ type: 'NON_TERMINAL', value: match[1].slice(1, -1) });
            } else if (match[2]) { // "literal"
                tokens.push({ type: 'LITERAL', value: match[2].slice(1, -1) });
            } else if (match[3]) { // 'literal'
                tokens.push({ type: 'LITERAL', value: match[3].slice(1, -1) });
            } else if (match[4]) { // |
                tokens.push({ type: 'OR', value: '|' });
            }
        }

        // Parse tokens into structure (Choice of Sequences)
        const choices = [];
        let currentSequence = [];

        for (const token of tokens) {
            if (token.type === 'OR') {
                if (currentSequence.length > 0) {
                    choices.push(currentSequence);
                    currentSequence = [];
                }
            } else {
                currentSequence.push(token);
            }
        }
        if (currentSequence.length > 0) {
            choices.push(currentSequence);
        }

        return choices; // Array of Arrays (Array of Alternatives, each Alternative is a Sequence)
    }

    // --- Parsing Phase ---

    // Skip whitespace characters (space, tab, newline, carriage return, etc.)
    skipWhitespace(cursor) {
        while (cursor < this.input.length && /\s/.test(this.input[cursor])) {
            cursor++;
        }
        return cursor;
    }

    parse(entryRule, inputCode) {
        this.input = inputCode;
        this.maxParsedCursor = 0;
        const result = this.parseRule(entryRule, 0);

        if (result.success && result.cursor === inputCode.length) {
            return result.node;
        } else {
            if (result.success) {
                // console.log(result)
                throw new Error(this.formatError("Parsing incomplete. Expected EOF", result.cursor));
            } else {
                throw new Error(this.formatError("Syntax Error", this.maxParsedCursor));
            }
        }
    }

    formatError(msg, cursor) {
        let line = 1;
        let col = 1;
        let lineStart = 0;

        for (let i = 0; i < cursor && i < this.input.length; i++) {
            if (this.input[i] === '\n') {
                line++;
                col = 1;
                lineStart = i + 1;
            } else {
                col++;
            }
        }

        let lineEnd = this.input.indexOf('\n', lineStart);
        if (lineEnd === -1) lineEnd = this.input.length;

        const lineText = this.input.slice(lineStart, lineEnd);
        const prefix = this.input.slice(lineStart, cursor);

        let pointer = '';
        for (const char of prefix) {
            pointer += (char === '\t' ? '\t' : ' ');
        }
        pointer += '^';

        return `${msg} at line ${line}, column ${col}:\n${lineText}\n${pointer}`;
    }

    parseRule(ruleName, cursor) {
        // Handle built-in terminal <unicode_char>
        if (ruleName === 'unicode_char' || ruleName === 'unicode_char*') {
            return this.parseUnicodeChar(ruleName, cursor);
        }

        const rules = this.parsedGrammar[ruleName];
        if (!rules) {
            throw new Error(`Rule <${ruleName}> not found in grammar.`);
        }

        // Try each choice (OR)
        for (const sequence of rules) {
            const seqResult = this.parseSequence(sequence, cursor, ruleName);
            if (seqResult.success) {
                // post process: flatten
                var can_flatten = true;
                for (const child of seqResult.nodes) {
                    if (!child.type.endsWith('*')) {
                        can_flatten = false;
                        break;
                    }
                }
                if (can_flatten) {
                    const flattenedNodes = [];
                    for (const child of seqResult.nodes) {
                        if (child.type.endsWith('*')) {
                            if (child.children) {
                                flattenedNodes.push(...child.children);
                            }
                        } else {
                            flattenedNodes.push(child);
                        }
                    }
                    seqResult.nodes = flattenedNodes;
                }

                // Return a node for this rule
                return {
                    success: true,
                    cursor: seqResult.cursor,
                    node: {
                        type: ruleName,
                        children: seqResult.nodes
                    }
                };
            }
        }

        return { success: false, cursor: cursor };
    }

    // Parse built-in <unicode_char> terminal
    parseUnicodeChar(ruleName, cursor) {
        // Skip leading whitespace
        // cursor = this.skipWhitespace(cursor);
        if (cursor > this.maxParsedCursor) this.maxParsedCursor = cursor;

        if (cursor >= this.input.length) {
            return { success: false, cursor: cursor };
        }

        // Check if current character is NOT whitespace
        if (!/\s/.test(this.input[cursor])) {
            const char = this.input[cursor];

            // Successfully matched a char
            const nextCursor = cursor + 1;
            if (nextCursor > this.maxParsedCursor) this.maxParsedCursor = nextCursor;

            return {
                success: true,
                cursor: nextCursor,
                node: {
                    type: ruleName,
                    children: [{ type: 'TERMINAL', value: char }]
                }
            };
        }

        return { success: false, cursor: cursor };
    }

    parseSequence(sequence, cursor, parentRuleName) {
        let currentCursor = cursor;
        const nodes = [];
        const skipWS = parentRuleName && parentRuleName.includes('!') ? false : true;

        for (const item of sequence) {
            // Skip whitespace before each item only if allowed
            if (skipWS) {
                currentCursor = this.skipWhitespace(currentCursor);
            }

            if (currentCursor > this.maxParsedCursor) this.maxParsedCursor = currentCursor;

            if (item.type === 'LITERAL') {
                if (this.input.startsWith(item.value, currentCursor)) {
                    nodes.push({ type: 'TERMINAL', value: item.value });
                    currentCursor += item.value.length;
                    if (currentCursor > this.maxParsedCursor) this.maxParsedCursor = currentCursor;
                } else {
                    return { success: false, cursor: cursor };
                }
            } else if (item.type === 'NON_TERMINAL') {
                const result = this.parseRule(item.value, currentCursor);
                if (result.success) {
                    nodes.push(result.node);
                    currentCursor = result.cursor;
                } else {
                    return { success: false, cursor: cursor };
                }
            }
        }

        return { success: true, cursor: currentCursor, nodes: nodes };
    }
}

// Simple CLI usage if run directly
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log("Usage: node parser.js <grammar.json> <entry_rule> <input_file_or_string>");
        process.exit(1);
    }

    const grammarPath = args[0];
    const entryRule = args[1];
    let inputCode = args[2];

    try {
        if (fs.existsSync(inputCode)) {
            inputCode = fs.readFileSync(inputCode, 'utf-8');
        }
    } catch (e) {
        // assume string
    }

    const grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf-8'));
    const parser = new BNFParser(grammar);

    try {
        const ast = parser.parse(entryRule, inputCode);
        console.log(JSON.stringify(ast, null, 2));
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
}

module.exports = BNFParser;
