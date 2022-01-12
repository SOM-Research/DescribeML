"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCommentNode = exports.findRelevantNode = exports.toDocumentSegment = exports.tokenToRange = exports.flatten = exports.streamCst = void 0;
const cst_node_builder_1 = require("../parser/cst-node-builder");
const langium_parser_1 = require("../parser/langium-parser");
const stream_1 = require("./stream");
function streamCst(node) {
    return new stream_1.TreeStreamImpl(node, element => {
        if (element instanceof cst_node_builder_1.CompositeCstNodeImpl) {
            return element.children;
        }
        else {
            return [];
        }
    });
}
exports.streamCst = streamCst;
function flatten(node) {
    if (node instanceof cst_node_builder_1.LeafCstNodeImpl) {
        return [node];
    }
    else if (node instanceof cst_node_builder_1.CompositeCstNodeImpl) {
        return node.children.flatMap(e => flatten(e));
    }
    else {
        return [];
    }
}
exports.flatten = flatten;
function tokenToRange(token) {
    // Chevrotain uses 1-based indices everywhere
    // So we subtract 1 from every value to align with the LSP
    return {
        start: {
            character: token.startColumn - 1,
            line: token.startLine - 1
        },
        end: {
            character: token.endColumn,
            line: token.endLine - 1
        }
    };
}
exports.tokenToRange = tokenToRange;
function toDocumentSegment(node) {
    const { offset, end, range } = node;
    return {
        range,
        offset,
        end,
        length: end - offset
    };
}
exports.toDocumentSegment = toDocumentSegment;
function findRelevantNode(cstNode) {
    let n = cstNode;
    do {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const element = n.element;
        if (element.$type !== langium_parser_1.DatatypeSymbol) {
            return element;
        }
        n = n.parent;
    } while (n);
    return undefined;
}
exports.findRelevantNode = findRelevantNode;
function findCommentNode(cstNode, commentNames) {
    let lastNode;
    if (cstNode instanceof cst_node_builder_1.CompositeCstNodeImpl) {
        for (const node of cstNode.children) {
            if (!node.hidden) {
                break;
            }
            if (node instanceof cst_node_builder_1.LeafCstNodeImpl && commentNames.includes(node.tokenType.name)) {
                lastNode = node;
            }
        }
    }
    return lastNode;
}
exports.findCommentNode = findCommentNode;
//# sourceMappingURL=cst-util.js.map