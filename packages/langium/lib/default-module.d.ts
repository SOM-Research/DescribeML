/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { Connection } from 'vscode-languageserver';
import { Module } from './dependency-injection';
import { LangiumDefaultServices, LangiumDefaultSharedServices, LangiumServices, LangiumSharedServices } from './services';
/**
 * Context required for creating the default language-specific dependency injection module.
 */
export interface DefaultModuleContext {
    shared: LangiumSharedServices;
}
/**
 * Create a dependency injection module for the default language-specific services. This is a
 * set of services that are used by exactly one language.
 */
export declare function createDefaultModule(context: DefaultModuleContext): Module<LangiumServices, LangiumDefaultServices>;
/**
 * Context required for creating the default shared dependeny injection module.
 */
export interface DefaultSharedModuleContext {
    connection?: Connection;
}
/**
 * Create a dependency injection module for the default shared services. This is the set of
 * services that are shared between multiple languages.
 */
export declare function createDefaultSharedModule(context?: DefaultSharedModuleContext): Module<LangiumSharedServices, LangiumDefaultSharedServices>;
//# sourceMappingURL=default-module.d.ts.map