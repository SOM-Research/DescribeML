/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { DefaultSharedModuleContext } from '../default-module';
import { Module } from '../dependency-injection';
import { LangiumServices, LangiumSharedServices, PartialLangiumServices } from '../services';
import { LangiumGrammarValidator } from './langium-grammar-validator';
export declare type LangiumGrammarAddedServices = {
    validation: {
        LangiumGrammarValidator: LangiumGrammarValidator;
    };
};
export declare type LangiumGrammarServices = LangiumServices & LangiumGrammarAddedServices;
export declare const LangiumGrammarModule: Module<LangiumGrammarServices, PartialLangiumServices & LangiumGrammarAddedServices>;
export declare function createLangiumGrammarServices(context?: DefaultSharedModuleContext): {
    shared: LangiumSharedServices;
    grammar: LangiumGrammarServices;
};
//# sourceMappingURL=langium-grammar-module.d.ts.map