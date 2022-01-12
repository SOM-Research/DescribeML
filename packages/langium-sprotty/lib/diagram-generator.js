"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdCacheImpl = exports.LangiumDiagramGenerator = void 0;
const vscode_uri_1 = require("vscode-uri");
const vscode_languageserver_1 = require("vscode-languageserver");
/**
 * Abstract superclass for diagram model generators.
 */
class LangiumDiagramGenerator {
    constructor(services) {
        this.langiumDocuments = services.shared.workspace.LangiumDocuments;
    }
    /**
     * Builds a `GeneratorContext` and calls `generateRoot` with it.
     */
    generate(args) {
        if (!args.document) {
            const sourceUri = args.options.sourceUri;
            if (!sourceUri) {
                return Promise.reject("Missing 'sourceUri' option in request.");
            }
            args.document = this.langiumDocuments.getOrCreateDocument(vscode_uri_1.URI.parse(sourceUri));
        }
        if (!args.cancelToken) {
            args.cancelToken = vscode_languageserver_1.CancellationToken.None;
        }
        if (!args.idCache) {
            args.idCache = new IdCacheImpl();
        }
        return this.generateRoot(args);
    }
}
exports.LangiumDiagramGenerator = LangiumDiagramGenerator;
class IdCacheImpl {
    constructor() {
        this.id2element = new Map();
        this.element2id = new Map();
        this.otherIds = new Set();
    }
    uniqueId(idProposal, element) {
        let proposedId = idProposal;
        let count = 0;
        do {
            proposedId = count === 0 ? idProposal : idProposal + count;
            if (element && this.id2element.get(proposedId) === element) {
                return proposedId;
            }
            count++;
        } while (this.isIdAlreadyUsed(proposedId));
        if (element) {
            this.id2element.set(proposedId, element);
            this.element2id.set(element, proposedId);
        }
        else {
            this.otherIds.add(proposedId);
        }
        return proposedId;
    }
    isIdAlreadyUsed(id) {
        return this.id2element.has(id) || this.otherIds.has(id);
    }
    getId(element) {
        if (!element) {
            return undefined;
        }
        return this.element2id.get(element);
    }
}
exports.IdCacheImpl = IdCacheImpl;
//# sourceMappingURL=diagram-generator.js.map