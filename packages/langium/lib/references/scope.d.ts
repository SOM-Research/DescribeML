/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken } from 'vscode-jsonrpc';
import { LangiumServices } from '../services';
import { AstNode, AstNodeDescription, AstReflection } from '../syntax-tree';
import { AstNodeContent } from '../utils/ast-util';
import { Stream } from '../utils/stream';
import { AstNodeDescriptionProvider } from '../workspace/ast-descriptions';
import { LangiumDocument, PrecomputedScopes } from '../workspace/documents';
import { IndexManager } from '../workspace/index-manager';
import { NameProvider } from './naming';
export interface Scope {
    getElement(name: string): AstNodeDescription | undefined;
    getAllElements(): Stream<AstNodeDescription>;
}
export declare class SimpleScope implements Scope {
    readonly elements: Stream<AstNodeDescription>;
    readonly outerScope?: Scope;
    readonly caseInsensitive?: boolean;
    constructor(elements: Stream<AstNodeDescription>, outerScope?: Scope, options?: {
        caseInsensitive?: boolean;
    });
    getAllElements(): Stream<AstNodeDescription>;
    getElement(name: string): AstNodeDescription | undefined;
}
export declare const EMPTY_SCOPE: Scope;
export interface ScopeProvider {
    getScope(node: AstNode, referenceId: string): Scope;
}
export declare class DefaultScopeProvider implements ScopeProvider {
    protected readonly reflection: AstReflection;
    protected readonly indexManager: IndexManager;
    constructor(services: LangiumServices);
    getScope(node: AstNode, referenceId: string): Scope;
    /**
     * Create a scope for the given precomputed stream of elements.
     */
    protected createScope(elements: Stream<AstNodeDescription>, outerScope: Scope): Scope;
    /**
     * Create a global scope filtered for the given reference type.
     */
    protected getGlobalScope(referenceType: string): Scope;
}
export interface ScopeComputation {
    /**
     * Computes the scope for a document
     * @param document specified document for scope computation
     * @param cancelToken allows to cancel the current operation
     * @throws `OperationCanceled` if a user action occurs during execution
     */
    computeScope(document: LangiumDocument, cancelToken?: CancellationToken): Promise<PrecomputedScopes>;
}
export declare class DefaultScopeComputation implements ScopeComputation {
    protected readonly nameProvider: NameProvider;
    protected readonly descriptions: AstNodeDescriptionProvider;
    constructor(services: LangiumServices);
    computeScope(document: LangiumDocument, cancelToken?: CancellationToken): Promise<PrecomputedScopes>;
    protected processNode({ node }: AstNodeContent, document: LangiumDocument, scopes: PrecomputedScopes): void;
}
//# sourceMappingURL=scope.d.ts.map