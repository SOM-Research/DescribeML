/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { References } from '../references/references';
import { LangiumServices } from '../services';
import { ValidationAcceptor, ValidationRegistry } from '../validation/validation-registry';
import { LangiumDocuments } from '../workspace/documents';
import * as ast from './generated/ast';
import type { LangiumGrammarServices } from './langium-grammar-module';
export declare class LangiumGrammarValidationRegistry extends ValidationRegistry {
    constructor(services: LangiumGrammarServices);
}
export declare namespace IssueCodes {
    const GrammarNameUppercase = "grammar-name-uppercase";
    const RuleNameUppercase = "rule-name-uppercase";
    const HiddenGrammarTokens = "hidden-grammar-tokens";
    const UseRegexTokens = "use-regex-tokens";
    const EntryRuleTokenSyntax = "entry-rule-token-syntax";
    const CrossRefTokenSyntax = "cross-ref-token-syntax";
    const MissingImport = "missing-import";
    const UnnecessaryFileExtension = "unnecessary-file-extension";
}
export declare class LangiumGrammarValidator {
    protected readonly references: References;
    protected readonly documents: LangiumDocuments;
    constructor(services: LangiumServices);
    checkGrammarName(grammar: ast.Grammar, accept: ValidationAcceptor): void;
    checkEntryGrammarRule(grammar: ast.Grammar, accept: ValidationAcceptor): void;
    checkUniqueRuleName(grammar: ast.Grammar, accept: ValidationAcceptor): void;
    checkGrammarHiddenTokens(grammar: ast.Grammar, accept: ValidationAcceptor): void;
    checkHiddenTerminalRule(terminalRule: ast.TerminalRule, accept: ValidationAcceptor): void;
    checkEmptyTerminalRule(terminalRule: ast.TerminalRule, accept: ValidationAcceptor): void;
    checkUsedHiddenTerminalRule(ruleCall: ast.RuleCall | ast.TerminalRuleCall, accept: ValidationAcceptor): void;
    checkCrossReferenceSyntax(crossRef: ast.CrossReference, accept: ValidationAcceptor): void;
    checkPackageImport(imp: ast.GrammarImport, accept: ValidationAcceptor): void;
    checkGrammarImports(grammar: ast.Grammar, accept: ValidationAcceptor): void;
    private checkRuleCallImport;
    checkInvalidCharacterRange(range: ast.CharacterRange, accept: ValidationAcceptor): void;
    checkGrammarForUnusedRules(grammar: ast.Grammar, accept: ValidationAcceptor): void;
    private ruleDfs;
    checkRuleName(rule: ast.AbstractRule, accept: ValidationAcceptor): void;
    checkKeyword(keyword: ast.Keyword, accept: ValidationAcceptor): void;
    checkUnorderedGroup(unorderedGroup: ast.UnorderedGroup, accept: ValidationAcceptor): void;
    checkParserRuleDataType(rule: ast.ParserRule, accept: ValidationAcceptor): void;
    checkTerminalRuleReturnType(rule: ast.TerminalRule, accept: ValidationAcceptor): void;
}
//# sourceMappingURL=langium-grammar-validator.d.ts.map