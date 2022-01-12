"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTextMate = void 0;
const langium = __importStar(require("langium"));
const langium_1 = require("langium");
const util_1 = require("./util");
function generateTextMate(grammar, config) {
    var _a;
    const json = {
        name: config.id,
        scopeName: `source.${config.id}`,
        fileTypes: (_a = config.fileExtensions) !== null && _a !== void 0 ? _a : [],
        patterns: getPatterns(grammar, config),
        repository: getRepository(grammar, config)
    };
    return JSON.stringify(json, null, 2);
}
exports.generateTextMate = generateTextMate;
function getPatterns(grammar, config) {
    const patterns = [];
    patterns.push({
        include: '#comments'
    });
    patterns.push(getControlKeywords(grammar, config));
    patterns.push(...getStringPatterns(grammar, config));
    return patterns;
}
function getRepository(grammar, config) {
    const commentPatterns = [];
    for (const rule of grammar.rules) {
        if ((0, langium_1.isTerminalRule)(rule) && (0, langium_1.isCommentTerminal)(rule)) {
            const parts = (0, langium_1.getTerminalParts)((0, langium_1.terminalRegex)(rule));
            for (const part of parts) {
                if (part.end) {
                    commentPatterns.push({
                        'name': `comment.block.${config.id}`,
                        'begin': part.start,
                        'beginCaptures': {
                            '0': {
                                'name': `punctuation.definition.comment.${config.id}`
                            }
                        },
                        'end': part.end,
                        'endCaptures': {
                            '0': {
                                'name': `punctuation.definition.comment.${config.id}`
                            }
                        }
                    });
                }
                else {
                    commentPatterns.push({
                        'begin': part.start,
                        'beginCaptures': {
                            '1': {
                                'name': `punctuation.whitespace.comment.leading.${config.id}`
                            }
                        },
                        'end': '(?=$)',
                        'name': `comment.line.${config.id}`
                    });
                }
            }
        }
    }
    const repository = {
        'comments': {
            'patterns': commentPatterns
        }
    };
    return repository;
}
function getControlKeywords(grammar, pack) {
    const regex = /[A-Za-z]/;
    const controlKeywords = (0, util_1.collectKeywords)(grammar).filter(kw => regex.test(kw));
    const groups = groupKeywords(controlKeywords, pack.caseInsensitive);
    return {
        'name': `keyword.control.${pack.id}`,
        'match': groups.join('|')
    };
}
function groupKeywords(keywords, caseInsensitive) {
    const groups = { letter: [], leftSpecial: [], rightSpecial: [], special: [] };
    keywords.forEach(keyword => {
        const keywordPattern = caseInsensitive ? (0, langium_1.getCaseInsensitivePattern)(keyword) : (0, langium_1.escapeRegExp)(keyword);
        if (/\w/.test(keyword[0])) {
            if (/\w/.test(keyword[keyword.length - 1])) {
                groups.letter.push(keywordPattern);
            }
            else {
                groups.rightSpecial.push(keywordPattern);
            }
        }
        else {
            if ((/\w/).test(keyword[keyword.length - 1])) {
                groups.leftSpecial.push(keywordPattern);
            }
            else {
                groups.special.push(keywordPattern);
            }
        }
    });
    const res = [];
    if (groups.letter.length)
        res.push(`\\b(${groups.letter.join('|')})\\b`);
    if (groups.leftSpecial.length)
        res.push(`\\B(${groups.leftSpecial.join('|')})\\b`);
    if (groups.rightSpecial.length)
        res.push(`\\b(${groups.rightSpecial.join('|')})\\B`);
    if (groups.special.length)
        res.push(`\\B(${groups.special.join('|')})\\B`);
    return res;
}
function getStringPatterns(grammar, pack) {
    const terminals = langium.stream(grammar.rules).filter(langium.isTerminalRule);
    const stringTerminal = terminals.find(e => e.name.toLowerCase() === 'string');
    const stringPatterns = [];
    if (stringTerminal) {
        const parts = (0, langium_1.getTerminalParts)((0, langium_1.terminalRegex)(stringTerminal));
        for (const part of parts) {
            if (part.end) {
                stringPatterns.push({
                    'name': `string.quoted.${delimiterName(part.start)}.${pack.id}`,
                    'begin': part.start,
                    'end': part.end
                });
            }
        }
    }
    return stringPatterns;
}
function delimiterName(delimiter) {
    if (delimiter === "'") {
        return 'single';
    }
    else if (delimiter === '"') {
        return 'double';
    }
    else if (delimiter === '`') {
        return 'backtick';
    }
    else {
        return 'delimiter';
    }
}
//# sourceMappingURL=textmate-generator.js.map