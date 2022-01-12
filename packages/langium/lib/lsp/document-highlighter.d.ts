/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken, DocumentHighlight, DocumentHighlightKind, DocumentHighlightParams } from 'vscode-languageserver';
import { NameProvider } from '../references/naming';
import { References } from '../references/references';
import { LangiumServices } from '../services';
import { AstNode, CstNode, Reference } from '../syntax-tree';
import { MaybePromise } from '../utils/promise-util';
import { LangiumDocument } from '../workspace/documents';
export interface DocumentHighlighter {
    /**
     * Handle a document highlight request.
     *
     * @throws `OperationCancelled` if cancellation is detected during execution
     * @throws `ResponseError` if an error is detected that should be sent as response to the client
     */
    findHighlights(document: LangiumDocument, params: DocumentHighlightParams, cancelToken?: CancellationToken): MaybePromise<DocumentHighlight[] | undefined>;
}
export declare class DefaultDocumentHighlighter implements DocumentHighlighter {
    protected readonly references: References;
    protected readonly nameProvider: NameProvider;
    constructor(services: LangiumServices);
    findHighlights(document: LangiumDocument, params: DocumentHighlightParams): MaybePromise<DocumentHighlight[] | undefined>;
    protected findNameNode(node: AstNode): CstNode | undefined;
    /**
     * Override this method to determine the highlight kind of the given CST node.
     */
    protected getHighlightKind(node: CstNode, reference?: Reference<AstNode>): DocumentHighlightKind;
}
//# sourceMappingURL=document-highlighter.d.ts.map