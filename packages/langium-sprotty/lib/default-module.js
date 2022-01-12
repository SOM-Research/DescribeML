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
exports.SprottySharedModule = exports.defaultDiagramServerFactory = void 0;
const sprotty_protocol_1 = require("sprotty-protocol");
const diagram_server_manager_1 = require("./diagram-server-manager");
const lsp_1 = require("./lsp");
const vscode_uri_1 = require("vscode-uri");
const defaultDiagramServerFactory = (services) => {
    const connection = services.lsp.Connection;
    const serviceRegistry = services.ServiceRegistry;
    return (clientId, options) => {
        const sourceUri = options === null || options === void 0 ? void 0 : options.sourceUri;
        if (!sourceUri) {
            throw new Error("Missing 'sourceUri' option in request.");
        }
        const language = serviceRegistry.getServices(vscode_uri_1.URI.parse(sourceUri));
        if (!language.diagram) {
            throw new Error(`The '${language.LanguageMetaData.languageId}' language does not support diagrams.`);
        }
        return new sprotty_protocol_1.DiagramServer((action) => __awaiter(void 0, void 0, void 0, function* () {
            connection === null || connection === void 0 ? void 0 : connection.sendNotification(lsp_1.DiagramActionNotification.type, { clientId, action });
        }), language.diagram);
    };
};
exports.defaultDiagramServerFactory = defaultDiagramServerFactory;
/**
 * Default implementations of shared services for the integration of Langium and Sprotty.
 */
exports.SprottySharedModule = {
    diagram: {
        diagramServerFactory: exports.defaultDiagramServerFactory,
        DiagramServerManager: services => new diagram_server_manager_1.DefaultDiagramServerManager(services)
    }
};
//# sourceMappingURL=default-module.js.map