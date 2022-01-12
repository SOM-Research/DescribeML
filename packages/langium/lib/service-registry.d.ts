/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { URI } from 'vscode-uri';
import { LangiumServices } from './services';
/**
 * The service registry provides access to the language-specific services. These are resolved
 * via the URI of a text document.
 */
export interface ServiceRegistry {
    /**
     * Register a language via its injected services.
     */
    register(language: LangiumServices): void;
    /**
     * Retrieve the language-specific services for the given URI. In case only one language is
     * registered, it may be used regardless of the URI format.
     */
    getServices(uri: URI): LangiumServices;
    /**
     * The full set of registered language services.
     */
    readonly all: readonly LangiumServices[];
}
export declare class DefaultServiceRegistry implements ServiceRegistry {
    protected singleton?: LangiumServices;
    protected map?: Record<string, LangiumServices>;
    register(language: LangiumServices): void;
    getServices(uri: URI): LangiumServices;
    get all(): readonly LangiumServices[];
}
//# sourceMappingURL=service-registry.d.ts.map