"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultDocumentHighlighter = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const ast_util_1 = require("../utils/ast-util");
class DefaultDocumentHighlighter {
    constructor(services) {
        this.references = services.references.References;
        this.nameProvider = services.references.NameProvider;
    }
    findHighlights(document, params) {
        var _a;
        const rootNode = document.parseResult.value.$cstNode;
        if (!rootNode) {
            return undefined;
        }
        const selectedNode = (0, ast_util_1.findLeafNodeAtOffset)(rootNode, document.textDocument.offsetAt(params.position));
        if (!selectedNode) {
            return undefined;
        }
        const targetAstNode = (_a = this.references.findDeclaration(selectedNode)) === null || _a === void 0 ? void 0 : _a.element;
        if (targetAstNode) {
            const refs = [];
            if ((0, ast_util_1.getDocument)(targetAstNode).uri.toString() === document.uri.toString()) {
                const nameNode = this.findNameNode(targetAstNode);
                if (nameNode) {
                    refs.push([nameNode, this.getHighlightKind(nameNode)]);
                }
            }
            (0, ast_util_1.findLocalReferences)(targetAstNode, rootNode.element).forEach(ref => {
                refs.push([ref.$refNode, this.getHighlightKind(ref.$refNode, ref)]);
            });
            return refs.map(([node, kind]) => vscode_languageserver_1.DocumentHighlight.create(node.range, kind));
        }
        return undefined;
    }
    findNameNode(node) {
        const nameNode = this.nameProvider.getNameNode(node);
        if (nameNode)
            return nameNode;
        return node.$cstNode;
    }
    /**
     * Override this method to determine the highlight kind of the given CST node.
     */
    getHighlightKind(node, reference) {
        if (reference) {
            return vscode_languageserver_1.DocumentHighlightKind.Read;
        }
        else {
            return vscode_languageserver_1.DocumentHighlightKind.Text;
        }
    }
}
exports.DefaultDocumentHighlighter = DefaultDocumentHighlighter;
//# sourceMappingURL=document-highlighter.js.map