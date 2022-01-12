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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangiumGrammarValidator = exports.IssueCodes = exports.LangiumGrammarValidationRegistry = void 0;
const path_1 = __importDefault(require("path"));
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const vscode_uri_1 = require("vscode-uri");
const ast_util_1 = require("../utils/ast-util");
const collections_1 = require("../utils/collections");
const validation_registry_1 = require("../validation/validation-registry");
const ast = __importStar(require("./generated/ast"));
const grammar_util_1 = require("./grammar-util");
class LangiumGrammarValidationRegistry extends validation_registry_1.ValidationRegistry {
    constructor(services) {
        super(services);
        const validator = services.validation.LangiumGrammarValidator;
        const checks = {
            AbstractRule: validator.checkRuleName,
            ParserRule: [
                validator.checkParserRuleDataType
            ],
            TerminalRule: [
                validator.checkTerminalRuleReturnType,
                validator.checkHiddenTerminalRule,
                validator.checkEmptyTerminalRule
            ],
            Keyword: validator.checkKeyword,
            UnorderedGroup: validator.checkUnorderedGroup,
            Grammar: [
                validator.checkGrammarName,
                validator.checkEntryGrammarRule,
                validator.checkUniqueRuleName,
                validator.checkGrammarHiddenTokens,
                validator.checkGrammarForUnusedRules,
                validator.checkGrammarImports
            ],
            GrammarImport: validator.checkPackageImport,
            CharacterRange: validator.checkInvalidCharacterRange,
            RuleCall: validator.checkUsedHiddenTerminalRule,
            TerminalRuleCall: validator.checkUsedHiddenTerminalRule,
            CrossReference: validator.checkCrossReferenceSyntax
        };
        this.register(checks, validator);
    }
}
exports.LangiumGrammarValidationRegistry = LangiumGrammarValidationRegistry;
var IssueCodes;
(function (IssueCodes) {
    IssueCodes.GrammarNameUppercase = 'grammar-name-uppercase';
    IssueCodes.RuleNameUppercase = 'rule-name-uppercase';
    IssueCodes.HiddenGrammarTokens = 'hidden-grammar-tokens';
    IssueCodes.UseRegexTokens = 'use-regex-tokens';
    IssueCodes.EntryRuleTokenSyntax = 'entry-rule-token-syntax';
    IssueCodes.CrossRefTokenSyntax = 'cross-ref-token-syntax';
    IssueCodes.MissingImport = 'missing-import';
    IssueCodes.UnnecessaryFileExtension = 'unnecessary-file-extension';
})(IssueCodes = exports.IssueCodes || (exports.IssueCodes = {}));
class LangiumGrammarValidator {
    constructor(services) {
        this.references = services.references.References;
        this.documents = services.shared.workspace.LangiumDocuments;
    }
    checkGrammarName(grammar, accept) {
        if (grammar.name) {
            const firstChar = grammar.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Grammar name should start with an upper case letter.', { node: grammar, property: 'name', code: IssueCodes.GrammarNameUppercase });
            }
        }
    }
    checkEntryGrammarRule(grammar, accept) {
        const entryRules = grammar.rules.filter(e => ast.isParserRule(e) && e.entry);
        if (entryRules.length === 0) {
            const possibleEntryRule = grammar.rules.find(e => ast.isParserRule(e) && !(0, grammar_util_1.isDataTypeRule)(e));
            if (possibleEntryRule) {
                accept('error', 'The grammar is missing an entry parser rule. This rule can be an entry one.', { node: possibleEntryRule, property: 'name', code: IssueCodes.EntryRuleTokenSyntax });
            }
            else {
                accept('error', 'This grammar is missing an entry parser rule.', { node: grammar, property: 'name' });
            }
        }
        else if (entryRules.length > 1) {
            entryRules.forEach(rule => accept('error', 'The entry rule has to be unique.', { node: rule, property: 'name' }));
        }
        else if ((0, grammar_util_1.isDataTypeRule)(entryRules[0])) {
            accept('error', 'The entry rule cannot be a data type rule.', { node: entryRules[0], property: 'name' });
        }
    }
    checkUniqueRuleName(grammar, accept) {
        const ruleMap = new collections_1.MultiMap();
        for (const rule of grammar.rules) {
            ruleMap.add(rule.name.toLowerCase(), rule);
        }
        for (const name of ruleMap.keys()) {
            const rules = ruleMap.get(name);
            if (rules.length > 1) {
                rules.forEach(e => {
                    accept('error', "A rule's name has to be unique.", { node: e, property: 'name' });
                });
            }
        }
    }
    checkGrammarHiddenTokens(grammar, accept) {
        if (grammar.definesHiddenTokens) {
            accept('error', 'Hidden terminals are declared at the terminal definition.', { node: grammar, property: 'definesHiddenTokens', code: IssueCodes.HiddenGrammarTokens });
        }
    }
    checkHiddenTerminalRule(terminalRule, accept) {
        if (terminalRule.hidden && terminalRule.fragment) {
            accept('error', 'Cannot use terminal fragments as hidden tokens.', { node: terminalRule, property: 'hidden' });
        }
    }
    checkEmptyTerminalRule(terminalRule, accept) {
        try {
            const regex = (0, grammar_util_1.terminalRegex)(terminalRule);
            if (new RegExp(regex).test('')) {
                accept('error', 'This terminal could match an empty string.', { node: terminalRule, property: 'name' });
            }
        }
        catch (_a) {
            // In case the terminal can't be transformed into a regex, we throw an error
            // As this indicates unresolved cross references or parser errors, we can ignore this here
        }
    }
    checkUsedHiddenTerminalRule(ruleCall, accept) {
        const parentRule = (0, ast_util_1.getContainerOfType)(ruleCall, (n) => ast.isTerminalRule(n) || ast.isParserRule(n));
        if (parentRule) {
            if ('hidden' in parentRule && (parentRule === null || parentRule === void 0 ? void 0 : parentRule.hidden)) {
                return;
            }
            const ref = ruleCall.rule.ref;
            if (ast.isTerminalRule(ref) && ref.hidden) {
                accept('error', 'Cannot use hidden terminal in non-hidden rule', { node: ruleCall, property: 'rule' });
            }
        }
    }
    checkCrossReferenceSyntax(crossRef, accept) {
        if (crossRef.deprecatedSyntax) {
            accept('error', "'|' is deprecated. Please, use ':' instead.", { node: crossRef, property: 'deprecatedSyntax', code: IssueCodes.CrossRefTokenSyntax });
        }
    }
    checkPackageImport(imp, accept) {
        const resolvedGrammar = (0, grammar_util_1.resolveImport)(this.documents, imp);
        if (resolvedGrammar === undefined) {
            accept('error', 'Import cannot be resolved.', { node: imp, property: 'path' });
        }
        else if (imp.path.endsWith('.langium')) {
            accept('warning', 'Imports do not need file extensions.', { node: imp, property: 'path', code: IssueCodes.UnnecessaryFileExtension });
        }
    }
    checkGrammarImports(grammar, accept) {
        // Compute transitive grammar dependencies once for each grammar
        const importedGrammars = new Set((0, grammar_util_1.resolveTransitiveImports)(this.documents, grammar).map(e => (0, ast_util_1.getDocument)(e)));
        (0, ast_util_1.streamAllContents)(grammar).map(e => e.node).forEach(e => {
            if (ast.isRuleCall(e) || ast.isTerminalRuleCall(e)) {
                this.checkRuleCallImport(e, importedGrammars, accept);
            }
        });
    }
    checkRuleCallImport(ruleCall, importedDocuments, accept) {
        var _a;
        const ref = ruleCall.rule.ref;
        if (ref) {
            const refDoc = (0, ast_util_1.getDocument)(ref);
            const document = (0, ast_util_1.getDocument)(ruleCall);
            const grammar = document.parseResult.value;
            // Only check if the rule is sourced from another document
            if (ast.isGrammar(grammar) && refDoc !== document && !importedDocuments.has(refDoc)) {
                let relative = path_1.default.relative(vscode_uri_1.Utils.dirname(document.uri).fsPath, refDoc.uri.fsPath);
                if (relative.endsWith('.langium')) {
                    relative = relative.substring(0, relative.length - '.langium'.length);
                }
                if (!relative.startsWith('.')) {
                    relative = './' + relative;
                }
                accept('error', `Referenced rule "${(_a = ruleCall.rule.ref) === null || _a === void 0 ? void 0 : _a.name}" is not imported.`, {
                    node: ruleCall,
                    property: 'rule',
                    code: IssueCodes.MissingImport,
                    data: relative
                });
            }
        }
    }
    checkInvalidCharacterRange(range, accept) {
        if (range.right) {
            const message = 'Character ranges cannot use more than one character';
            let invalid = false;
            if (range.left.value.length > 1) {
                invalid = true;
                accept('error', message, { node: range.left, property: 'value' });
            }
            if (range.right.value.length > 1) {
                invalid = true;
                accept('error', message, { node: range.right, property: 'value' });
            }
            if (!invalid) {
                accept('hint', 'Consider using regex instead of character ranges', { node: range, code: IssueCodes.UseRegexTokens });
            }
        }
    }
    checkGrammarForUnusedRules(grammar, accept) {
        const visitedSet = new Set();
        const entry = (0, grammar_util_1.getEntryRule)(grammar);
        if (entry) {
            this.ruleDfs(entry, visitedSet);
            visitedSet.add(entry.name);
        }
        for (const rule of grammar.rules) {
            if (ast.isTerminalRule(rule) && rule.hidden) {
                continue;
            }
            if (!visitedSet.has(rule.name)) {
                accept('hint', 'This rule is declared but never referenced.', { node: rule, property: 'name', tags: [vscode_languageserver_types_1.DiagnosticTag.Unnecessary] });
            }
        }
    }
    ruleDfs(rule, visitedSet) {
        (0, ast_util_1.streamAllContents)(rule).forEach(content => {
            if (ast.isRuleCall(content.node)) {
                const refRule = content.node.rule.ref;
                if (refRule && !visitedSet.has(refRule.name)) {
                    visitedSet.add(refRule.name);
                    if (ast.isParserRule(refRule)) {
                        this.ruleDfs(refRule, visitedSet);
                    }
                }
            }
        });
    }
    checkRuleName(rule, accept) {
        if (rule.name) {
            const firstChar = rule.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Rule name should start with an upper case letter.', { node: rule, property: 'name', code: IssueCodes.RuleNameUppercase });
            }
        }
    }
    checkKeyword(keyword, accept) {
        if (keyword.value.length === 0) {
            accept('error', 'Keywords cannot be empty.', { node: keyword });
        }
        else if (keyword.value.trim().length === 0) {
            accept('error', 'Keywords cannot only consist of whitespace characters.', { node: keyword });
        }
        else if (/\s/g.test(keyword.value)) {
            accept('warning', 'Keywords should not contain whitespace characters.', { node: keyword });
        }
    }
    checkUnorderedGroup(unorderedGroup, accept) {
        accept('error', 'Unordered groups are currently not supported', { node: unorderedGroup });
    }
    checkParserRuleDataType(rule, accept) {
        const hasDatatypeReturnType = rule.type && isPrimitiveType(rule.type);
        const isDataType = (0, grammar_util_1.isDataTypeRule)(rule);
        if (!hasDatatypeReturnType && isDataType) {
            accept('error', 'This parser rule does not create an object. Add a primitive return type or an action to the start of the rule to force object instantiation.', { node: rule, property: 'name' });
        }
        else if (hasDatatypeReturnType && !isDataType) {
            accept('error', 'Normal parser rules are not allowed to return a primitive value. Use a datatype rule for that.', { node: rule, property: 'type' });
        }
    }
    checkTerminalRuleReturnType(rule, accept) {
        if (rule.type && !isPrimitiveType(rule.type)) {
            accept('error', "Terminal rules can only return primitive types like 'string', 'boolean', 'number' or 'date'.", { node: rule, property: 'type' });
        }
    }
}
exports.LangiumGrammarValidator = LangiumGrammarValidator;
const primitiveTypes = ['string', 'number', 'boolean', 'Date'];
function isPrimitiveType(type) {
    return primitiveTypes.includes(type);
}
//# sourceMappingURL=langium-grammar-validator.js.map