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
exports.LangiumGrammarCodeActionProvider = void 0;
const os_1 = require("os");
const vscode_languageserver_1 = require("vscode-languageserver");
const ast_util_1 = require("../utils/ast-util");
const regex_util_1 = require("../utils/regex-util");
const ast = __importStar(require("./generated/ast"));
const grammar_util_1 = require("./grammar-util");
const langium_grammar_validator_1 = require("./langium-grammar-validator");
class LangiumGrammarCodeActionProvider {
    getCodeActions(document, params) {
        const result = [];
        for (const diagnostic of params.context.diagnostics) {
            const codeAction = this.createCodeAction(diagnostic, document);
            if (codeAction) {
                result.push(codeAction);
            }
        }
        return result;
    }
    createCodeAction(diagnostic, document) {
        switch (diagnostic.code) {
            case langium_grammar_validator_1.IssueCodes.GrammarNameUppercase:
            case langium_grammar_validator_1.IssueCodes.RuleNameUppercase:
                return this.makeUpperCase(diagnostic, document);
            case langium_grammar_validator_1.IssueCodes.HiddenGrammarTokens:
                return this.fixHiddenTerminals(diagnostic, document);
            case langium_grammar_validator_1.IssueCodes.UseRegexTokens:
                return this.fixRegexTokens(diagnostic, document);
            case langium_grammar_validator_1.IssueCodes.EntryRuleTokenSyntax:
                return this.addEntryKeyword(diagnostic, document);
            case langium_grammar_validator_1.IssueCodes.CrossRefTokenSyntax:
                return this.fixCrossRefSyntax(diagnostic, document);
            case langium_grammar_validator_1.IssueCodes.MissingImport:
                return this.fixMissingImport(diagnostic, document);
            case langium_grammar_validator_1.IssueCodes.UnnecessaryFileExtension:
                return this.fixUnnecessaryFileExtension(diagnostic, document);
            default:
                return undefined;
        }
    }
    fixUnnecessaryFileExtension(diagnostic, document) {
        const end = Object.assign({}, diagnostic.range.end);
        end.character -= 1;
        const start = Object.assign({}, end);
        start.character -= '.langium'.length;
        return {
            title: 'Remove file extension',
            kind: vscode_languageserver_1.CodeActionKind.QuickFix,
            diagnostics: [diagnostic],
            isPreferred: true,
            edit: {
                changes: {
                    [document.textDocument.uri]: [{
                            range: {
                                start,
                                end
                            },
                            newText: ''
                        }]
                }
            }
        };
    }
    fixMissingImport(diagnostic, document) {
        let position;
        const grammar = document.parseResult.value;
        const imports = grammar.imports;
        const rules = grammar.rules;
        if (imports.length > 0) { // Find first import
            position = imports[0].$cstNode.range.start;
        }
        else if (rules.length > 0) { // Find first rule
            position = rules[0].$cstNode.range.start;
        }
        else {
            return undefined;
        }
        const path = diagnostic.data;
        if (typeof path === 'string') {
            return {
                title: `Add import to '${path}'`,
                kind: vscode_languageserver_1.CodeActionKind.QuickFix,
                diagnostics: [diagnostic],
                isPreferred: true,
                edit: {
                    changes: {
                        [document.textDocument.uri]: [{
                                range: {
                                    start: position,
                                    end: position
                                },
                                newText: `import '${path}';${os_1.EOL}`
                            }]
                    }
                }
            };
        }
        return undefined;
    }
    makeUpperCase(diagnostic, document) {
        const range = {
            start: diagnostic.range.start,
            end: {
                line: diagnostic.range.start.line,
                character: diagnostic.range.start.character + 1
            }
        };
        return {
            title: 'First letter to upper case',
            kind: vscode_languageserver_1.CodeActionKind.QuickFix,
            diagnostics: [diagnostic],
            isPreferred: true,
            edit: {
                changes: {
                    [document.textDocument.uri]: [{
                            range,
                            newText: document.textDocument.getText(range).toUpperCase()
                        }]
                }
            }
        };
    }
    addEntryKeyword(diagnostic, document) {
        return {
            title: 'Add entry keyword',
            kind: vscode_languageserver_1.CodeActionKind.QuickFix,
            diagnostics: [diagnostic],
            isPreferred: true,
            edit: {
                changes: {
                    [document.textDocument.uri]: [{
                            range: { start: diagnostic.range.start, end: diagnostic.range.start },
                            newText: 'entry '
                        }]
                }
            }
        };
    }
    fixRegexTokens(diagnostic, document) {
        const offset = document.textDocument.offsetAt(diagnostic.range.start);
        const rootCst = document.parseResult.value.$cstNode;
        if (rootCst) {
            const cstNode = (0, ast_util_1.findLeafNodeAtOffset)(rootCst, offset);
            const element = cstNode === null || cstNode === void 0 ? void 0 : cstNode.element;
            const container = ast.isCharacterRange(element) ? element : (0, ast_util_1.getContainerOfType)(element, ast.isCharacterRange);
            if (container && container.right && container.$cstNode) {
                const left = container.left.value;
                const right = container.right.value;
                return {
                    title: 'Refactor into regular expression',
                    kind: vscode_languageserver_1.CodeActionKind.QuickFix,
                    diagnostics: [diagnostic],
                    isPreferred: true,
                    edit: {
                        changes: {
                            [document.textDocument.uri]: [{
                                    range: container.$cstNode.range,
                                    newText: `/[${(0, regex_util_1.escapeRegExp)(left)}-${(0, regex_util_1.escapeRegExp)(right)}]/`
                                }]
                        }
                    }
                };
            }
        }
        return undefined;
    }
    fixCrossRefSyntax(diagnostic, document) {
        return {
            title: "Replace '|' with ':'",
            kind: vscode_languageserver_1.CodeActionKind.QuickFix,
            diagnostics: [diagnostic],
            isPreferred: true,
            edit: {
                changes: {
                    [document.textDocument.uri]: [{
                            range: diagnostic.range,
                            newText: ':'
                        }]
                }
            }
        };
    }
    fixHiddenTerminals(diagnostic, document) {
        const grammar = document.parseResult.value;
        const hiddenTokens = grammar.hiddenTokens;
        const changes = [];
        const hiddenNode = (0, grammar_util_1.findNodeForFeature)(grammar.$cstNode, 'definesHiddenTokens');
        if (hiddenNode) {
            const start = hiddenNode.range.start;
            const offset = hiddenNode.offset;
            const end = grammar.$cstNode.text.indexOf(')', offset) + 1;
            changes.push({
                newText: '',
                range: {
                    start,
                    end: document.textDocument.positionAt(end)
                }
            });
        }
        for (const terminal of hiddenTokens) {
            const ref = terminal.ref;
            if (ref && ast.isTerminalRule(ref) && !ref.hidden && ref.$cstNode) {
                const start = ref.$cstNode.range.start;
                changes.push({
                    newText: 'hidden ',
                    range: {
                        start,
                        end: start
                    }
                });
            }
        }
        return {
            title: 'Fix hidden terminals',
            kind: vscode_languageserver_1.CodeActionKind.QuickFix,
            diagnostics: [diagnostic],
            isPreferred: true,
            edit: {
                changes: {
                    [document.textDocument.uri]: changes
                }
            }
        };
    }
}
exports.LangiumGrammarCodeActionProvider = LangiumGrammarCodeActionProvider;
//# sourceMappingURL=langium-grammar-code-actions.js.map