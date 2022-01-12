"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLangiumGrammarServices = exports.LangiumGrammarModule = void 0;
const default_module_1 = require("../default-module");
const dependency_injection_1 = require("../dependency-injection");
const module_1 = require("./generated/module");
const langium_grammar_code_actions_1 = require("./langium-grammar-code-actions");
const langium_grammar_validator_1 = require("./langium-grammar-validator");
const langium_grammar_folding_range_provider_1 = require("./lsp/langium-grammar-folding-range-provider");
exports.LangiumGrammarModule = {
    validation: {
        ValidationRegistry: (services) => new langium_grammar_validator_1.LangiumGrammarValidationRegistry(services),
        LangiumGrammarValidator: (services) => new langium_grammar_validator_1.LangiumGrammarValidator(services)
    },
    lsp: {
        FoldingRangeProvider: (services) => new langium_grammar_folding_range_provider_1.LangiumGrammarFoldingRangeProvider(services),
        CodeActionProvider: () => new langium_grammar_code_actions_1.LangiumGrammarCodeActionProvider()
    }
};
function createLangiumGrammarServices(context) {
    const shared = (0, dependency_injection_1.inject)((0, default_module_1.createDefaultSharedModule)(context), module_1.LangiumGrammarGeneratedSharedModule);
    const grammar = (0, dependency_injection_1.inject)((0, default_module_1.createDefaultModule)({ shared }), module_1.LangiumGrammarGeneratedModule, exports.LangiumGrammarModule);
    shared.ServiceRegistry.register(grammar);
    return { shared, grammar };
}
exports.createLangiumGrammarServices = createLangiumGrammarServices;
//# sourceMappingURL=langium-grammar-module.js.map