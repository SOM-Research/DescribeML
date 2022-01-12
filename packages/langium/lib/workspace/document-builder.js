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
exports.DefaultDocumentBuilder = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const collections_1 = require("../utils/collections");
const promise_util_1 = require("../utils/promise-util");
const documents_1 = require("./documents");
class DefaultDocumentBuilder {
    constructor(services) {
        this.updateListeners = [];
        this.buildPhaseListeners = new collections_1.MultiMap();
        this.connection = services.lsp.Connection;
        this.langiumDocuments = services.workspace.LangiumDocuments;
        this.indexManager = services.workspace.IndexManager;
        this.serviceRegistry = services.ServiceRegistry;
    }
    build(document, cancelToken = vscode_languageserver_1.CancellationToken.None) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.buildDocuments([document], cancelToken);
            return {
                document,
                diagnostics: yield this.validate(document, cancelToken, true)
            };
        });
    }
    validate(document, cancelToken = vscode_languageserver_1.CancellationToken.None, forceDiagnostics = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let diagnostics = [];
            const validator = this.serviceRegistry.getServices(document.uri).validation.DocumentValidator;
            if (forceDiagnostics || this.shouldValidate(document)) {
                diagnostics = yield validator.validateDocument(document, cancelToken);
                if (this.connection) {
                    // Send the computed diagnostics to VS Code.
                    this.connection.sendDiagnostics({ uri: document.textDocument.uri, diagnostics });
                }
                document.diagnostics = diagnostics;
                document.state = documents_1.DocumentState.Validated;
            }
            return diagnostics;
        });
    }
    /**
     * Determine whether the given document should be validated during a build. The default
     * implementation validates whenever a client connection is available.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldValidate(document) {
        return this.connection !== undefined;
    }
    update(changed, deleted, cancelToken = vscode_languageserver_1.CancellationToken.None) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const deletedDocument of deleted) {
                this.langiumDocuments.invalidateDocument(deletedDocument);
            }
            this.indexManager.remove(deleted);
            for (const changedUri of changed) {
                this.langiumDocuments.invalidateDocument(changedUri);
            }
            for (const listener of this.updateListeners) {
                listener(changed, deleted);
            }
            // Only interrupt execution after everything has been invalidated and update listeners have been notified
            yield (0, promise_util_1.interruptAndCheck)(cancelToken);
            const changedDocuments = changed.map(e => this.langiumDocuments.getOrCreateDocument(e));
            const rebuildDocuments = this.collectDocuments(changedDocuments, deleted);
            yield this.buildDocuments(rebuildDocuments, cancelToken);
        });
    }
    onUpdate(callback) {
        this.updateListeners.push(callback);
    }
    collectDocuments(changed, deleted) {
        const allUris = changed.map(e => e.uri).concat(deleted);
        const affected = this.indexManager.getAffectedDocuments(allUris).toArray();
        affected.forEach(e => {
            const linker = this.serviceRegistry.getServices(e.uri).references.Linker;
            linker.unlink(e);
            e.state = documents_1.DocumentState.Indexed;
        });
        const docSet = new Set([
            ...changed,
            ...affected,
            // Also include all documents haven't completed the document lifecycle yet
            ...this.langiumDocuments.all.filter(e => e.state < documents_1.DocumentState.Validated)
        ]);
        return Array.from(docSet);
    }
    buildDocuments(documents, cancelToken) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Indexing
            const toBeIndexed = documents.filter(e => e.state < documents_1.DocumentState.Indexed);
            yield this.indexManager.update(toBeIndexed, cancelToken);
            yield this.notifyBuildPhase(toBeIndexed, documents_1.DocumentState.Indexed, cancelToken);
            // 2. Preprocessing
            yield this.runCancelable(documents, documents_1.DocumentState.Processed, cancelToken, doc => this.process(doc, cancelToken));
            // 3. Linking
            yield this.runCancelable(documents, documents_1.DocumentState.Linked, cancelToken, doc => this.serviceRegistry.getServices(doc.uri).references.Linker.link(doc, cancelToken));
            // 4. Validation
            yield this.runCancelable(documents, documents_1.DocumentState.Validated, cancelToken, doc => this.validate(doc, cancelToken));
        });
    }
    runCancelable(documents, targetState, cancelToken, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const filtered = documents.filter(e => e.state < targetState);
            for (const document of filtered) {
                yield (0, promise_util_1.interruptAndCheck)(cancelToken);
                yield callback(document);
            }
            yield this.notifyBuildPhase(filtered, targetState, cancelToken);
        });
    }
    onBuildPhase(targetState, callback) {
        this.buildPhaseListeners.add(targetState, callback);
    }
    notifyBuildPhase(documents, state, cancelToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const listeners = this.buildPhaseListeners.get(state);
            for (const listener of listeners) {
                yield (0, promise_util_1.interruptAndCheck)(cancelToken);
                yield listener(documents, cancelToken);
            }
        });
    }
    /**
     * Process the document by running precomputations. The default implementation precomputes the scope.
     */
    process(document, cancelToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const scopeComputation = this.serviceRegistry.getServices(document.uri).references.ScopeComputation;
            document.precomputedScopes = yield scopeComputation.computeScope(document, cancelToken);
            document.state = documents_1.DocumentState.Processed;
        });
    }
}
exports.DefaultDocumentBuilder = DefaultDocumentBuilder;
//# sourceMappingURL=document-builder.js.map