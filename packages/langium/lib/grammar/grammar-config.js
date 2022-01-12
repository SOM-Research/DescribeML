"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGrammarConfig = void 0;
const regex_util_1 = require("../utils/regex-util");
const ast_1 = require("./generated/ast");
const grammar_util_1 = require("./grammar-util");
function createGrammarConfig(services) {
    const rules = [];
    const grammar = services.Grammar;
    for (const rule of grammar.rules) {
        if ((0, ast_1.isTerminalRule)(rule) && (0, grammar_util_1.isCommentTerminal)(rule) && (0, regex_util_1.isMultilineComment)((0, grammar_util_1.terminalRegex)(rule))) {
            rules.push(rule.name);
        }
    }
    return { multilineCommentRules: rules };
}
exports.createGrammarConfig = createGrammarConfig;
//# sourceMappingURL=grammar-config.js.map