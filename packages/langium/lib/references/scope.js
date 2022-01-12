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
exports.DefaultScopeComputation = exports.DefaultScopeProvider = exports.EMPTY_SCOPE = exports.SimpleScope = void 0;
const vscode_jsonrpc_1 = require("vscode-jsonrpc");
const ast_util_1 = require("../utils/ast-util");
const collections_1 = require("../utils/collections");
const promise_util_1 = require("../utils/promise-util");
const stream_1 = require("../utils/stream");
class SimpleScope {
    constructor(elements, outerScope, options) {
        this.elements = elements;
        this.outerScope = outerScope;
        this.caseInsensitive = options === null || options === void 0 ? void 0 : options.caseInsensitive;
    }
    getAllElements() {
        if (this.outerScope) {
            return this.elements.concat(this.outerScope.getAllElements());
        }
        else {
            return this.elements;
        }
    }
    getElement(name) {
        const local = this.caseInsensitive
            ? this.elements.find(e => e.name.toLowerCase() === name.toLowerCase())
            : this.elements.find(e => e.name === name);
        if (local) {
            return local;
        }
        if (this.outerScope) {
            return this.outerScope.getElement(name);
        }
        return undefined;
    }
}
exports.SimpleScope = SimpleScope;
exports.EMPTY_SCOPE = {
    getElement() {
        return undefined;
    },
    getAllElements() {
        return stream_1.EMPTY_STREAM;
    }
};
class DefaultScopeProvider {
    constructor(services) {
        this.reflection = services.shared.AstReflection;
        this.indexManager = services.shared.workspace.IndexManager;
    }
    getScope(node, referenceId) {
        const scopes = [];
        const referenceType = this.reflection.getReferenceType(referenceId);
        const precomputed = (0, ast_util_1.getDocument)(node).precomputedScopes;
        if (precomputed) {
            let currentNode = node;
            do {
                const allDescriptions = precomputed.get(currentNode);
                if (allDescriptions.length > 0) {
                    scopes.push((0, stream_1.stream)(allDescriptions).filter(desc => this.reflection.isSubtype(desc.type, referenceType)));
                }
                currentNode = currentNode.$container;
            } while (currentNode);
        }
        let result = this.getGlobalScope(referenceType);
        for (let i = scopes.length - 1; i >= 0; i--) {
            result = this.createScope(scopes[i], result);
        }
        return result;
    }
    /**
     * Create a scope for the given precomputed stream of elements.
     */
    createScope(elements, outerScope) {
        return new SimpleScope(elements, outerScope);
    }
    /**
     * Create a global scope filtered for the given reference type.
     */
    getGlobalScope(referenceType) {
        return new SimpleScope(this.indexManager.allElements(referenceType));
    }
}
exports.DefaultScopeProvider = DefaultScopeProvider;
class DefaultScopeComputation {
    constructor(services) {
        this.nameProvider = services.references.NameProvider;
        this.descriptions = services.index.AstNodeDescriptionProvider;
    }
    computeScope(document, cancelToken = vscode_jsonrpc_1.CancellationToken.None) {
        return __awaiter(this, void 0, void 0, function* () {
            const rootNode = document.parseResult.value;
            const scopes = new collections_1.MultiMap();
            for (const content of (0, ast_util_1.streamAllContents)(rootNode)) {
                (0, promise_util_1.interruptAndCheck)(cancelToken);
                this.processNode(content, document, scopes);
            }
            return scopes;
        });
    }
    processNode({ node }, document, scopes) {
        const container = node.$container;
        if (container) {
            const name = this.nameProvider.getName(node);
            if (name) {
                scopes.add(container, this.descriptions.createDescription(node, name, document));
            }
        }
    }
}
exports.DefaultScopeComputation = DefaultScopeComputation;
//# sourceMappingURL=scope.js.map