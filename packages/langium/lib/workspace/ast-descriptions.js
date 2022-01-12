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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultReferenceDescriptionProvider = exports.DefaultAstNodeDescriptionProvider = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const linker_1 = require("../references/linker");
const ast_util_1 = require("../utils/ast-util");
const cst_util_1 = require("../utils/cst-util");
const promise_util_1 = require("../utils/promise-util");
class DefaultAstNodeDescriptionProvider {
    constructor(services) {
        this.astNodeLocator = services.index.AstNodeLocator;
        this.nameProvider = services.references.NameProvider;
    }
    createDescription(node, name, document) {
        return {
            node,
            name,
            type: node.$type,
            documentUri: document.uri,
            path: this.astNodeLocator.getAstNodePath(node)
        };
    }
    createDescriptions(document, cancelToken = vscode_languageserver_1.CancellationToken.None) {
        return __awaiter(this, void 0, void 0, function* () {
            const descr = [];
            const rootNode = document.parseResult.value;
            const name = this.nameProvider.getName(rootNode);
            if (name) {
                descr.push(this.createDescription(rootNode, name, document));
            }
            for (const content of (0, ast_util_1.streamContents)(rootNode)) {
                yield (0, promise_util_1.interruptAndCheck)(cancelToken);
                const name = this.nameProvider.getName(content.node);
                if (name) {
                    descr.push(this.createDescription(content.node, name, document));
                }
            }
            return descr;
        });
    }
}
exports.DefaultAstNodeDescriptionProvider = DefaultAstNodeDescriptionProvider;
class DefaultReferenceDescriptionProvider {
    constructor(services) {
        this.linker = services.references.Linker;
        this.nodeLocator = services.index.AstNodeLocator;
    }
    createDescriptions(document, cancelToken = vscode_languageserver_1.CancellationToken.None) {
        return __awaiter(this, void 0, void 0, function* () {
            const descr = [];
            const rootNode = document.parseResult.value;
            const refConverter = (refInfo) => {
                const refAstNodeDescr = this.linker.getCandidate(refInfo.container, (0, linker_1.getReferenceId)(refInfo.container.$type, refInfo.property), refInfo.reference);
                // Do not handle unresolved refs
                if ((0, ast_util_1.isLinkingError)(refAstNodeDescr))
                    return undefined;
                const doc = (0, ast_util_1.getDocument)(refInfo.container);
                const docUri = doc.uri;
                const refCstNode = refInfo.reference.$refNode;
                return {
                    sourceUri: docUri,
                    sourcePath: this.nodeLocator.getAstNodePath(refInfo.container),
                    targetUri: refAstNodeDescr.documentUri,
                    targetPath: refAstNodeDescr.path,
                    segment: (0, cst_util_1.toDocumentSegment)(refCstNode),
                    local: refAstNodeDescr.documentUri.toString() === docUri.toString()
                };
            };
            for (const astNodeContent of (0, ast_util_1.streamAllContents)(rootNode)) {
                yield (0, promise_util_1.interruptAndCheck)(cancelToken);
                const astNode = astNodeContent.node;
                (0, ast_util_1.streamReferences)(astNode).forEach(ref => {
                    const refDescr = refConverter(ref);
                    if (refDescr)
                        descr.push(refDescr);
                });
            }
            return descr;
        });
    }
}
exports.DefaultReferenceDescriptionProvider = DefaultReferenceDescriptionProvider;
//# sourceMappingURL=ast-descriptions.js.map