/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken, Connection, HandlerResult, RequestHandler, TextDocumentIdentifier, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LangiumServices, LangiumSharedServices } from '../services';
import { LangiumDocument } from '../workspace/documents';
export declare function startLanguageServer(services: LangiumSharedServices): void;
export declare function addDocumentsHandler(connection: Connection, documents: TextDocuments<TextDocument>, services: LangiumSharedServices): void;
export declare function addCompletionHandler(connection: Connection, services: LangiumSharedServices): void;
export declare function addFindReferencesHandler(connection: Connection, services: LangiumSharedServices): void;
export declare function addCodeActionHandler(connection: Connection, services: LangiumSharedServices): void;
export declare function addDocumentSymbolHandler(connection: Connection, services: LangiumSharedServices): void;
export declare function addGotoDefinitionHandler(connection: Connection, services: LangiumSharedServices): void;
export declare function addDocumentHighlightsHandler(connection: Connection, services: LangiumSharedServices): void;
export declare function addHoverHandler(connection: Connection, services: LangiumSharedServices): void;
export declare function addFoldingRangeHandler(connection: Connection, services: LangiumSharedServices): void;
export declare function addRenameHandler(connection: Connection, services: LangiumSharedServices): void;
export declare function createHandler<P extends {
    textDocument: TextDocumentIdentifier;
}, R, E = void>(serviceCall: (services: LangiumServices, document: LangiumDocument, params: P, cancelToken: CancellationToken) => HandlerResult<R, E>, sharedServices: LangiumSharedServices): RequestHandler<P, R | null, E>;
//# sourceMappingURL=language-server.d.ts.map