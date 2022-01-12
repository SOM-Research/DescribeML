/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken, Connection, Diagnostic } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { ServiceRegistry } from '../service-registry';
import { LangiumSharedServices } from '../services';
import { AstNode } from '../syntax-tree';
import { MultiMap } from '../utils/collections';
import { MaybePromise } from '../utils/promise-util';
import { IndexManager } from '../workspace/index-manager';
import { DocumentState, LangiumDocument, LangiumDocuments } from './documents';
export interface DocumentBuilder {
    /**
     * Inserts the document into the index and rebuilds affected documents
     *
     * @param document which should be built
     * @param cancelToken allows to cancel the current operation
     * @throws `OperationCancelled` if cancellation is detected during execution
     */
    build<T extends AstNode>(document: LangiumDocument<T>, cancelToken?: CancellationToken): Promise<BuildResult<T>>;
    /**
     * This method is called when a document change is detected.
     * Implementation should update the state of associated `LangiumDocument` instances and make sure
     * that the index information of the affected documents are also updated.
     *
     * @param changed URIs of changed/created documents
     * @param deleted URIs of deleted documents
     * @param cancelToken allows to cancel the current operation
     * @see IndexManager.update()
     * @see LangiumDocuments.invalidateDocument()
     * @throws `OperationCancelled` if cancellation is detected during execution
     */
    update(changed: URI[], deleted: URI[], cancelToken?: CancellationToken): Promise<void>;
    /**
     * Notify the given callback when a document update was triggered, but before any document
     * is rebuilt. Listeners to this event should not perform any long-running task.
     */
    onUpdate(callback: DocumentUpdateListener): void;
    /**
     * Notify the given callback when a set of documents has been built reaching a desired target state.
     */
    onBuildPhase(targetState: DocumentState, callback: DocumentBuildListener): void;
}
export declare type DocumentUpdateListener = (changed: URI[], deleted: URI[]) => void;
export declare type DocumentBuildListener = (built: LangiumDocument[], cancelToken: CancellationToken) => Promise<void>;
export interface BuildResult<T extends AstNode = AstNode> {
    readonly document: LangiumDocument<T>;
    readonly diagnostics: Diagnostic[];
}
export declare class DefaultDocumentBuilder implements DocumentBuilder {
    protected readonly connection?: Connection;
    protected readonly langiumDocuments: LangiumDocuments;
    protected readonly indexManager: IndexManager;
    protected readonly serviceRegistry: ServiceRegistry;
    protected readonly updateListeners: DocumentUpdateListener[];
    protected readonly buildPhaseListeners: MultiMap<DocumentState, DocumentBuildListener>;
    constructor(services: LangiumSharedServices);
    build<T extends AstNode>(document: LangiumDocument<T>, cancelToken?: CancellationToken): Promise<BuildResult<T>>;
    protected validate(document: LangiumDocument, cancelToken?: CancellationToken, forceDiagnostics?: boolean): Promise<Diagnostic[]>;
    /**
     * Determine whether the given document should be validated during a build. The default
     * implementation validates whenever a client connection is available.
     */
    protected shouldValidate(document: LangiumDocument): boolean;
    update(changed: URI[], deleted: URI[], cancelToken?: CancellationToken): Promise<void>;
    onUpdate(callback: DocumentUpdateListener): void;
    protected collectDocuments(changed: LangiumDocument[], deleted: URI[]): LangiumDocument[];
    protected buildDocuments(documents: LangiumDocument[], cancelToken: CancellationToken): Promise<void>;
    protected runCancelable(documents: LangiumDocument[], targetState: DocumentState, cancelToken: CancellationToken, callback: (document: LangiumDocument) => MaybePromise<unknown>): Promise<void>;
    onBuildPhase(targetState: DocumentState, callback: DocumentBuildListener): void;
    protected notifyBuildPhase(documents: LangiumDocument[], state: DocumentState, cancelToken: CancellationToken): Promise<void>;
    /**
     * Process the document by running precomputations. The default implementation precomputes the scope.
     */
    protected process(document: LangiumDocument, cancelToken: CancellationToken): Promise<void>;
}
//# sourceMappingURL=document-builder.d.ts.map