"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultIndexManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const ast_util_1 = require("../utils/ast-util");
const promise_util_1 = require("../utils/promise-util");
const stream_1 = require("../utils/stream");
const documents_1 = require("./documents");
class DefaultIndexManager {
    constructor(services) {
        this.simpleIndex = new Map();
        this.referenceIndex = new Map();
        this.globalScopeCache = new Map();
        this.serviceRegistry = services.ServiceRegistry;
        this.astReflection = services.AstReflection;
        this.langiumDocuments = () => services.workspace.LangiumDocuments;
    }
    findAllReferences(targetNode, astNodePath) {
        const targetDocUri = (0, ast_util_1.getDocument)(targetNode).uri;
        const result = [];
        this.referenceIndex.forEach((docRefs) => {
            docRefs.forEach((refDescr) => {
                if (refDescr.targetUri.toString() === targetDocUri.toString() && refDescr.targetPath === astNodePath) {
                    result.push(refDescr);
                }
            });
        });
        return (0, stream_1.stream)(result);
    }
    allElements(nodeType = '') {
        if (!this.globalScopeCache.has('')) {
            this.globalScopeCache.set('', Array.from(this.simpleIndex.values()).flat());
        }
        const cached = this.globalScopeCache.get(nodeType);
        if (cached) {
            return (0, stream_1.stream)(cached);
        }
        else {
            const elements = this.globalScopeCache.get('').filter(e => this.astReflection.isSubtype(e.type, nodeType));
            this.globalScopeCache.set(nodeType, elements);
            return (0, stream_1.stream)(elements);
        }
    }
    remove(uris) {
        for (const uri of uris) {
            const uriString = uri.toString();
            this.simpleIndex.delete(uriString);
            this.referenceIndex.delete(uriString);
        }
    }
    update(documents, cancelToken = vscode_languageserver_1.CancellationToken.None) {
        return this.processDocuments(documents, cancelToken);
    }
    getAffectedDocuments(uris) {
        return this.langiumDocuments().all.filter(e => {
            if (uris.some(uri => e.uri.toString() === uri.toString())) {
                return false;
            }
            for (const uri of uris) {
                if (this.isAffected(e, uri)) {
                    return true;
                }
            }
            return false;
        });
    }
    /**
     * Determine whether the given document could be affected by a change of the document
     * identified by the given URI (second parameter).
     */
    isAffected(document, changed) {
        const changedUriString = changed.toString();
        const documentUri = document.uri.toString();
        // The document is affected if it contains linking errors
        if (document.references.some(e => e.error)) {
            return true;
        }
        const references = this.referenceIndex.get(documentUri);
        // ...or if it contains a reference to the changed file
        if (references) {
            return references.filter(e => !e.local).some(e => e.targetUri.toString() === changedUriString);
        }
        return false;
    }
    initializeWorkspace(folders) {
        return __awaiter(this, void 0, void 0, function* () {
            const documents = [];
            const allFileExtensions = this.serviceRegistry.all.flatMap(e => e.LanguageMetaData.fileExtensions);
            const fileFilter = (uri) => allFileExtensions.includes(path_1.default.extname(uri.path));
            const collector = (document) => documents.push(document);
            yield Promise.all(folders.map(folder => this.getRootFolder(folder))
                .map((folderPath) => __awaiter(this, void 0, void 0, function* () { return this.traverseFolder(folderPath, fileFilter, collector); })));
            yield this.loadAdditionalDocuments(folders, collector);
            yield this.processDocuments(documents);
        });
    }
    /**
     * Load all additional documents that shall be visible in the context of the given workspace
     * folders and add them to the acceptor. This can be used to include built-in libraries of
     * your language, which can be either loaded from provided files or constructed in memory.
     */
    loadAdditionalDocuments(_folders, _acceptor) {
        return Promise.resolve();
    }
    /**
     * Determine the root folder of the source documents in the given workspace folder.
     * The default implementation returns the URI of the workspace folder, but you can override
     * this to return a subfolder like `src` instead.
     */
    getRootFolder(folder) {
        return vscode_uri_1.URI.parse(folder.uri);
    }
    /**
     * Traverse the file system folder identified by the given URI and its subFolders. All
     * contained files that match the filter are added to the acceptor.
     */
    traverseFolder(folderPath, fileFilter, acceptor) {
        return __awaiter(this, void 0, void 0, function* () {
            const fsPath = folderPath.fsPath;
            if (!fs_1.default.existsSync(fsPath)) {
                console.error(`File ${folderPath} doesn't exist.`);
                return;
            }
            if (this.skipFolder(folderPath)) {
                return;
            }
            const subFolders = yield fs_1.default.promises.readdir(fsPath, { withFileTypes: true });
            for (const dir of subFolders) {
                const uri = vscode_uri_1.URI.file(path_1.default.resolve(fsPath, dir.name));
                if (dir.isDirectory()) {
                    yield this.traverseFolder(uri, fileFilter, acceptor);
                }
                else if (fileFilter(uri)) {
                    const document = this.langiumDocuments().getOrCreateDocument(uri);
                    acceptor(document);
                }
            }
        });
    }
    /**
     * Determine whether the folder with the given path shall be skipped while indexing the workspace.
     */
    skipFolder(folderPath) {
        const base = vscode_uri_1.Utils.basename(folderPath);
        return base.startsWith('.') || base === 'node_modules' || base === 'out';
    }
    processDocuments(documents, cancelToken = vscode_languageserver_1.CancellationToken.None) {
        return __awaiter(this, void 0, void 0, function* () {
            this.globalScopeCache.clear();
            // first: build exported object data
            for (const document of documents) {
                const services = this.serviceRegistry.getServices(document.uri);
                const indexData = yield services.index.AstNodeDescriptionProvider.createDescriptions(document, cancelToken);
                for (const data of indexData) {
                    data.node = undefined; // clear reference to the AST Node
                }
                this.simpleIndex.set(document.textDocument.uri, indexData);
                yield (0, promise_util_1.interruptAndCheck)(cancelToken);
            }
            // second: create reference descriptions
            for (const document of documents) {
                const services = this.serviceRegistry.getServices(document.uri);
                this.referenceIndex.set(document.textDocument.uri, yield services.index.ReferenceDescriptionProvider.createDescriptions(document, cancelToken));
                yield (0, promise_util_1.interruptAndCheck)(cancelToken);
                document.state = documents_1.DocumentState.Indexed;
            }
        });
    }
}
exports.DefaultIndexManager = DefaultIndexManager;
//# sourceMappingURL=index-manager.js.map