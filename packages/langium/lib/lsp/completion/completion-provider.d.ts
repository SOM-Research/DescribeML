/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken, CompletionItem, CompletionList, CompletionParams } from 'vscode-languageserver';
import { TextDocument, TextEdit } from 'vscode-languageserver-textdocument';
import * as ast from '../../grammar/generated/ast';
import { ScopeProvider } from '../../references/scope';
import { LangiumServices } from '../../services';
import { AstNode, AstNodeDescription, CstNode } from '../../syntax-tree';
import { MaybePromise } from '../../utils/promise-util';
import { LangiumDocument } from '../../workspace/documents';
import { RuleInterpreter } from './rule-interpreter';
export declare type CompletionAcceptor = (value: string | AstNode | AstNodeDescription, item?: Partial<CompletionItem>) => void;
export interface CompletionProvider {
    /**
     * Handle a completion request.
     *
     * @throws `OperationCancelled` if cancellation is detected during execution
     * @throws `ResponseError` if an error is detected that should be sent as response to the client
     */
    getCompletion(document: LangiumDocument, params: CompletionParams, cancelToken?: CancellationToken): MaybePromise<CompletionList>;
}
export declare class DefaultCompletionProvider implements CompletionProvider {
    protected readonly scopeProvider: ScopeProvider;
    protected readonly ruleInterpreter: RuleInterpreter;
    protected readonly grammar: ast.Grammar;
    constructor(services: LangiumServices);
    getCompletion(document: LangiumDocument, params: CompletionParams): MaybePromise<CompletionList>;
    protected buildFeatureStack(node: CstNode | undefined): ast.AbstractElement[];
    protected completionForRule(astNode: AstNode | undefined, rule: ast.AbstractRule, acceptor: CompletionAcceptor): void;
    protected completionFor(astNode: AstNode | undefined, feature: ast.AbstractElement, acceptor: CompletionAcceptor): void;
    protected completionForCrossReference(crossRef: ast.CrossReference, context: AstNode, acceptor: CompletionAcceptor): void;
    protected completionForKeyword(keyword: ast.Keyword, context: AstNode | undefined, acceptor: CompletionAcceptor): void;
    protected findCommonSuperRule(node: CstNode): {
        rule: ast.ParserRule;
        node: CstNode;
    } | undefined;
    protected fillCompletionItem(document: TextDocument, offset: number, value: string | AstNode | AstNodeDescription, info: Partial<CompletionItem> | undefined): CompletionItem | undefined;
    protected buildCompletionTextEdit(document: TextDocument, offset: number, completion: string): TextEdit | undefined;
    protected isWordCharacterAt(content: string, index: number): boolean;
}
//# sourceMappingURL=completion-provider.d.ts.map