/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { DefaultFoldingRangeProvider } from '../../lsp/folding-range-provider';
import { AstNode } from '../../syntax-tree';
/**
 * A specialized folding range provider for the grammar language
 */
export declare class LangiumGrammarFoldingRangeProvider extends DefaultFoldingRangeProvider {
    shouldProcessContent(node: AstNode): boolean;
}
//# sourceMappingURL=langium-grammar-folding-range-provider.d.ts.map