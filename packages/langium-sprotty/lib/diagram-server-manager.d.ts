/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken, Connection } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { ActionMessage, DiagramOptions, DiagramServer } from 'sprotty-protocol';
import { LangiumDocument, ServiceRegistry } from 'langium';
import { LangiumSprottySharedServices } from './sprotty-services';
/**
 * A `DiagramServer` instance can handle exactly one client diagram. The host application
 * can open multiple diagrams with different IDs. This service manages the `DiagramServer`
 * instances, creating one instance for each received `clientId` and discarding it when the
 * client closes the respective diagram.
 */
export interface DiagramServerManager {
    /**
     * Called when an action message is sent from the client to the server.
     */
    acceptAction(message: ActionMessage): Promise<void>;
    /**
     * The client application notified closing of a specific diagram client.
     */
    removeClient(clientId: string): void;
}
export declare class DefaultDiagramServerManager implements DiagramServerManager {
    protected readonly connection?: Connection;
    protected readonly serviceRegistry: ServiceRegistry;
    protected readonly diagramServerFactory: (clientId: string, options?: DiagramOptions) => DiagramServer;
    protected readonly diagramServerMap: Map<string, DiagramServer>;
    private changedUris;
    private outdatedDocuments;
    constructor(services: LangiumSprottySharedServices);
    /**
     * Listen to incoming document change notifications and keep track of such changed documents.
     */
    protected documentsUpdated(changed: URI[], deleted: URI[]): void;
    /**
     * Listen to completed builds and trigger diagram updates accordingly.
     */
    protected documentsBuilt(built: LangiumDocument[], cancelToken: CancellationToken): Promise<void>;
    protected updateDiagrams(documents: Map<LangiumDocument, DiagramServer>, cancelToken: CancellationToken): Promise<void>;
    acceptAction({ clientId, action }: ActionMessage): Promise<void>;
    removeClient(clientId: string): void;
}
//# sourceMappingURL=diagram-server-manager.d.ts.map