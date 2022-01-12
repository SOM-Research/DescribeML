"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultSharedModule = exports.createDefaultModule = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const grammar_config_1 = require("./grammar/grammar-config");
const completion_provider_1 = require("./lsp/completion/completion-provider");
const rule_interpreter_1 = require("./lsp/completion/rule-interpreter");
const document_highlighter_1 = require("./lsp/document-highlighter");
const document_symbol_provider_1 = require("./lsp/document-symbol-provider");
const folding_range_provider_1 = require("./lsp/folding-range-provider");
const goto_1 = require("./lsp/goto");
const hover_provider_1 = require("./lsp/hover-provider");
const reference_finder_1 = require("./lsp/reference-finder");
const rename_refactoring_1 = require("./lsp/rename-refactoring");
const langium_parser_builder_1 = require("./parser/langium-parser-builder");
const token_builder_1 = require("./parser/token-builder");
const value_converter_1 = require("./parser/value-converter");
const linker_1 = require("./references/linker");
const naming_1 = require("./references/naming");
const references_1 = require("./references/references");
const scope_1 = require("./references/scope");
const json_serializer_1 = require("./serializer/json-serializer");
const service_registry_1 = require("./service-registry");
const document_validator_1 = require("./validation/document-validator");
const validation_registry_1 = require("./validation/validation-registry");
const ast_descriptions_1 = require("./workspace/ast-descriptions");
const ast_node_locator_1 = require("./workspace/ast-node-locator");
const document_builder_1 = require("./workspace/document-builder");
const documents_1 = require("./workspace/documents");
const index_manager_1 = require("./workspace/index-manager");
/**
 * Create a dependency injection module for the default language-specific services. This is a
 * set of services that are used by exactly one language.
 */
function createDefaultModule(context) {
    return {
        parser: {
            GrammarConfig: (services) => (0, grammar_config_1.createGrammarConfig)(services),
            LangiumParser: (services) => (0, langium_parser_builder_1.createLangiumParser)(services),
            ValueConverter: () => new value_converter_1.DefaultValueConverter(),
            TokenBuilder: () => new token_builder_1.DefaultTokenBuilder()
        },
        lsp: {
            completion: {
                CompletionProvider: (services) => new completion_provider_1.DefaultCompletionProvider(services),
                RuleInterpreter: () => new rule_interpreter_1.RuleInterpreter()
            },
            DocumentSymbolProvider: (services) => new document_symbol_provider_1.DefaultDocumentSymbolProvider(services),
            HoverProvider: (services) => new hover_provider_1.MultilineCommentHoverProvider(services),
            FoldingRangeProvider: (services) => new folding_range_provider_1.DefaultFoldingRangeProvider(services),
            ReferenceFinder: (services) => new reference_finder_1.DefaultReferenceFinder(services),
            GoToResolver: (services) => new goto_1.DefaultGoToResolverProvider(services),
            DocumentHighlighter: (services) => new document_highlighter_1.DefaultDocumentHighlighter(services),
            RenameHandler: (services) => new rename_refactoring_1.DefaultRenameHandler(services)
        },
        index: {
            AstNodeLocator: () => new ast_node_locator_1.DefaultAstNodeLocator(),
            AstNodeDescriptionProvider: (services) => new ast_descriptions_1.DefaultAstNodeDescriptionProvider(services),
            ReferenceDescriptionProvider: (services) => new ast_descriptions_1.DefaultReferenceDescriptionProvider(services)
        },
        references: {
            Linker: (services) => new linker_1.DefaultLinker(services),
            NameProvider: () => new naming_1.DefaultNameProvider(),
            ScopeProvider: (services) => new scope_1.DefaultScopeProvider(services),
            ScopeComputation: (services) => new scope_1.DefaultScopeComputation(services),
            References: (services) => new references_1.DefaultReferences(services)
        },
        serializer: {
            JsonSerializer: (services) => new json_serializer_1.DefaultJsonSerializer(services)
        },
        validation: {
            DocumentValidator: (services) => new document_validator_1.DefaultDocumentValidator(services),
            ValidationRegistry: (services) => new validation_registry_1.ValidationRegistry(services)
        },
        shared: () => context.shared
    };
}
exports.createDefaultModule = createDefaultModule;
/**
 * Create a dependency injection module for the default shared services. This is the set of
 * services that are shared between multiple languages.
 */
function createDefaultSharedModule(context = {}) {
    return {
        ServiceRegistry: () => new service_registry_1.DefaultServiceRegistry(),
        lsp: {
            Connection: () => context.connection
        },
        workspace: {
            LangiumDocuments: (services) => new documents_1.DefaultLangiumDocuments(services),
            LangiumDocumentFactory: (services) => new documents_1.DefaultLangiumDocumentFactory(services),
            DocumentBuilder: (services) => new document_builder_1.DefaultDocumentBuilder(services),
            TextDocuments: () => new vscode_languageserver_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument),
            TextDocumentFactory: (services) => new documents_1.DefaultTextDocumentFactory(services),
            IndexManager: (services) => new index_manager_1.DefaultIndexManager(services)
        }
    };
}
exports.createDefaultSharedModule = createDefaultSharedModule;
//# sourceMappingURL=default-module.js.map