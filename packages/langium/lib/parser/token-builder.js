"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultTokenBuilder = void 0;
const chevrotain_1 = require("chevrotain");
const __1 = require("..");
const ast_1 = require("../grammar/generated/ast");
const ast_util_1 = require("../utils/ast-util");
const regex_util_1 = require("../utils/regex-util");
const stream_1 = require("../utils/stream");
class DefaultTokenBuilder {
    constructor() {
        // We need suffixes for terminals and keywords which have the same name
        this.KEYWORD_SUFFIX = '_KEYWORD';
        this.TERMINAL_SUFFIX = '_TERMINAL';
    }
    buildTokens(grammar, options) {
        const tokenMap = new Map();
        const terminalsTokens = [];
        const terminals = Array.from((0, stream_1.stream)(grammar.rules).filter(ast_1.isTerminalRule));
        for (const terminal of terminals) {
            const token = this.buildTerminalToken(terminal);
            terminalsTokens.push(token);
            tokenMap.set(terminal.name + this.TERMINAL_SUFFIX, token);
        }
        const tokens = [];
        const keywords = (0, ast_util_1.streamAllContents)(grammar).map(e => e.node).filter(ast_1.isKeyword).distinct(e => e.value).toArray()
            // Sort keywords by descending length
            .sort((a, b) => b.value.length - a.value.length);
        for (const keyword of keywords) {
            const keywordToken = this.buildKeywordToken(keyword, keywords, terminals, tokenMap, !!(options === null || options === void 0 ? void 0 : options.caseInsensitive));
            tokens.push(keywordToken);
            tokenMap.set(keyword.value + this.KEYWORD_SUFFIX, keywordToken);
        }
        for (const terminalToken of terminalsTokens) {
            const pattern = terminalToken.PATTERN;
            if (typeof pattern === 'object' && pattern && 'test' in pattern && pattern.test(' ')) {
                tokens.unshift(terminalToken);
            }
            else {
                tokens.push(terminalToken);
            }
        }
        return tokens;
    }
    buildTerminalToken(terminal) {
        let group;
        const regex = (0, __1.terminalRegex)(terminal);
        if (terminal.hidden) {
            if (new RegExp(regex).test(' ')) { // Only skip tokens that are able to accept whitespace
                group = chevrotain_1.Lexer.SKIPPED;
            }
            else {
                group = 'hidden';
            }
        }
        const token = { name: terminal.name, GROUP: group, PATTERN: new RegExp(regex) };
        if (!group) {
            // 'undefined' is not a valid value for `GROUP`
            // Therefore, we have to delete it
            delete token.GROUP;
        }
        return token;
    }
    buildKeywordToken(keyword, keywords, terminals, tokenMap, caseInsensitive) {
        const longerAlt = this.findLongerAlt(keyword, keywords, terminals, tokenMap);
        return { name: keyword.value, PATTERN: this.buildKeywordPattern(keyword, caseInsensitive), LONGER_ALT: longerAlt };
    }
    buildKeywordPattern(keyword, caseInsensitive) {
        return caseInsensitive ?
            new RegExp((0, regex_util_1.getCaseInsensitivePattern)(keyword.value)) :
            keyword.value;
    }
    findLongerAlt(keyword, keywords, terminals, tokenMap) {
        const longerAlts = [];
        for (const otherKeyword of keywords) {
            const tokenType = tokenMap.get(otherKeyword.value + this.KEYWORD_SUFFIX);
            if (tokenType && otherKeyword.value.length > keyword.value.length && otherKeyword.value.startsWith(keyword.value)) {
                longerAlts.push(tokenType);
            }
        }
        for (const terminal of terminals) {
            const tokenType = tokenMap.get(terminal.name + this.TERMINAL_SUFFIX);
            if (tokenType && (0, regex_util_1.partialMatches)('^' + (0, __1.terminalRegex)(terminal) + '$', keyword.value)) {
                longerAlts.push(tokenType);
            }
        }
        return longerAlts;
    }
}
exports.DefaultTokenBuilder = DefaultTokenBuilder;
//# sourceMappingURL=token-builder.js.map