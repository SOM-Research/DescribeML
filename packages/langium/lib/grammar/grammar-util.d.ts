/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import * as ast from '../grammar/generated/ast';
import { LangiumServices } from '../services';
import { CstNode } from '../syntax-tree';
import { LangiumDocuments, PrecomputedScopes } from '../workspace/documents';
declare type FeatureValue = {
    feature: ast.AbstractElement;
    kind: 'Keyword' | 'RuleCall' | 'Assignment' | 'CrossReference' | 'Action';
};
export declare type Cardinality = '?' | '*' | '+' | undefined;
export declare type Operator = '=' | '+=' | '?=' | undefined;
export declare function isOptional(cardinality?: Cardinality): boolean;
export declare function isArray(cardinality?: Cardinality): boolean;
export declare function isArrayOperator(operator?: Operator): boolean;
export declare function isDataTypeRule(rule: ast.ParserRule): boolean;
export declare function isCommentTerminal(terminalRule: ast.TerminalRule): boolean;
interface RuleWithAlternatives {
    alternatives: ast.AbstractElement;
}
export declare function findAllFeatures(rule: RuleWithAlternatives): {
    byName: Map<string, FeatureValue>;
    byFeature: Map<ast.AbstractElement, string>;
};
export declare function replaceTokens(input: string): string;
export declare function replaceUnicodeTokens(input: string): string;
export declare function findNodeForFeature(node: CstNode | undefined, feature: string | undefined, index?: number): CstNode | undefined;
export declare function findNodesForFeature(node: CstNode | undefined, feature: string | undefined): CstNode[];
export declare function findAssignment(cstNode: CstNode): ast.Assignment | undefined;
export declare function getTypeNameAtElement(rule: ast.ParserRule, element: ast.AbstractElement): string;
export declare function getActionAtElement(element: ast.AbstractElement): ast.Action | undefined;
export declare function terminalRegex(terminalRule: ast.TerminalRule): string;
export declare function getTypeName(rule: ast.AbstractRule | undefined): string;
export declare function getRuleType(rule: ast.AbstractRule | undefined): string;
export declare function getEntryRule(grammar: ast.Grammar): ast.ParserRule | undefined;
export declare function resolveImport(documents: LangiumDocuments, imp: ast.GrammarImport): ast.Grammar | undefined;
export declare function resolveTransitiveImports(documents: LangiumDocuments, grammar: ast.Grammar): ast.Grammar[];
export declare function loadGrammar(json: string): ast.Grammar;
export declare function computeGrammarScope(services: LangiumServices, grammar: ast.Grammar): PrecomputedScopes;
export {};
//# sourceMappingURL=grammar-util.d.ts.map