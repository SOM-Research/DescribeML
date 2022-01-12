"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDiagramHandler = exports.DiagramDidCloseNotification = exports.DiagramActionNotification = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const langium_1 = require("langium");
var DiagramActionNotification;
(function (DiagramActionNotification) {
    DiagramActionNotification.type = new vscode_languageserver_1.NotificationType('diagram/accept');
})(DiagramActionNotification = exports.DiagramActionNotification || (exports.DiagramActionNotification = {}));
var DiagramDidCloseNotification;
(function (DiagramDidCloseNotification) {
    DiagramDidCloseNotification.type = new vscode_languageserver_1.NotificationType('diagram/didClose');
})(DiagramDidCloseNotification = exports.DiagramDidCloseNotification || (exports.DiagramDidCloseNotification = {}));
/**
 * Adds JSON-RPC handlers for `DiagramActionNotification` and `DiagramDidCloseNotification` received
 * from the client.
 */
function addDiagramHandler(connection, services) {
    const diagramServerManager = services.diagram.DiagramServerManager;
    connection.onNotification(DiagramActionNotification.type, message => {
        diagramServerManager.acceptAction(message)
            .catch(err => {
            if (err !== langium_1.OperationCancelled) {
                console.error('Error: ', err);
            }
        });
    });
    connection.onNotification(DiagramDidCloseNotification.type, clientId => {
        diagramServerManager.removeClient(clientId);
    });
}
exports.addDiagramHandler = addDiagramHandler;
//# sourceMappingURL=lsp.js.map