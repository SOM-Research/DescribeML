/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CompletionItem, DocumentSymbol } from 'vscode-languageserver';
import { LangiumServices } from '../services';
import { AstNode } from '../syntax-tree';
import { BuildResult } from '../workspace/document-builder';
import { LangiumDocument } from '../workspace/documents';
export declare function parseHelper<T extends AstNode = AstNode>(services: LangiumServices): (input: string) => Promise<BuildResult<T>>;
export declare type ExpectFunction = (actual: unknown, expected: unknown) => void;
export interface ExpectedBase {
    text: string;
    indexMarker?: string;
    rangeStartMarker?: string;
    rangeEndMarker?: string;
}
export interface ExpectedSymbols extends ExpectedBase {
    expectedSymbols: DocumentSymbol[];
}
export declare function expectSymbols(services: LangiumServices, expectEqual: ExpectFunction): (input: ExpectedSymbols) => Promise<void>;
export declare function expectFoldings(services: LangiumServices, expectEqual: ExpectFunction): (input: ExpectedBase) => Promise<void>;
export interface ExpectedCompletion extends ExpectedBase {
    index: number;
    expectedItems: Array<string | CompletionItem>;
}
export declare function expectCompletion(services: LangiumServices, expectEqual: ExpectFunction): (completion: ExpectedCompletion) => Promise<void>;
export interface ExpectedGoToDefinition extends ExpectedBase {
    index: number;
    rangeIndex: number;
}
export declare function expectGoToDefinition(services: LangiumServices, expectEqual: ExpectFunction): (expectedGoToDefinition: ExpectedGoToDefinition) => Promise<void>;
export interface ExpectedHover extends ExpectedBase {
    index: number;
    hover?: string;
}
export declare function expectHover(services: LangiumServices, cb: ExpectFunction): (expectedHover: ExpectedHover) => Promise<void>;
export declare function parseDocument<T extends AstNode = AstNode>(services: LangiumServices, input: string): Promise<LangiumDocument<T>>;
//# sourceMappingURL=langium-test.d.ts.map