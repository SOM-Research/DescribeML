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
exports.DefaultDiagramServerManager = void 0;
const sprotty_protocol_1 = require("sprotty-protocol");
const langium_1 = require("langium");
const lsp_1 = require("./lsp");
class DefaultDiagramServerManager {
    constructor(services) {
        this.diagramServerMap = new Map();
        this.changedUris = [];
        this.outdatedDocuments = new Map();
        this.connection = services.lsp.Connection;
        this.serviceRegistry = services.ServiceRegistry;
        this.diagramServerFactory = services.diagram.diagramServerFactory;
        services.workspace.DocumentBuilder.onUpdate((changed, deleted) => this.documentsUpdated(changed, deleted));
        services.workspace.DocumentBuilder.onBuildPhase(langium_1.DocumentState.Validated, (built, ct) => this.documentsBuilt(built, ct));
    }
    /**
     * Listen to incoming document change notifications and keep track of such changed documents.
     */
    documentsUpdated(changed, deleted) {
        this.changedUris.push(...changed);
        deleted.forEach(uri1 => {
            const index = this.changedUris.findIndex(uri2 => (0, langium_1.equalURI)(uri1, uri2));
            if (index >= 0) {
                this.changedUris.splice(index, 1);
            }
        });
    }
    /**
     * Listen to completed builds and trigger diagram updates accordingly.
     */
    documentsBuilt(built, cancelToken) {
        (0, langium_1.stream)(built)
            // Only consider documents that were previously marked as changed
            .filter(doc => this.changedUris.some(uri => (0, langium_1.equalURI)(uri, doc.uri)))
            // Track the document URIs to diagram servers via the `sourceUri` option sent with the `RequestModelAction`
            .map(doc => [
            doc,
            (0, langium_1.stream)(this.diagramServerMap.values()).find(server => { var _a; return doc.uri.toString() === ((_a = server.state.options) === null || _a === void 0 ? void 0 : _a.sourceUri); })
        ])
            .forEach(entry => {
            if (entry[1]) {
                this.outdatedDocuments.set(entry[0], entry[1]);
            }
        });
        this.changedUris = [];
        return this.updateDiagrams(this.outdatedDocuments, cancelToken);
    }
    updateDiagrams(documents, cancelToken) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            while (documents.size > 0) {
                yield (0, langium_1.interruptAndCheck)(cancelToken);
                const [firstEntry] = documents;
                const [document, diagramServer] = firstEntry;
                const language = this.serviceRegistry.getServices(document.uri);
                if (!language.diagram) {
                    throw new Error(`The '${language.LanguageMetaData.languageId}' language does not support diagrams.`);
                }
                const diagramGenerator = language.diagram.DiagramGenerator;
                const model = yield diagramGenerator.generate({
                    document,
                    options: (_a = diagramServer.state.options) !== null && _a !== void 0 ? _a : {},
                    state: diagramServer.state,
                    cancelToken
                });
                // Send a model update without awaiting it (the promise is resolved when the update is finished)
                diagramServer.updateModel(model).catch(err => console.error('Model update failed: ' + err));
                documents.delete(document);
            }
        });
    }
    acceptAction({ clientId, action }) {
        var _a;
        try {
            let diagramServer = this.diagramServerMap.get(clientId);
            if (!diagramServer) {
                const options = action.options;
                diagramServer = this.diagramServerFactory(clientId, options);
                this.diagramServerMap.set(clientId, diagramServer);
            }
            return diagramServer.accept(action);
        }
        catch (err) {
            if (err instanceof Error && (0, sprotty_protocol_1.isRequestAction)(action)) {
                const rejectAction = {
                    kind: sprotty_protocol_1.RejectAction.KIND,
                    responseId: action.requestId,
                    message: err.message,
                    detail: err.stack
                };
                (_a = this.connection) === null || _a === void 0 ? void 0 : _a.sendNotification(lsp_1.DiagramActionNotification.type, { clientId, action: rejectAction });
            }
            return Promise.reject(err);
        }
    }
    removeClient(clientId) {
        this.diagramServerMap.delete(clientId);
    }
}
exports.DefaultDiagramServerManager = DefaultDiagramServerManager;
//# sourceMappingURL=diagram-server-manager.js.map