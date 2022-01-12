"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.partialRegex = exports.partialMatches = exports.getCaseInsensitivePattern = exports.escapeRegExp = exports.isMultilineComment = exports.getTerminalParts = void 0;
const regexp_to_ast_1 = require("regexp-to-ast");
const regexParser = new regexp_to_ast_1.RegExpParser();
class CommentRegexVisitor extends regexp_to_ast_1.BaseRegExpVisitor {
    constructor() {
        super(...arguments);
        this.isStarting = true;
        this.endRegexStack = [];
        this.multiline = false;
    }
    get endRegex() {
        return this.endRegexStack.join('');
    }
    reset(regex) {
        this.multiline = false;
        this.regex = regex;
        this.startRegex = '';
        this.isStarting = true;
        this.endRegexStack = [];
    }
    visitGroup(node) {
        if (node.quantifier) {
            this.isStarting = false;
            this.endRegexStack = [];
        }
    }
    visitCharacter(node) {
        const char = String.fromCharCode(node.value);
        if (!this.multiline && char === '\n') {
            this.multiline = true;
        }
        if (node.quantifier) {
            this.isStarting = false;
            this.endRegexStack = [];
        }
        else {
            const escapedChar = escapeRegExp(char);
            this.endRegexStack.push(escapedChar);
            if (this.isStarting) {
                this.startRegex += escapedChar;
            }
        }
    }
    visitSet(node) {
        if (!this.multiline) {
            const set = this.regex.substring(node.loc.begin, node.loc.end);
            const regex = new RegExp(set);
            this.multiline = !!'\n'.match(regex);
        }
        if (node.quantifier) {
            this.isStarting = false;
            this.endRegexStack = [];
        }
        else {
            const set = this.regex.substring(node.loc.begin, node.loc.end);
            this.endRegexStack.push(set);
            if (this.isStarting) {
                this.startRegex += set;
            }
        }
    }
}
const visitor = new CommentRegexVisitor();
function getTerminalParts(regex) {
    try {
        if (typeof regex !== 'string') {
            regex = regex.source;
        }
        regex = `/${regex}/`;
        const pattern = regexParser.pattern(regex);
        const parts = [];
        for (const alternative of pattern.value.value) {
            visitor.reset(regex);
            visitor.visit(alternative);
            parts.push({
                start: visitor.startRegex,
                end: visitor.endRegex
            });
        }
        return parts;
    }
    catch (_a) {
        return [];
    }
}
exports.getTerminalParts = getTerminalParts;
function isMultilineComment(regex) {
    try {
        if (typeof regex !== 'string') {
            regex = regex.source;
        }
        regex = `/${regex}/`;
        visitor.reset(regex);
        // Parsing the pattern might fail (since it's user code)
        visitor.visit(regexParser.pattern(regex));
        return visitor.multiline;
    }
    catch (_a) {
        return false;
    }
}
exports.isMultilineComment = isMultilineComment;
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
exports.escapeRegExp = escapeRegExp;
function getCaseInsensitivePattern(keyword) {
    return Array.prototype.map.call(keyword, letter => /\w/.test(letter) ? `[${letter.toLowerCase()}${letter.toUpperCase()}]` : escapeRegExp(letter)).join('');
}
exports.getCaseInsensitivePattern = getCaseInsensitivePattern;
/**
 * Determines whether the given input has a partial match with the specified regex.
 * @param regex The regex to partially match against
 * @param input The input string
 * @returns Whether any match exists.
 */
function partialMatches(regex, input) {
    const partial = partialRegex(regex);
    const match = input.match(partial);
    return !!match && match[0].length > 0;
}
exports.partialMatches = partialMatches;
/**
 * Builds a partial regex from the input regex. A partial regex is able to match incomplete input strings. E.g.
 * a partial regex constructed from `/ab/` is able to match the string `a` without needing a following `b` character. However it won't match `b` alone.
 * @param regex The input regex to be converted.
 * @returns A partial regex constructed from the input regex.
 */
function partialRegex(regex) {
    if (typeof regex === 'string') {
        regex = new RegExp(regex);
    }
    const re = regex, source = regex.source;
    let i = 0;
    function process() {
        let result = '', tmp;
        function appendRaw(nbChars) {
            result += source.substr(i, nbChars);
            i += nbChars;
        }
        function appendOptional(nbChars) {
            result += '(?:' + source.substr(i, nbChars) + '|$)';
            i += nbChars;
        }
        while (i < source.length) {
            switch (source[i]) {
                case '\\':
                    switch (source[i + 1]) {
                        case 'c':
                            appendOptional(3);
                            break;
                        case 'x':
                            appendOptional(4);
                            break;
                        case 'u':
                            if (re.unicode) {
                                if (source[i + 2] === '{') {
                                    appendOptional(source.indexOf('}', i) - i + 1);
                                }
                                else {
                                    appendOptional(6);
                                }
                            }
                            else {
                                appendOptional(2);
                            }
                            break;
                        case 'p':
                        case 'P':
                            if (re.unicode) {
                                appendOptional(source.indexOf('}', i) - i + 1);
                            }
                            else {
                                appendOptional(2);
                            }
                            break;
                        case 'k':
                            appendOptional(source.indexOf('>', i) - i + 1);
                            break;
                        default:
                            appendOptional(2);
                            break;
                    }
                    break;
                case '[':
                    tmp = /\[(?:\\.|.)*?\]/g;
                    tmp.lastIndex = i;
                    tmp = tmp.exec(source) || [];
                    appendOptional(tmp[0].length);
                    break;
                case '|':
                case '^':
                case '$':
                case '*':
                case '+':
                case '?':
                    appendRaw(1);
                    break;
                case '{':
                    tmp = /\{\d+,?\d*\}/g;
                    tmp.lastIndex = i;
                    tmp = tmp.exec(source);
                    if (tmp) {
                        appendRaw(tmp[0].length);
                    }
                    else {
                        appendOptional(1);
                    }
                    break;
                case '(':
                    if (source[i + 1] === '?') {
                        switch (source[i + 2]) {
                            case ':':
                                result += '(?:';
                                i += 3;
                                result += process() + '|$)';
                                break;
                            case '=':
                                result += '(?=';
                                i += 3;
                                result += process() + ')';
                                break;
                            case '!':
                                tmp = i;
                                i += 3;
                                process();
                                result += source.substr(tmp, i - tmp);
                                break;
                            case '<':
                                switch (source[i + 3]) {
                                    case '=':
                                    case '!':
                                        tmp = i;
                                        i += 4;
                                        process();
                                        result += source.substr(tmp, i - tmp);
                                        break;
                                    default:
                                        appendRaw(source.indexOf('>', i) - i + 1);
                                        result += process() + '|$)';
                                        break;
                                }
                                break;
                        }
                    }
                    else {
                        appendRaw(1);
                        result += process() + '|$)';
                    }
                    break;
                case ')':
                    ++i;
                    return result;
                default:
                    appendOptional(1);
                    break;
            }
        }
        return result;
    }
    return new RegExp(process(), regex.flags);
}
exports.partialRegex = partialRegex;
//# sourceMappingURL=regex-util.js.map