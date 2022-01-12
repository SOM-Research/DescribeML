/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken } from 'vscode-languageserver';
import { LangiumServices } from '../services';
import { AstNode, AstNodeDescription, AstReflection, CstNode, LinkingError, Reference, ReferenceInfo } from '../syntax-tree';
import { AstNodeLocator } from '../workspace/ast-node-locator';
import { LangiumDocument, LangiumDocuments } from '../workspace/documents';
import { ScopeProvider } from './scope';
/**
 * This service is responsible for resolving cross-references in the AST.
 */
export interface Linker {
    /**
     * Links all cross-references within the specified document. The default implementation loads only target
     * elements from documents that are present in the `LangiumDocuments` service.
     *
     * @param document A LangiumDocument that shall be linked.
     * @param cancelToken A token for cancelling the operation.
     */
    link(document: LangiumDocument, cancelToken?: CancellationToken): Promise<void>;
    /**
     * Unlinks all references within the specified document and removes them from the list of `references`.
     *
     * @param document A LangiumDocument that shall be unlinked.
     */
    unlink(document: LangiumDocument): void;
    /**
     * Determines a candidate AST node description for linking the given reference.
     *
     * @param node The AST node containing the reference.
     * @param refId The reference identifier used to build a scope.
     * @param reference The actual reference to resolve.
     */
    getCandidate(node: AstNode, refId: string, reference: Reference): AstNodeDescription | LinkingError;
    /**
     * Creates a cross reference node being aware of its containing AstNode, the corresponding CstNode,
     * the cross reference text denoting the target AstNode being already extracted of the document text,
     * as well as the unique cross reference identifier.
     *
     * Default behavior:
     *  - The returned Reference's 'ref' property pointing to the target AstNode is populated lazily on its
     *    first visit.
     *  - If the target AstNode cannot be resolved on the first visit, an error indicator will be installed
     *    and further resolution attempts will *not* be performed.
     *
     * @param node The containing AST node
     * @param refNode The corresponding CST node
     * @param refId The cross reference identifier like '<entityTypeName>:<propertyName>'
     * @param refText The cross reference text denoting the target AstNode
     * @returns the desired Reference node, whose behavior wrt. resolving the cross reference is implementation specific.
     */
    buildReference(node: AstNode, refNode: CstNode, refId: string, refText: string): Reference;
}
export declare function getReferenceId(containerTypeName: string, propertyName: string): string;
export declare function getReferenceProperty(referenceId: string): string;
export declare class DefaultLinker implements Linker {
    protected readonly reflection: AstReflection;
    protected readonly scopeProvider: ScopeProvider;
    protected readonly astNodeLocator: AstNodeLocator;
    protected readonly langiumDocuments: () => LangiumDocuments;
    constructor(services: LangiumServices);
    link(document: LangiumDocument, cancelToken?: CancellationToken): Promise<void>;
    protected doLink(info: ReferenceInfo, document: LangiumDocument): void;
    unlink(document: LangiumDocument): void;
    getCandidate(container: AstNode, refId: string, reference: Reference): AstNodeDescription | LinkingError;
    buildReference(node: AstNode, refNode: CstNode, refId: string, refText: string): Reference;
    protected getLinkedNode(container: AstNode, refId: string, reference: Reference): AstNode | LinkingError;
    protected loadAstNode(nodeDescription: AstNodeDescription): AstNode | undefined;
    protected createLinkingError(refInfo: ReferenceInfo, refId: string, targetDescription?: AstNodeDescription): LinkingError;
}
//# sourceMappingURL=linker.d.ts.map