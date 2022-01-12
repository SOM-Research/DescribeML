/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken, DocumentSymbol, DocumentSymbolParams, SymbolKind } from 'vscode-languageserver';
import { NameProvider } from '../references/naming';
import { LangiumServices } from '../services';
import { AstNode } from '../syntax-tree';
import { MaybePromise } from '../utils/promise-util';
import { LangiumDocument } from '../workspace/documents';
export interface DocumentSymbolProvider {
    /**
     * Handle a document symbols request.
     *
     * @throws `OperationCancelled` if cancellation is detected during execution
     * @throws `ResponseError` if an error is detected that should be sent as response to the client
     */
    getSymbols(document: LangiumDocument, params: DocumentSymbolParams, cancelToken?: CancellationToken): MaybePromise<DocumentSymbol[]>;
}
export declare class DefaultDocumentSymbolProvider implements DocumentSymbolProvider {
    protected readonly nameProvider: NameProvider;
    constructor(services: LangiumServices);
    getSymbols(document: LangiumDocument): MaybePromise<DocumentSymbol[]>;
    protected getSymbol(document: LangiumDocument, astNode: AstNode): DocumentSymbol[];
    protected getChildSymbols(document: LangiumDocument, astNode: AstNode): DocumentSymbol[] | undefined;
    protected getSymbolKind(type: string): SymbolKind;
}
//# sourceMappingURL=document-symbol-provider.d.ts.map