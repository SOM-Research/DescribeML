"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHandler = exports.addRenameHandler = exports.addFoldingRangeHandler = exports.addHoverHandler = exports.addDocumentHighlightsHandler = exports.addGotoDefinitionHandler = exports.addDocumentSymbolHandler = exports.addCodeActionHandler = exports.addFindReferencesHandler = exports.addCompletionHandler = exports.addDocumentsHandler = exports.startLanguageServer = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const promise_util_1 = require("../utils/promise-util");
function startLanguageServer(services) {
    const languages = services.ServiceRegistry.all;
    const connection = services.lsp.Connection;
    if (!connection) {
        throw new Error('Starting a language server requires the languageServer.Connection service to be set.');
    }
    connection.onInitialize((params) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const capabilities = params.capabilities;
        const hasWorkspaceFolderCapability = !!((_a = capabilities.workspace) === null || _a === void 0 ? void 0 : _a.workspaceFolders);
        const result = {
            capabilities: {
                textDocumentSync: vscode_languageserver_1.TextDocumentSyncKind.Incremental,
                // Tell the client that this server supports code completion.
                completionProvider: {},
                referencesProvider: {},
                documentSymbolProvider: {},
                definitionProvider: {},
                documentHighlightProvider: {},
                codeActionProvider: languages.some(e => e.lsp.CodeActionProvider !== undefined) ? {} : undefined,
                foldingRangeProvider: {},
                hoverProvider: {},
                renameProvider: {
                    prepareProvider: true
                }
            }
        };
        if (hasWorkspaceFolderCapability) {
            result.capabilities.workspace = {
                workspaceFolders: {
                    supported: true
                }
            };
        }
        if ((_b = params.capabilities.workspace) === null || _b === void 0 ? void 0 : _b.configuration) {
            try {
                if (params.workspaceFolders)
                    yield services.workspace.IndexManager.initializeWorkspace(params.workspaceFolders);
            }
            catch (e) {
                console.error(e);
            }
        }
        return result;
    }));
    const documents = services.workspace.TextDocuments;
    addDocumentsHandler(connection, documents, services);
    addCompletionHandler(connection, services);
    addFindReferencesHandler(connection, services);
    addDocumentSymbolHandler(connection, services);
    addGotoDefinitionHandler(connection, services);
    addDocumentHighlightsHandler(connection, services);
    addFoldingRangeHandler(connection, services);
    addCodeActionHandler(connection, services);
    addRenameHandler(connection, services);
    addHoverHandler(connection, services);
    // Make the text document manager listen on the connection for open, change and close text document events.
    documents.listen(connection);
    // Start listening for incoming messages from the client.
    connection.listen();
}
exports.startLanguageServer = startLanguageServer;
function addDocumentsHandler(connection, documents, services) {
    const documentBuilder = services.workspace.DocumentBuilder;
    let changeTokenSource;
    let changePromise;
    function onDidChange(changed, deleted) {
        return __awaiter(this, void 0, void 0, function* () {
            changeTokenSource === null || changeTokenSource === void 0 ? void 0 : changeTokenSource.cancel();
            if (changePromise) {
                yield changePromise;
            }
            changeTokenSource = (0, promise_util_1.startCancelableOperation)();
            changePromise = documentBuilder
                .update(changed, deleted !== null && deleted !== void 0 ? deleted : [], changeTokenSource.token)
                .catch(err => {
                if (err !== promise_util_1.OperationCancelled) {
                    console.error('Error: ', err);
                }
            });
        });
    }
    documents.onDidChangeContent((change) => __awaiter(this, void 0, void 0, function* () {
        onDidChange([vscode_uri_1.URI.parse(change.document.uri)]);
    }));
    connection.onDidChangeWatchedFiles((params) => __awaiter(this, void 0, void 0, function* () {
        const changedUris = params.changes.filter(e => e.type !== vscode_languageserver_1.FileChangeType.Deleted).map(e => vscode_uri_1.URI.parse(e.uri));
        const deletedUris = params.changes.filter(e => e.type === vscode_languageserver_1.FileChangeType.Deleted).map(e => vscode_uri_1.URI.parse(e.uri));
        onDidChange(changedUris, deletedUris);
    }));
}
exports.addDocumentsHandler = addDocumentsHandler;
function addCompletionHandler(connection, services) {
    connection.onCompletion(createHandler((services, document, params, cancelToken) => {
        return services.lsp.completion.CompletionProvider.getCompletion(document, params, cancelToken);
    }, services));
}
exports.addCompletionHandler = addCompletionHandler;
function addFindReferencesHandler(connection, services) {
    connection.onReferences(createHandler((services, document, params, cancelToken) => services.lsp.ReferenceFinder.findReferences(document, params, cancelToken), services));
}
exports.addFindReferencesHandler = addFindReferencesHandler;
function addCodeActionHandler(connection, services) {
    connection.onCodeAction(createHandler((services, document, params, cancelToken) => { var _a; return (_a = services.lsp.CodeActionProvider) === null || _a === void 0 ? void 0 : _a.getCodeActions(document, params, cancelToken); }, services));
}
exports.addCodeActionHandler = addCodeActionHandler;
function addDocumentSymbolHandler(connection, services) {
    connection.onDocumentSymbol(createHandler((services, document, params, cancelToken) => services.lsp.DocumentSymbolProvider.getSymbols(document, params, cancelToken), services));
}
exports.addDocumentSymbolHandler = addDocumentSymbolHandler;
function addGotoDefinitionHandler(connection, services) {
    connection.onDefinition(createHandler((services, document, params, cancelToken) => services.lsp.GoToResolver.goToDefinition(document, params, cancelToken), services));
}
exports.addGotoDefinitionHandler = addGotoDefinitionHandler;
function addDocumentHighlightsHandler(connection, services) {
    connection.onDocumentHighlight(createHandler((services, document, params, cancelToken) => services.lsp.DocumentHighlighter.findHighlights(document, params, cancelToken), services));
}
exports.addDocumentHighlightsHandler = addDocumentHighlightsHandler;
function addHoverHandler(connection, services) {
    connection.onHover(createHandler((services, document, params, cancelToken) => services.lsp.HoverProvider.getHoverContent(document, params, cancelToken), services));
}
exports.addHoverHandler = addHoverHandler;
function addFoldingRangeHandler(connection, services) {
    connection.onFoldingRanges(createHandler((services, document, params, cancelToken) => services.lsp.FoldingRangeProvider.getFoldingRanges(document, params, cancelToken), services));
}
exports.addFoldingRangeHandler = addFoldingRangeHandler;
function addRenameHandler(connection, services) {
    connection.onRenameRequest(createHandler((services, document, params, cancelToken) => services.lsp.RenameHandler.renameElement(document, params, cancelToken), services));
    connection.onPrepareRename(createHandler((services, document, params, cancelToken) => services.lsp.RenameHandler.prepareRename(document, params, cancelToken), services));
}
exports.addRenameHandler = addRenameHandler;
function createHandler(serviceCall, sharedServices) {
    return (params, cancelToken) => __awaiter(this, void 0, void 0, function* () {
        const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
        const language = sharedServices.ServiceRegistry.getServices(uri);
        if (!language) {
            console.error(`Could not find service instance for uri: '${uri.toString()}'`);
            return null;
        }
        const document = sharedServices.workspace.LangiumDocuments.getOrCreateDocument(uri);
        if (!document) {
            return null;
        }
        try {
            return yield serviceCall(language, document, params, cancelToken);
        }
        catch (err) {
            return responseError(err);
        }
    });
}
exports.createHandler = createHandler;
function responseError(err) {
    if (err === promise_util_1.OperationCancelled) {
        return new vscode_languageserver_1.ResponseError(vscode_languageserver_1.LSPErrorCodes.RequestCancelled, 'The request has been cancelled.');
    }
    if (err instanceof vscode_languageserver_1.ResponseError) {
        return err;
    }
    throw err;
}
//# sourceMappingURL=language-server.js.map