/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken, Range, RenameParams, TextDocumentPositionParams, WorkspaceEdit } from 'vscode-languageserver';
import { Position } from 'vscode-languageserver-textdocument';
import { NameProvider } from '../references/naming';
import { References } from '../references/references';
import { LangiumServices } from '../services';
import { CstNode } from '../syntax-tree';
import { MaybePromise } from '../utils/promise-util';
import { LangiumDocument } from '../workspace/documents';
import { ReferenceFinder } from './reference-finder';
export interface RenameHandler {
    /**
     * Handle a rename request.
     *
     * @throws `OperationCancelled` if cancellation is detected during execution
     * @throws `ResponseError` if an error is detected that should be sent as response to the client
     */
    renameElement(document: LangiumDocument, params: RenameParams, cancelToken?: CancellationToken): MaybePromise<WorkspaceEdit | undefined>;
    /**
     * Handle a prepare rename request.
     *
     * @throws `OperationCancelled` if cancellation is detected during execution
     * @throws `ResponseError` if an error is detected that should be sent as response to the client
     */
    prepareRename(document: LangiumDocument, params: TextDocumentPositionParams, cancelToken?: CancellationToken): MaybePromise<Range | undefined>;
}
export declare class DefaultRenameHandler implements RenameHandler {
    protected readonly referenceFinder: ReferenceFinder;
    protected readonly references: References;
    protected readonly nameProvider: NameProvider;
    constructor(services: LangiumServices);
    renameElement(document: LangiumDocument, params: RenameParams): Promise<WorkspaceEdit | undefined>;
    prepareRename(document: LangiumDocument, params: TextDocumentPositionParams): MaybePromise<Range | undefined>;
    protected renameNodeRange(doc: LangiumDocument, position: Position): Range | undefined;
    protected isNameNode(leafNode: CstNode | undefined): boolean | undefined;
}
//# sourceMappingURL=rename-refactoring.d.ts.map