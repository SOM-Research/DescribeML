"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultFoldingRangeProvider = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const cst_node_builder_1 = require("../parser/cst-node-builder");
const ast_util_1 = require("../utils/ast-util");
const cst_util_1 = require("../utils/cst-util");
class DefaultFoldingRangeProvider {
    constructor(services) {
        this.commentNames = services.parser.GrammarConfig.multilineCommentRules;
    }
    getFoldingRanges(document) {
        const foldings = [];
        const acceptor = (foldingRange) => foldings.push(foldingRange);
        this.collectFolding(document, acceptor);
        return foldings;
    }
    collectFolding(document, acceptor) {
        var _a;
        const root = (_a = document.parseResult) === null || _a === void 0 ? void 0 : _a.value;
        if (root) {
            if (this.shouldProcessContent(root)) {
                const treeIterator = (0, ast_util_1.streamAllContents)(root).iterator();
                let result;
                do {
                    result = treeIterator.next();
                    if (!result.done) {
                        const node = result.value.node;
                        if (this.shouldProcess(node)) {
                            this.collectObjectFolding(document, node, acceptor);
                        }
                        if (!this.shouldProcessContent(node)) {
                            treeIterator.prune();
                        }
                    }
                } while (!result.done);
            }
            this.collectCommentFolding(document, root, acceptor);
        }
    }
    /**
     * Template method to determine whether the specified `AstNode` should be handled by the folding range provider.
     * Returns true by default for all nodes. Returning false only ignores the specified node and not its content.
     * To ignore the content of a node use `shouldProcessContent`.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldProcess(node) {
        return true;
    }
    /**
     * Template method to determine whether the content/children of the specified `AstNode` should be handled by the folding range provider.
     * Returns true by default for all nodes. Returning false ignores _all_ content of this node, even transitive ones.
     * For more precise control over foldings use the `shouldProcess` method.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldProcessContent(node) {
        return true;
    }
    collectObjectFolding(document, node, acceptor) {
        const cstNode = node.$cstNode;
        if (cstNode) {
            const foldingRange = this.toFoldingRange(document, cstNode);
            if (foldingRange) {
                acceptor(foldingRange);
            }
        }
    }
    collectCommentFolding(document, node, acceptor) {
        const cstNode = node.$cstNode;
        if (cstNode) {
            for (const node of (0, cst_util_1.streamCst)(cstNode)) {
                if (node instanceof cst_node_builder_1.LeafCstNodeImpl && this.commentNames.includes(node.tokenType.name)) {
                    const foldingRange = this.toFoldingRange(document, node, vscode_languageserver_1.FoldingRangeKind.Comment);
                    if (foldingRange) {
                        acceptor(foldingRange);
                    }
                }
            }
        }
    }
    toFoldingRange(document, node, kind) {
        const range = node.range;
        const start = range.start;
        let end = range.end;
        // Don't generate foldings for nodes that are less than 3 lines
        if (end.line - start.line < 2) {
            return undefined;
        }
        // As we don't want to hide the end token like 'if { ... --> } <--',
        // we simply select the end of the previous line as the end position
        if (!this.includeLastFoldingLine(node, kind)) {
            end = document.textDocument.positionAt(document.textDocument.offsetAt({ line: end.line, character: 0 }) - 1);
        }
        return vscode_languageserver_1.FoldingRange.create(start.line, end.line, start.character, end.character, kind);
    }
    /**
     * Template method to determine whether the folding range for this cst node should include its last line.
     * Returns false by default for ast nodes which end in braces and for comments.
     */
    includeLastFoldingLine(node, kind) {
        if (kind === vscode_languageserver_1.FoldingRangeKind.Comment) {
            return false;
        }
        const nodeText = node.text;
        const endChar = nodeText.charAt(nodeText.length - 1);
        if (endChar === '}' || endChar === ')' || endChar === ']') {
            return false;
        }
        return true;
    }
}
exports.DefaultFoldingRangeProvider = DefaultFoldingRangeProvider;
//# sourceMappingURL=folding-range-provider.js.map