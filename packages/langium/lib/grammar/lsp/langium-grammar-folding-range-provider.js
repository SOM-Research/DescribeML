"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangiumGrammarFoldingRangeProvider = void 0;
const folding_range_provider_1 = require("../../lsp/folding-range-provider");
const ast_1 = require("../generated/ast");
/**
 * A specialized folding range provider for the grammar language
 */
class LangiumGrammarFoldingRangeProvider extends folding_range_provider_1.DefaultFoldingRangeProvider {
    shouldProcessContent(node) {
        // Exclude parser rules from folding
        return !(0, ast_1.isParserRule)(node);
    }
}
exports.LangiumGrammarFoldingRangeProvider = LangiumGrammarFoldingRangeProvider;
//# sourceMappingURL=langium-grammar-folding-range-provider.js.map