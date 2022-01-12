/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { Connection, NotificationType } from 'vscode-languageserver';
import { ActionMessage } from 'sprotty-protocol';
import { LangiumSprottySharedServices } from './sprotty-services';
export declare namespace DiagramActionNotification {
    const type: NotificationType<ActionMessage>;
}
export declare namespace DiagramDidCloseNotification {
    const type: NotificationType<string>;
}
/**
 * Adds JSON-RPC handlers for `DiagramActionNotification` and `DiagramDidCloseNotification` received
 * from the client.
 */
export declare function addDiagramHandler(connection: Connection, services: LangiumSprottySharedServices): void;
//# sourceMappingURL=lsp.d.ts.map