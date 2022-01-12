"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultLangiumDocuments = exports.documentFromText = exports.DefaultLangiumDocumentFactory = exports.DefaultTextDocumentFactory = exports.equalURI = exports.DocumentState = void 0;
const fs_1 = __importDefault(require("fs"));
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const vscode_uri_1 = require("vscode-uri");
const stream_1 = require("../utils/stream");
/**
 * A document is subject to several phases that are run in predefined order. Any state value implies that
 * smaller state values are finished as well.
 */
var DocumentState;
(function (DocumentState) {
    /** The text content has changed and needs to be parsed again. */
    DocumentState[DocumentState["Changed"] = 0] = "Changed";
    /** An AST has been created from the text content. */
    DocumentState[DocumentState["Parsed"] = 1] = "Parsed";
    /** The `IndexManager` service has processed this document. */
    DocumentState[DocumentState["Indexed"] = 2] = "Indexed";
    /** Pre-processing steps such as scope precomputation have been executed. */
    DocumentState[DocumentState["Processed"] = 3] = "Processed";
    /** The `Linker` service has processed this document. */
    DocumentState[DocumentState["Linked"] = 4] = "Linked";
    /** The `DocumentValidator` service has processed this document. */
    DocumentState[DocumentState["Validated"] = 5] = "Validated";
})(DocumentState = exports.DocumentState || (exports.DocumentState = {}));
function equalURI(uri1, uri2) {
    return uri1.toString() === uri2.toString();
}
exports.equalURI = equalURI;
class DefaultTextDocumentFactory {
    constructor(services) {
        this.serviceRegistry = services.ServiceRegistry;
    }
    fromUri(uri) {
        const content = this.getContent(uri);
        const services = this.serviceRegistry.getServices(uri);
        return vscode_languageserver_textdocument_1.TextDocument.create(uri.toString(), services.LanguageMetaData.languageId, 0, content);
    }
    getContent(uri) {
        return fs_1.default.readFileSync(uri.fsPath, 'utf-8');
    }
}
exports.DefaultTextDocumentFactory = DefaultTextDocumentFactory;
class DefaultLangiumDocumentFactory {
    constructor(services) {
        this.serviceRegistry = services.ServiceRegistry;
    }
    fromTextDocument(textDocument, uri) {
        return this.create(textDocument, undefined, undefined, uri);
    }
    fromString(text, uri) {
        return this.create(undefined, text, undefined, uri);
    }
    fromModel(model, uri) {
        return this.create(undefined, undefined, model, uri);
    }
    create(textDocument, text, model, uri) {
        if (uri === undefined) {
            uri = vscode_uri_1.URI.parse(textDocument.uri);
        }
        const services = this.serviceRegistry.getServices(uri);
        if (textDocument === undefined) {
            textDocument = vscode_languageserver_textdocument_1.TextDocument.create(uri.toString(), services.LanguageMetaData.languageId, 0, text !== null && text !== void 0 ? text : '');
        }
        let parseResult;
        if (model === undefined) {
            parseResult = services.parser.LangiumParser.parse(textDocument.getText());
        }
        else {
            parseResult = { value: model, parserErrors: [], lexerErrors: [] };
        }
        return documentFromText(textDocument, parseResult, uri);
    }
}
exports.DefaultLangiumDocumentFactory = DefaultLangiumDocumentFactory;
/**
 * Convert a TextDocument and a ParseResult into a LangiumDocument.
 */
function documentFromText(textDocument, parseResult, uri) {
    const doc = {
        parseResult,
        textDocument,
        uri: uri !== null && uri !== void 0 ? uri : vscode_uri_1.URI.parse(textDocument.uri),
        state: DocumentState.Parsed,
        references: []
    };
    parseResult.value.$document = doc;
    return doc;
}
exports.documentFromText = documentFromText;
class DefaultLangiumDocuments {
    constructor(services) {
        this.documentMap = new Map();
        this.textDocuments = services.workspace.TextDocuments;
        this.textDocumentFactory = services.workspace.TextDocumentFactory;
        this.langiumDocumentFactory = services.workspace.LangiumDocumentFactory;
    }
    get all() {
        return (0, stream_1.stream)(this.documentMap.values());
    }
    addDocument(document) {
        const uriString = document.uri.toString();
        if (this.documentMap.has(uriString)) {
            throw new Error(`A document with the URI '${uriString}' is already present.`);
        }
        this.documentMap.set(uriString, document);
    }
    getOrCreateDocument(uri) {
        var _a;
        const uriString = uri.toString();
        let langiumDoc = this.documentMap.get(uriString);
        if (langiumDoc) {
            return langiumDoc;
        }
        const textDoc = (_a = this.textDocuments.get(uriString)) !== null && _a !== void 0 ? _a : this.textDocumentFactory.fromUri(uri);
        langiumDoc = this.langiumDocumentFactory.fromTextDocument(textDoc, uri);
        this.documentMap.set(uriString, langiumDoc);
        return langiumDoc;
    }
    hasDocument(uri) {
        return this.documentMap.has(uri.toString());
    }
    invalidateDocument(uri) {
        const uriString = uri.toString();
        const langiumDoc = this.documentMap.get(uriString);
        if (langiumDoc) {
            langiumDoc.state = DocumentState.Changed;
            this.documentMap.delete(uriString);
        }
    }
}
exports.DefaultLangiumDocuments = DefaultLangiumDocuments;
//# sourceMappingURL=documents.js.map