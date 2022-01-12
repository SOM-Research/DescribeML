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
exports.DefaultLinker = exports.getReferenceProperty = exports.getReferenceId = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const ast_util_1 = require("../utils/ast-util");
const promise_util_1 = require("../utils/promise-util");
const documents_1 = require("../workspace/documents");
function getReferenceId(containerTypeName, propertyName) {
    return `${containerTypeName}:${propertyName}`;
}
exports.getReferenceId = getReferenceId;
function getReferenceProperty(referenceId) {
    return referenceId.substring(referenceId.indexOf(':') + 1);
}
exports.getReferenceProperty = getReferenceProperty;
class DefaultLinker {
    constructor(services) {
        this.reflection = services.shared.AstReflection;
        this.langiumDocuments = () => services.shared.workspace.LangiumDocuments;
        this.scopeProvider = services.references.ScopeProvider;
        this.astNodeLocator = services.index.AstNodeLocator;
    }
    link(document, cancelToken = vscode_languageserver_1.CancellationToken.None) {
        return __awaiter(this, void 0, void 0, function* () {
            const process = (node) => {
                (0, ast_util_1.streamReferences)(node).forEach(ref => this.doLink(ref, document));
            };
            const rootNode = document.parseResult.value;
            process(rootNode);
            for (const content of (0, ast_util_1.streamAllContents)(rootNode)) {
                yield (0, promise_util_1.interruptAndCheck)(cancelToken);
                process(content.node);
            }
            document.state = documents_1.DocumentState.Linked;
        });
    }
    doLink(info, document) {
        const ref = info.reference;
        // The reference may already have been resolved lazily by accessing its `ref` property.
        if (ref._ref === undefined) {
            try {
                const refId = getReferenceId(info.container.$type, info.property);
                const description = this.getCandidate(info.container, refId, ref);
                if (!(0, ast_util_1.isLinkingError)(description) && this.langiumDocuments().hasDocument(description.documentUri)) {
                    // The target document is already loaded
                    const linkedNode = this.loadAstNode(description);
                    ref._ref = linkedNode !== null && linkedNode !== void 0 ? linkedNode : this.createLinkingError(info, refId, description);
                }
                else {
                    // The target document is not loaded yet, or the target was not found in the scope
                    ref._ref = description;
                }
            }
            catch (err) {
                ref._ref = Object.assign(Object.assign({}, info), { message: `An error occurred while resolving reference to '${ref.$refText}': ${err}` });
            }
        }
        // Add the reference to the document's array of references
        document.references.push(ref);
    }
    unlink(document) {
        for (const ref of document.references) {
            delete ref._ref;
        }
        document.references = [];
    }
    getCandidate(container, refId, reference) {
        const scope = this.scopeProvider.getScope(container, refId);
        const description = scope.getElement(reference.$refText);
        return description !== null && description !== void 0 ? description : this.createLinkingError({ container, property: getReferenceProperty(refId), reference }, refId);
    }
    buildReference(node, refNode, refId, refText) {
        // See behavior description in doc of Linker, update that on changes in here.
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const linker = this;
        const reference = {
            $refNode: refNode,
            $refText: refText,
            get ref() {
                if ((0, ast_util_1.isAstNode)(this._ref)) {
                    // Most frequent case: the target is aready resolved.
                    return this._ref;
                }
                else if (this._ref === undefined) {
                    // The reference has not been linked yet, so do that now.
                    this._ref = linker.getLinkedNode(node, refId, reference);
                }
                else if ((0, ast_util_1.isAstNodeDescription)(this._ref)) {
                    // A candidate has been found before, but it is not loaded yet.
                    const linkedNode = linker.loadAstNode(this._ref);
                    this._ref = linkedNode !== null && linkedNode !== void 0 ? linkedNode : linker.createLinkingError({ container: node, property: getReferenceProperty(refId), reference }, refId, this._ref);
                }
                return (0, ast_util_1.isAstNode)(this._ref) ? this._ref : undefined;
            },
            get error() {
                return (0, ast_util_1.isLinkingError)(this._ref) ? this._ref : undefined;
            }
        };
        return reference;
    }
    getLinkedNode(container, refId, reference) {
        try {
            const description = this.getCandidate(container, refId, reference);
            if ((0, ast_util_1.isLinkingError)(description)) {
                return description;
            }
            else {
                const linkedNode = this.loadAstNode(description);
                return linkedNode !== null && linkedNode !== void 0 ? linkedNode : this.createLinkingError({ container, property: getReferenceProperty(refId), reference }, refId, description);
            }
        }
        catch (err) {
            return {
                container,
                property: getReferenceProperty(refId),
                reference,
                message: `An error occurred while resolving reference to '${reference.$refText}': ${err}`
            };
        }
    }
    loadAstNode(nodeDescription) {
        if (nodeDescription.node) {
            return nodeDescription.node;
        }
        const doc = this.langiumDocuments().getOrCreateDocument(nodeDescription.documentUri);
        return this.astNodeLocator.getAstNode(doc, nodeDescription.path);
    }
    createLinkingError(refInfo, refId, targetDescription) {
        const referenceType = this.reflection.getReferenceType(refId);
        return Object.assign(Object.assign({}, refInfo), { message: `Could not resolve reference to ${referenceType} named '${refInfo.reference.$refText}'.`, targetDescription });
    }
}
exports.DefaultLinker = DefaultLinker;
//# sourceMappingURL=linker.js.map