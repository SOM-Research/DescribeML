/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { Range, TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic, TextDocuments } from 'vscode-languageserver/node';
import { URI } from 'vscode-uri';
import { ParseResult } from '../parser/langium-parser';
import { ServiceRegistry } from '../service-registry';
import type { LangiumSharedServices } from '../services';
import type { AstNode, AstNodeDescription, Reference } from '../syntax-tree';
import { MultiMap } from '../utils/collections';
import { Stream } from '../utils/stream';
/**
 * A Langium document holds the parse result (AST and CST) and any additional state that is derived
 * from the AST, e.g. the result of scope precomputation.
 */
export interface LangiumDocument<T extends AstNode = AstNode> {
    /** The Uniform Resource Identifier (URI) of the document */
    uri: URI;
    /** The text document used to convert between offsets and positions */
    textDocument: TextDocument;
    /** The current state of the document */
    state: DocumentState;
    /** The parse result holds the Abstract Syntax Tree (AST) and potentially also parser / lexer errors */
    parseResult: ParseResult<T>;
    /** Result of the scope precomputation phase */
    precomputedScopes?: PrecomputedScopes;
    /** An array of all cross-references found in the AST while linking */
    references: Reference[];
    /** Result of the validation phase */
    diagnostics?: Diagnostic[];
}
/**
 * A document is subject to several phases that are run in predefined order. Any state value implies that
 * smaller state values are finished as well.
 */
export declare enum DocumentState {
    /** The text content has changed and needs to be parsed again. */
    Changed = 0,
    /** An AST has been created from the text content. */
    Parsed = 1,
    /** The `IndexManager` service has processed this document. */
    Indexed = 2,
    /** Pre-processing steps such as scope precomputation have been executed. */
    Processed = 3,
    /** The `Linker` service has processed this document. */
    Linked = 4,
    /** The `DocumentValidator` service has processed this document. */
    Validated = 5
}
/**
 * Result of the scope precomputation phase (`ScopeComputation` service).
 * It maps every AST node to the set of symbols that are visible in the subtree of that node.
 */
export declare type PrecomputedScopes = MultiMap<AstNode, AstNodeDescription>;
export interface DocumentSegment {
    readonly range: Range;
    readonly offset: number;
    readonly length: number;
    readonly end: number;
}
export declare function equalURI(uri1: URI, uri2: URI): boolean;
/**
 * Shared service for creating `TextDocument` instances.
 */
export interface TextDocumentFactory {
    fromUri(uri: URI): TextDocument;
}
export declare class DefaultTextDocumentFactory implements TextDocumentFactory {
    protected readonly serviceRegistry: ServiceRegistry;
    constructor(services: LangiumSharedServices);
    fromUri(uri: URI): TextDocument;
    protected getContent(uri: URI): string;
}
/**
 * Shared service for creating `LangiumDocument` instances.
 */
export interface LangiumDocumentFactory {
    /**
     * Create a Langium document from a `TextDocument` (usually associated with a file).
     */
    fromTextDocument<T extends AstNode = AstNode>(textDocument: TextDocument, uri?: URI): LangiumDocument<T>;
    /**
     * Create an Langium document from an in-memory string.
     */
    fromString<T extends AstNode = AstNode>(text: string, uri: URI): LangiumDocument<T>;
    /**
     * Create an Langium document from a model that has been constructed in memory.
     */
    fromModel<T extends AstNode = AstNode>(model: T, uri: URI): LangiumDocument<T>;
}
export declare class DefaultLangiumDocumentFactory implements LangiumDocumentFactory {
    protected readonly serviceRegistry: ServiceRegistry;
    constructor(services: LangiumSharedServices);
    fromTextDocument<T extends AstNode = AstNode>(textDocument: TextDocument, uri?: URI): LangiumDocument<T>;
    fromString<T extends AstNode = AstNode>(text: string, uri: URI): LangiumDocument<T>;
    fromModel<T extends AstNode = AstNode>(model: T, uri: URI): LangiumDocument<T>;
    protected create<T extends AstNode>(textDocument: TextDocument | undefined, text: string | undefined, model: T | undefined, uri: URI | undefined): LangiumDocument<T>;
}
/**
 * Convert a TextDocument and a ParseResult into a LangiumDocument.
 */
export declare function documentFromText<T extends AstNode = AstNode>(textDocument: TextDocument, parseResult: ParseResult<T>, uri?: URI): LangiumDocument<T>;
/**
 * Shared service that manages Langium documents.
 */
export interface LangiumDocuments {
    /**
     * A stream of all documents managed under this service.
     */
    readonly all: Stream<LangiumDocument>;
    /**
     * Manage a new document under this service.
     * @throws an error if a document with the same URI is already present.
     */
    addDocument(document: LangiumDocument): void;
    /**
     * Retrieve the document with the given URI, if present. Otherwise create a new document
     * and add it to the managed documents.
     */
    getOrCreateDocument(uri: URI): LangiumDocument;
    /**
     * Returns `true` if a document with the given URI is managed under this service.
     */
    hasDocument(uri: URI): boolean;
    /**
     * Remove the document with the given URI, if present, and mark it as `Changed`, meaning
     * that its content is no longer valid. The next call to `getOrCreateDocument` with the same
     * URI will create a new document instance.
     */
    invalidateDocument(uri: URI): void;
}
export declare class DefaultLangiumDocuments implements LangiumDocuments {
    protected readonly documentMap: Map<string, LangiumDocument>;
    protected readonly textDocuments: TextDocuments<TextDocument>;
    protected readonly textDocumentFactory: TextDocumentFactory;
    protected readonly langiumDocumentFactory: LangiumDocumentFactory;
    constructor(services: LangiumSharedServices);
    get all(): Stream<LangiumDocument>;
    addDocument(document: LangiumDocument): void;
    getOrCreateDocument(uri: URI): LangiumDocument;
    hasDocument(uri: URI): boolean;
    invalidateDocument(uri: URI): void;
}
//# sourceMappingURL=documents.d.ts.map