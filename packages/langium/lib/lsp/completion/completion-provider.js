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
exports.DefaultCompletionProvider = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const ast = __importStar(require("../../grammar/generated/ast"));
const grammar_util_1 = require("../../grammar/grammar-util");
const naming_1 = require("../../references/naming");
const ast_util_1 = require("../../utils/ast-util");
const cst_util_1 = require("../../utils/cst-util");
const stream_1 = require("../../utils/stream");
const follow_element_computation_1 = require("./follow-element-computation");
class DefaultCompletionProvider {
    constructor(services) {
        this.scopeProvider = services.references.ScopeProvider;
        this.ruleInterpreter = services.lsp.completion.RuleInterpreter;
        this.grammar = services.Grammar;
    }
    getCompletion(document, params) {
        const root = document.parseResult.value;
        const cst = root.$cstNode;
        const items = [];
        const offset = document.textDocument.offsetAt(params.position);
        const acceptor = (value, item) => {
            const completionItem = this.fillCompletionItem(document.textDocument, offset, value, item);
            if (completionItem) {
                items.push(completionItem);
            }
        };
        if (cst) {
            const node = (0, ast_util_1.findLeafNodeAtOffset)(cst, offset);
            if (node) {
                const features = (0, follow_element_computation_1.findNextFeatures)(this.buildFeatureStack(node));
                const commonSuperRule = this.findCommonSuperRule(node);
                // In some cases, it is possible that we do not have a super rule
                if (commonSuperRule) {
                    const flattened = (0, cst_util_1.flatten)(commonSuperRule.node).filter(e => e.offset < offset);
                    const possibleFeatures = this.ruleInterpreter.interpretRule(commonSuperRule.rule, [...flattened], offset);
                    // Remove features which we already identified during parsing
                    const partialMatches = possibleFeatures.filter(e => {
                        const match = this.ruleInterpreter.featureMatches(e, flattened[flattened.length - 1], offset);
                        return match === 'partial' || match === 'both';
                    });
                    const notMatchingFeatures = possibleFeatures.filter(e => !partialMatches.includes(e));
                    features.push(...partialMatches);
                    features.push(...notMatchingFeatures.flatMap(e => (0, follow_element_computation_1.findNextFeatures)([e])));
                }
                if (node.end > offset) {
                    features.push(node.feature);
                }
                (0, stream_1.stream)(features).distinct(e => {
                    if (ast.isKeyword(e)) {
                        return e.value;
                    }
                    else {
                        return e;
                    }
                }).forEach(e => this.completionFor((0, cst_util_1.findRelevantNode)(node), e, acceptor));
            }
            else {
                // The entry rule is the first parser rule
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const parserRule = this.grammar.rules.find(e => ast.isParserRule(e));
                this.completionForRule(undefined, parserRule, acceptor);
            }
        }
        return vscode_languageserver_1.CompletionList.create(items, true);
    }
    buildFeatureStack(node) {
        const features = [];
        while (node) {
            if (node.feature) {
                features.push(node.feature);
            }
            node = node.parent;
        }
        return features;
    }
    completionForRule(astNode, rule, acceptor) {
        if (ast.isParserRule(rule)) {
            const features = (0, follow_element_computation_1.findFirstFeatures)(rule.alternatives);
            features.flatMap(e => this.completionFor(astNode, e, acceptor));
        }
    }
    completionFor(astNode, feature, acceptor) {
        if (ast.isKeyword(feature)) {
            this.completionForKeyword(feature, astNode, acceptor);
        }
        else if (ast.isRuleCall(feature) && feature.rule.ref) {
            return this.completionForRule(astNode, feature.rule.ref, acceptor);
        }
        else if (ast.isCrossReference(feature) && astNode) {
            this.completionForCrossReference(feature, astNode, acceptor);
        }
    }
    completionForCrossReference(crossRef, context, acceptor) {
        const assignment = (0, ast_util_1.getContainerOfType)(crossRef, ast.isAssignment);
        const parserRule = (0, ast_util_1.getContainerOfType)(crossRef, ast.isParserRule);
        if (assignment && parserRule) {
            const scope = this.scopeProvider.getScope(context, `${(0, grammar_util_1.getTypeNameAtElement)(parserRule, assignment)}:${assignment.feature}`);
            const duplicateStore = new Set();
            scope.getAllElements().forEach(e => {
                if (!duplicateStore.has(e.name)) {
                    acceptor(e, { kind: vscode_languageserver_1.CompletionItemKind.Reference, detail: e.type, sortText: '0' });
                    duplicateStore.add(e.name);
                }
            });
        }
    }
    completionForKeyword(keyword, context, acceptor) {
        acceptor(keyword.value, { kind: vscode_languageserver_1.CompletionItemKind.Keyword, detail: 'Keyword', sortText: /\w/.test(keyword.value) ? '1' : '2' });
    }
    findCommonSuperRule(node) {
        while (typeof node.element.$type !== 'string') {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            node = node.parent;
        }
        let superNode = node.parent;
        while (superNode) {
            if (superNode.element !== node.element) {
                const topFeature = node.feature;
                if (ast.isRuleCall(topFeature) && topFeature.rule.ref) {
                    const rule = topFeature.rule.ref;
                    return { rule, node };
                }
                throw new Error();
            }
            node = superNode;
            superNode = node.parent;
        }
        return undefined;
    }
    fillCompletionItem(document, offset, value, info) {
        let label;
        if (typeof value === 'string') {
            label = value;
        }
        else if ((0, ast_util_1.isAstNode)(value) && (0, naming_1.isNamed)(value)) {
            label = value.name;
        }
        else if (!(0, ast_util_1.isAstNode)(value)) {
            label = value.name;
        }
        else {
            return undefined;
        }
        const textEdit = this.buildCompletionTextEdit(document, offset, label);
        if (!textEdit) {
            return undefined;
        }
        const item = { label, textEdit };
        if (info) {
            Object.assign(item, info);
        }
        return item;
    }
    buildCompletionTextEdit(document, offset, completion) {
        let negativeOffset = 0;
        const content = document.getText();
        const contentLowerCase = content.toLowerCase();
        const completionLowerCase = completion.toLowerCase();
        for (let i = completionLowerCase.length; i > 0; i--) {
            const contentLowerCaseSub = contentLowerCase.substring(offset - i, offset);
            if (completionLowerCase.startsWith(contentLowerCaseSub) && (i === 0 || !this.isWordCharacterAt(contentLowerCase, offset - i - 1))) {
                negativeOffset = i;
                break;
            }
        }
        if (negativeOffset > 0 || offset === 0 || !this.isWordCharacterAt(completion, 0) || !this.isWordCharacterAt(content, offset - 1)) {
            const start = document.positionAt(offset - negativeOffset);
            const end = document.positionAt(offset);
            return {
                newText: completion,
                range: {
                    start,
                    end
                }
            };
        }
        else {
            return undefined;
        }
    }
    isWordCharacterAt(content, index) {
        return /\w/.test(content.charAt(index));
    }
}
exports.DefaultCompletionProvider = DefaultCompletionProvider;
//# sourceMappingURL=completion-provider.js.map