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
exports.computeGrammarScope = exports.loadGrammar = exports.resolveTransitiveImports = exports.resolveImport = exports.getEntryRule = exports.getRuleType = exports.getTypeName = exports.terminalRegex = exports.getActionAtElement = exports.getTypeNameAtElement = exports.findAssignment = exports.findNodesForFeature = exports.findNodeForFeature = exports.replaceUnicodeTokens = exports.replaceTokens = exports.findAllFeatures = exports.isCommentTerminal = exports.isDataTypeRule = exports.isArrayOperator = exports.isArray = exports.isOptional = void 0;
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const vscode_uri_1 = require("vscode-uri");
const ast = __importStar(require("../grammar/generated/ast"));
const cst_node_builder_1 = require("../parser/cst-node-builder");
const ast_util_1 = require("../utils/ast-util");
const collections_1 = require("../utils/collections");
const regex_util_1 = require("../utils/regex-util");
const documents_1 = require("../workspace/documents");
const langium_grammar_module_1 = require("./langium-grammar-module");
function isOptional(cardinality) {
    return cardinality === '?' || cardinality === '*';
}
exports.isOptional = isOptional;
function isArray(cardinality) {
    return cardinality === '*' || cardinality === '+';
}
exports.isArray = isArray;
function isArrayOperator(operator) {
    return operator === '+=';
}
exports.isArrayOperator = isArrayOperator;
function isDataTypeRule(rule) {
    const features = Array.from(findAllFeatures(rule).byFeature.keys());
    const onlyRuleCallsAndKeywords = features.every(e => ast.isRuleCall(e) || ast.isKeyword(e) || ast.isGroup(e) || ast.isAlternatives(e) || ast.isUnorderedGroup(e));
    if (onlyRuleCallsAndKeywords) {
        const ruleCallWithParserRule = features.filter(e => ast.isRuleCall(e) && ast.isParserRule(e.rule.ref) && !isDataTypeRule(e.rule.ref));
        return ruleCallWithParserRule.length === 0;
    }
    return false;
}
exports.isDataTypeRule = isDataTypeRule;
function isCommentTerminal(terminalRule) {
    return terminalRule.hidden && !' '.match(terminalRegex(terminalRule));
}
exports.isCommentTerminal = isCommentTerminal;
function findAllFeatures(rule) {
    const map = new Map();
    const featureMap = new Map();
    putFeature(rule.alternatives, undefined, map, featureMap);
    const newMap = new Map();
    for (const [key, value] of map.entries()) {
        newMap.set(key.replace(/\^/g, ''), value);
    }
    const newFeatureMap = new Map();
    for (const [key, value] of featureMap.entries()) {
        newFeatureMap.set(key, value.replace(/\^/g, ''));
    }
    return { byName: newMap, byFeature: newFeatureMap };
}
exports.findAllFeatures = findAllFeatures;
function putFeature(element, previous, byName, byFeature) {
    var _a, _b, _c;
    if (ast.isAssignment(element)) {
        const fullName = (previous !== null && previous !== void 0 ? previous : '') + element.feature;
        byName.set(fullName, { feature: element, kind: 'Assignment' });
        byFeature.set(element, fullName);
        putFeature(element.terminal, fullName, byName, byFeature);
    }
    else if (ast.isRuleCall(element)) {
        const name = (previous !== null && previous !== void 0 ? previous : '') + ((_a = element.rule.ref) === null || _a === void 0 ? void 0 : _a.name) + 'RuleCall';
        byName.set(name, { feature: element, kind: 'RuleCall' });
        byFeature.set(element, name);
    }
    else if (ast.isCrossReference(element)) {
        const name = (previous !== null && previous !== void 0 ? previous : '') + ((_b = element.type.ref) === null || _b === void 0 ? void 0 : _b.name) + 'CrossReference';
        byName.set(name, { feature: element, kind: 'CrossReference' });
        byFeature.set(element, name);
    }
    else if (ast.isKeyword(element)) {
        const validName = replaceTokens(element.value) + 'Keyword';
        byName.set(validName, { feature: element, kind: 'Keyword' });
        byFeature.set(element, validName);
    }
    else if (ast.isAction(element)) {
        const name = (previous !== null && previous !== void 0 ? previous : '') + element.type + ((_c = element.feature) !== null && _c !== void 0 ? _c : '') + 'Action';
        byName.set(name, { feature: element, kind: 'Action' });
        byFeature.set(element, name);
    }
    else if (ast.isAlternatives(element) || ast.isUnorderedGroup(element) || ast.isGroup(element)) {
        for (const subFeature of element.elements) {
            putFeature(subFeature, previous, byName, byFeature);
        }
    }
}
function replaceTokens(input) {
    let result = input;
    result = result.replace(/\s+/g, 'Whitespace');
    result = result.replace(/:/g, 'Colon');
    result = result.replace(/\./g, 'Dot');
    result = result.replace(/\//g, 'Slash');
    result = result.replace(/\\/g, 'Backslash');
    result = result.replace(/,/g, 'Comma');
    result = result.replace(/\(/g, 'ParenthesisOpen');
    result = result.replace(/\)/g, 'ParenthesisClose');
    result = result.replace(/\[/g, 'BracketOpen');
    result = result.replace(/\]/g, 'BracketClose');
    result = result.replace(/\{/g, 'CurlyOpen');
    result = result.replace(/\}/g, 'CurlyClose');
    result = result.replace(/\+/g, 'Plus');
    result = result.replace(/\*/g, 'Asterisk');
    result = result.replace(/\?/g, 'QuestionMark');
    result = result.replace(/!/g, 'ExclamationMark');
    result = result.replace(/\^/g, 'Caret');
    result = result.replace(/</g, 'LessThan');
    result = result.replace(/>/g, 'MoreThan');
    result = result.replace(/&/g, 'Ampersand');
    result = result.replace(/\|/g, 'Pipe');
    result = result.replace(/=/g, 'Equals');
    result = result.replace(/-/g, 'Dash');
    result = result.replace(/_/g, 'Underscore');
    result = result.replace(/;/g, 'Semicolon');
    result = result.replace(/@/g, 'At');
    result = result.replace(/%/g, 'Percent');
    result = result.replace(/\$/g, 'Currency');
    result = result.replace(/"/g, 'DoubleQuote');
    result = result.replace(/'/g, 'SingleQuote');
    result = result.replace(/#/g, 'Hash');
    // The ß gets special treatment here, because its `toUpperCase` behavior is really weird.
    result = result.replace(/ß/g, 'Eszett');
    result = result[0].toUpperCase() + result.substring(1);
    result = replaceUnicodeTokens(result);
    return result;
}
exports.replaceTokens = replaceTokens;
function replaceUnicodeTokens(input) {
    let output = '';
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        if (char < 65 || char > 90 && char < 97 || char > 122) {
            output += `u${char}`;
        }
        else {
            output += input.charAt(i);
        }
    }
    return output;
}
exports.replaceUnicodeTokens = replaceUnicodeTokens;
function findNodeForFeature(node, feature, index) {
    const nodes = findNodesForFeature(node, feature);
    if (nodes.length === 0) {
        return undefined;
    }
    if (index !== undefined) {
        index = Math.max(0, Math.min(index, nodes.length - 1));
    }
    else {
        index = 0;
    }
    return nodes[index];
}
exports.findNodeForFeature = findNodeForFeature;
/**
 * This `internal` declared method exists, as we want to find the first child with the specified feature.
 * When the own feature is named the same by accident, we will instead return the input value.
 * Therefore, we skip the first assignment check.
 * @param node The node to traverse/check for the specified feature
 * @param feature The specified feature to find
 * @param element The element of the initial node. Do not process nodes of other elements.
 * @param first Whether this is the first node of the whole check.
 * @returns A list of all nodes within this node that belong to the specified feature.
 */
function findNodesForFeatureInternal(node, feature, element, first) {
    if (!node || !feature || node.element !== element) {
        return [];
    }
    const nodeFeature = (0, ast_util_1.getContainerOfType)(node.feature, ast.isAssignment);
    if (!first && nodeFeature && nodeFeature.feature === feature) {
        return [node];
    }
    else if (node instanceof cst_node_builder_1.CompositeCstNodeImpl) {
        return node.children.flatMap(e => findNodesForFeatureInternal(e, feature, element, false));
    }
    return [];
}
function findNodesForFeature(node, feature) {
    return findNodesForFeatureInternal(node, feature, node === null || node === void 0 ? void 0 : node.element, true);
}
exports.findNodesForFeature = findNodesForFeature;
function findAssignment(cstNode) {
    let n = cstNode;
    do {
        const assignment = (0, ast_util_1.getContainerOfType)(n.feature, ast.isAssignment);
        if (assignment) {
            return assignment;
        }
        n = n.parent;
    } while (n);
    return undefined;
}
exports.findAssignment = findAssignment;
function getTypeNameAtElement(rule, element) {
    var _a;
    const action = getActionAtElement(element);
    return (_a = action === null || action === void 0 ? void 0 : action.type) !== null && _a !== void 0 ? _a : getTypeName(rule);
}
exports.getTypeNameAtElement = getTypeNameAtElement;
function getActionAtElement(element) {
    const parent = element.$container;
    if (ast.isGroup(parent)) {
        const elements = parent.elements;
        const index = elements.indexOf(element);
        for (let i = index - 1; i >= 0; i--) {
            const item = elements[i];
            if (ast.isAction(item)) {
                return item;
            }
            else {
                let action;
                (0, ast_util_1.streamAllContents)(elements[i]).forEach(e => {
                    if (ast.isAction(e.node)) {
                        action = e.node;
                    }
                });
                if (action) {
                    return action;
                }
            }
        }
    }
    if (ast.isAbstractElement(parent)) {
        return getActionAtElement(parent);
    }
    else {
        return undefined;
    }
}
exports.getActionAtElement = getActionAtElement;
function terminalRegex(terminalRule) {
    return abstractElementToRegex(terminalRule.terminal);
}
exports.terminalRegex = terminalRegex;
// Using [\s\S]* allows to match everything, compared to . which doesn't match line terminators
const WILDCARD = /[\s\S]/.source;
function abstractElementToRegex(element) {
    if (ast.isTerminalAlternatives(element)) {
        return terminalAlternativesToRegex(element);
    }
    else if (ast.isTerminalGroup(element)) {
        return terminalGroupToRegex(element);
    }
    else if (ast.isCharacterRange(element)) {
        return characterRangeToRegex(element);
    }
    else if (ast.isTerminalRuleCall(element)) {
        const rule = element.rule.ref;
        if (!rule) {
            throw new Error('Missing rule reference.');
        }
        return withCardinality(terminalRegex(rule), element.cardinality, true);
    }
    else if (ast.isNegatedToken(element)) {
        return negateTokenToRegex(element);
    }
    else if (ast.isUntilToken(element)) {
        return untilTokenToRegex(element);
    }
    else if (ast.isRegexToken(element)) {
        return withCardinality(element.regex, element.cardinality, true);
    }
    else if (ast.isWildcard(element)) {
        return withCardinality(WILDCARD, element.cardinality);
    }
    else {
        throw new Error('Invalid terminal element.');
    }
}
function terminalAlternativesToRegex(alternatives) {
    return withCardinality(`(${alternatives.elements.map(abstractElementToRegex).join('|')})`, alternatives.cardinality);
}
function terminalGroupToRegex(group) {
    return withCardinality(group.elements.map(abstractElementToRegex).join(''), group.cardinality);
}
function untilTokenToRegex(until) {
    return withCardinality(`${WILDCARD}*?${abstractElementToRegex(until.terminal)}`, until.cardinality);
}
function negateTokenToRegex(negate) {
    return withCardinality(`(?!${abstractElementToRegex(negate.terminal)})${WILDCARD}*?`, negate.cardinality, true);
}
function characterRangeToRegex(range) {
    if (range.right) {
        return withCardinality(`[${keywordToRegex(range.left)}-${keywordToRegex(range.right)}]`, range.cardinality);
    }
    return withCardinality(keywordToRegex(range.left), range.cardinality, true);
}
function keywordToRegex(keyword) {
    return (0, regex_util_1.escapeRegExp)(keyword.value);
}
function withCardinality(regex, cardinality, wrap = false) {
    if (cardinality) {
        if (wrap) {
            regex = `(${regex})`;
        }
        return `${regex}${cardinality}`;
    }
    return regex;
}
function getTypeName(rule) {
    var _a;
    if (rule) {
        return (_a = rule.type) !== null && _a !== void 0 ? _a : rule.name;
    }
    else {
        throw new Error('Unknown rule type');
    }
}
exports.getTypeName = getTypeName;
function getRuleType(rule) {
    var _a;
    if (ast.isParserRule(rule) && isDataTypeRule(rule) || ast.isTerminalRule(rule)) {
        return (_a = rule.type) !== null && _a !== void 0 ? _a : 'string';
    }
    return getTypeName(rule);
}
exports.getRuleType = getRuleType;
function getEntryRule(grammar) {
    return grammar.rules.find(e => ast.isParserRule(e) && e.entry);
}
exports.getEntryRule = getEntryRule;
function resolveImport(documents, imp) {
    if (imp.path === undefined || imp.path.length === 0) {
        return undefined;
    }
    const uri = vscode_uri_1.Utils.dirname((0, ast_util_1.getDocument)(imp).uri);
    let grammarPath = imp.path;
    if (!grammarPath.endsWith('.langium')) {
        grammarPath += '.langium';
    }
    const resolvedUri = vscode_uri_1.Utils.resolvePath(uri, grammarPath);
    try {
        const resolvedDocument = documents.getOrCreateDocument(resolvedUri);
        const node = resolvedDocument.parseResult.value;
        if (ast.isGrammar(node)) {
            return node;
        }
    }
    catch (_a) {
        // NOOP
    }
    return undefined;
}
exports.resolveImport = resolveImport;
function resolveTransitiveImports(documents, grammar) {
    return resolveTransitiveImportsInternal(documents, grammar);
}
exports.resolveTransitiveImports = resolveTransitiveImports;
function resolveTransitiveImportsInternal(documents, grammar, initialGrammar = grammar, visited = new Set(), grammars = new Set()) {
    const doc = (0, ast_util_1.getDocument)(grammar);
    if (initialGrammar !== grammar) {
        grammars.add(grammar);
    }
    if (!visited.has(doc.uri)) {
        visited.add(doc.uri);
        for (const imp of grammar.imports) {
            const importedGrammar = resolveImport(documents, imp);
            if (importedGrammar) {
                resolveTransitiveImportsInternal(documents, importedGrammar, initialGrammar, visited, grammars);
            }
        }
    }
    return Array.from(grammars);
}
function loadGrammar(json) {
    const services = (0, langium_grammar_module_1.createLangiumGrammarServices)().grammar;
    const astNode = services.serializer.JsonSerializer.deserialize(json);
    if (!ast.isGrammar(astNode)) {
        throw new Error('Could not load grammar from specified json input.');
    }
    const grammar = astNode;
    const textDocument = vscode_languageserver_textdocument_1.TextDocument.create('memory://grammar.langium', 'langium', 0, '');
    const document = (0, documents_1.documentFromText)(textDocument, {
        lexerErrors: [],
        parserErrors: [],
        value: grammar
    });
    grammar.$document = document;
    document.precomputedScopes = computeGrammarScope(services, grammar);
    return grammar;
}
exports.loadGrammar = loadGrammar;
function computeGrammarScope(services, grammar) {
    const nameProvider = services.references.NameProvider;
    const descriptions = services.index.AstNodeDescriptionProvider;
    const document = (0, ast_util_1.getDocument)(grammar);
    const scopes = new collections_1.MultiMap();
    for (const content of (0, ast_util_1.streamAllContents)(grammar)) {
        const { node } = content;
        const container = node.$container;
        if (container) {
            const name = nameProvider.getName(node);
            if (name) {
                const description = descriptions.createDescription(node, name, document);
                scopes.add(container, description);
            }
        }
    }
    return scopes;
}
exports.computeGrammarScope = computeGrammarScope;
//# sourceMappingURL=grammar-util.js.map