/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import * as ast from '../../grammar/generated/ast';
import { CstNode } from '../../syntax-tree';
declare type MatchType = 'full' | 'both' | 'partial' | 'none';
/**
 * The `RuleInterpreter` is used by the `CompletionProvider` to identify any `AbstractElement` that could apply at a given cursor position.
 *
 * This is necessary as the parser uses the best fitting grammar rule for any given text input.
 * Assuming we could have multiple different applying rules at a certain point in the text input, only one of those will be successfully parsed.
 * However, this `RuleInterpreter` will return **all** possible features that are applicable.
 */
export declare class RuleInterpreter {
    interpretRule(rule: ast.ParserRule, nodes: CstNode[], offset: number): ast.AbstractElement[];
    featureMatches(feature: ast.AbstractElement, node: CstNode, offset: number): MatchType;
    ruleMatches(rule: ast.AbstractRule | undefined, node: CstNode, offset: number): MatchType;
}
export {};
//# sourceMappingURL=rule-interpreter.d.ts.map