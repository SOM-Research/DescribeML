/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { Module } from 'langium';
import { DiagramOptions, DiagramServer } from 'sprotty-protocol';
import { LangiumSprottySharedServices, SprottySharedServices } from './sprotty-services';
export declare const defaultDiagramServerFactory: (services: LangiumSprottySharedServices) => (clientId: string, options?: import("sprotty-protocol").JsonMap | undefined) => DiagramServer;
/**
 * Default implementations of shared services for the integration of Langium and Sprotty.
 */
export declare const SprottySharedModule: Module<LangiumSprottySharedServices, SprottySharedServices>;
//# sourceMappingURL=default-module.d.ts.map