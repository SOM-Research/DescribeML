/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken, WorkspaceFolder } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { ServiceRegistry } from '../service-registry';
import { LangiumSharedServices } from '../services';
import { AstNode, AstNodeDescription, AstReflection } from '../syntax-tree';
import { Stream } from '../utils/stream';
import { ReferenceDescription } from './ast-descriptions';
import { LangiumDocument, LangiumDocuments } from './documents';
/**
 * The index manager is responsible for keeping metadata about symbols and cross-references
 * in the workspace. It is used to look up symbols in the global scope, mostly during linking
 * and completion.
 */
export interface IndexManager {
    /**
     * Does the initial indexing of workspace folders.
     * Collects information about exported and referenced AstNodes in
     * each language file and stores it locally.
     *
     * @param folders The set of workspace folders to be indexed.
     */
    initializeWorkspace(folders: WorkspaceFolder[]): Promise<void>;
    /**
     * Deletes the specified document uris from the index.
     * Necessary when documents are deleted and not referenceable anymore.
     *
     * @param uris The document uris to delete.
     */
    remove(uris: URI[]): void;
    /**
     * Updates the information about a Document inside the index.
     *
     * @param document document(s) to be updated
     * @param cancelToken allows to cancel the current operation
     * @throws `OperationCanceled` if a user action occurs during execution
     */
    update(documents: LangiumDocument[], cancelToken?: CancellationToken): Promise<void>;
    /**
     * Returns all documents that could be affected by changes in the documents
     * identified by the given URIs.
     *
     * @param uris The document URIs which may affect other documents.
     */
    getAffectedDocuments(uris: URI[]): Stream<LangiumDocument>;
    /**
     * Compute a global scope, optionally filtered using a type identifier.
     *
     * @param nodeType The type to filter with, or `undefined` to return descriptions of all types.
     * @returns a `Stream` of existing `AstNodeDescription`s filtered by their type
     */
    allElements(nodeType?: string): Stream<AstNodeDescription>;
    /**
     * Returns all known references that are pointing to the given `targetNode`.
     *
     * @param targetNode the `AstNode` to look up references for
     * @param astNodePath the path that points to the `targetNode` inside the document. See also `AstNodeLocator`
     *
     * @returns a `Stream` of references that are targeting the `targetNode`
     */
    findAllReferences(targetNode: AstNode, astNodePath: string): Stream<ReferenceDescription>;
}
export declare class DefaultIndexManager implements IndexManager {
    protected readonly serviceRegistry: ServiceRegistry;
    protected readonly langiumDocuments: () => LangiumDocuments;
    protected readonly astReflection: AstReflection;
    protected readonly simpleIndex: Map<string, AstNodeDescription[]>;
    protected readonly referenceIndex: Map<string, ReferenceDescription[]>;
    protected readonly globalScopeCache: Map<string, AstNodeDescription[]>;
    constructor(services: LangiumSharedServices);
    findAllReferences(targetNode: AstNode, astNodePath: string): Stream<ReferenceDescription>;
    allElements(nodeType?: string): Stream<AstNodeDescription>;
    remove(uris: URI[]): void;
    update(documents: LangiumDocument[], cancelToken?: CancellationToken): Promise<void>;
    getAffectedDocuments(uris: URI[]): Stream<LangiumDocument>;
    /**
     * Determine whether the given document could be affected by a change of the document
     * identified by the given URI (second parameter).
     */
    protected isAffected(document: LangiumDocument, changed: URI): boolean;
    initializeWorkspace(folders: WorkspaceFolder[]): Promise<void>;
    /**
     * Load all additional documents that shall be visible in the context of the given workspace
     * folders and add them to the acceptor. This can be used to include built-in libraries of
     * your language, which can be either loaded from provided files or constructed in memory.
     */
    protected loadAdditionalDocuments(_folders: WorkspaceFolder[], _acceptor: (document: LangiumDocument) => void): Promise<void>;
    /**
     * Determine the root folder of the source documents in the given workspace folder.
     * The default implementation returns the URI of the workspace folder, but you can override
     * this to return a subfolder like `src` instead.
     */
    protected getRootFolder(folder: WorkspaceFolder): URI;
    /**
     * Traverse the file system folder identified by the given URI and its subFolders. All
     * contained files that match the filter are added to the acceptor.
     */
    protected traverseFolder(folderPath: URI, fileFilter: (uri: URI) => boolean, acceptor: (document: LangiumDocument) => void): Promise<void>;
    /**
     * Determine whether the folder with the given path shall be skipped while indexing the workspace.
     */
    protected skipFolder(folderPath: URI): boolean;
    protected processDocuments(documents: LangiumDocument[], cancelToken?: CancellationToken): Promise<void>;
}
//# sourceMappingURL=index-manager.d.ts.map