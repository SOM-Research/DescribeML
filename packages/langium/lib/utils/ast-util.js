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
exports.findLocalReferences = exports.findLeafNodeAtOffset = exports.resolveAllReferences = exports.streamReferences = exports.streamAllContents = exports.streamContents = exports.getDocument = exports.hasContainerOfType = exports.getContainerOfType = exports.isLinkingError = exports.isAstNodeDescription = exports.isReference = exports.isAstNode = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const cst_node_builder_1 = require("../parser/cst-node-builder");
const stream_1 = require("../utils/stream");
const promise_util_1 = require("./promise-util");
function isAstNode(obj) {
    return typeof obj === 'object' && obj !== null && typeof obj.$type === 'string';
}
exports.isAstNode = isAstNode;
function isReference(obj) {
    return typeof obj === 'object' && obj !== null && typeof obj.$refText === 'string';
}
exports.isReference = isReference;
function isAstNodeDescription(obj) {
    return typeof obj === 'object' && obj !== null
        && typeof obj.name === 'string'
        && typeof obj.type === 'string'
        && typeof obj.path === 'string';
}
exports.isAstNodeDescription = isAstNodeDescription;
function isLinkingError(obj) {
    return typeof obj === 'object' && obj !== null
        && isAstNode(obj.container)
        && isReference(obj.reference)
        && typeof obj.message === 'string';
}
exports.isLinkingError = isLinkingError;
function getContainerOfType(node, typePredicate) {
    let item = node;
    while (item) {
        if (typePredicate(item)) {
            return item;
        }
        item = item.$container;
    }
    return undefined;
}
exports.getContainerOfType = getContainerOfType;
function hasContainerOfType(node, predicate) {
    let item = node;
    while (item) {
        if (predicate(item)) {
            return true;
        }
        item = item.$container;
    }
    return false;
}
exports.hasContainerOfType = hasContainerOfType;
function getDocument(node) {
    let n = node;
    while (!n.$document && n.$container) {
        n = n.$container;
    }
    if (!n.$document) {
        throw new Error('AST node has no document.');
    }
    return n.$document;
}
exports.getDocument = getDocument;
function streamContents(node) {
    return new stream_1.StreamImpl(() => ({
        keys: Object.keys(node),
        keyIndex: 0,
        arrayIndex: 0
    }), state => {
        while (state.keyIndex < state.keys.length) {
            const property = state.keys[state.keyIndex];
            if (!property.startsWith('$')) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const value = node[property];
                if (isAstNode(value)) {
                    state.keyIndex++;
                    return { done: false, value: { node: value, property } };
                }
                else if (Array.isArray(value)) {
                    while (state.arrayIndex < value.length) {
                        const index = state.arrayIndex++;
                        const element = value[index];
                        if (isAstNode(element)) {
                            return { done: false, value: { node: element, property, index } };
                        }
                    }
                    state.arrayIndex = 0;
                }
            }
            state.keyIndex++;
        }
        return stream_1.DONE_RESULT;
    });
}
exports.streamContents = streamContents;
function streamAllContents(node) {
    const root = { node };
    return new stream_1.TreeStreamImpl(root, content => streamContents(content.node));
}
exports.streamAllContents = streamAllContents;
function streamReferences(node) {
    return new stream_1.StreamImpl(() => ({
        keys: Object.keys(node),
        keyIndex: 0,
        arrayIndex: 0
    }), state => {
        while (state.keyIndex < state.keys.length) {
            const property = state.keys[state.keyIndex];
            if (!property.startsWith('$')) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const value = node[property];
                if (isReference(value)) {
                    state.keyIndex++;
                    return { done: false, value: { reference: value, container: node, property } };
                }
                else if (Array.isArray(value)) {
                    while (state.arrayIndex < value.length) {
                        const index = state.arrayIndex++;
                        const element = value[index];
                        if (isReference(element)) {
                            return { done: false, value: { reference: element, container: node, property, index } };
                        }
                    }
                    state.arrayIndex = 0;
                }
            }
            state.keyIndex++;
        }
        return stream_1.DONE_RESULT;
    });
}
exports.streamReferences = streamReferences;
function resolveAllReferences(node, cancelToken = vscode_languageserver_1.CancellationToken.None) {
    return __awaiter(this, void 0, void 0, function* () {
        const process = (n) => {
            streamReferences(n.node).forEach(r => {
                r.reference.ref; // Invoke the getter to link the target AstNode
            });
        };
        process({ node });
        for (const content of streamAllContents(node)) {
            yield (0, promise_util_1.interruptAndCheck)(cancelToken);
            process(content);
        }
    });
}
exports.resolveAllReferences = resolveAllReferences;
function findLeafNodeAtOffset(node, offset) {
    if (node instanceof cst_node_builder_1.LeafCstNodeImpl) {
        return node;
    }
    else if (node instanceof cst_node_builder_1.CompositeCstNodeImpl) {
        const children = node.children.filter(e => e.offset <= offset).reverse();
        for (const child of children) {
            const result = findLeafNodeAtOffset(child, offset);
            if (result) {
                return result;
            }
        }
    }
    return undefined;
}
exports.findLeafNodeAtOffset = findLeafNodeAtOffset;
/**
 * Returns a Stream of references to the target node from the AstNode tree
 *
 * @param targetNode AstNode we are looking for
 * @param lookup AstNode where we search for references. If not provided, the root node of the document is used as the default value
 */
function findLocalReferences(targetNode, lookup = getDocument(targetNode).parseResult.value) {
    const refs = [];
    const process = (node) => {
        streamReferences(node).forEach(refInfo => {
            if (refInfo.reference.ref === targetNode) {
                refs.push(refInfo.reference);
            }
        });
    };
    process(lookup);
    streamAllContents(lookup).forEach(content => process(content.node));
    return (0, stream_1.stream)(refs);
}
exports.findLocalReferences = findLocalReferences;
//# sourceMappingURL=ast-util.js.map