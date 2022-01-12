"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultReferenceFinder = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const ast_util_1 = require("../utils/ast-util");
const cst_util_1 = require("../utils/cst-util");
class DefaultReferenceFinder {
    constructor(services) {
        this.nameProvider = services.references.NameProvider;
        this.references = services.references.References;
    }
    findReferences(document, params) {
        var _a;
        const rootNode = document.parseResult.value.$cstNode;
        if (!rootNode) {
            return [];
        }
        const refs = [];
        const selectedNode = (0, ast_util_1.findLeafNodeAtOffset)(rootNode, document.textDocument.offsetAt(params.position));
        if (!selectedNode) {
            return [];
        }
        const targetAstNode = (_a = this.references.findDeclaration(selectedNode)) === null || _a === void 0 ? void 0 : _a.element;
        if (targetAstNode) {
            if (params.context.includeDeclaration) {
                const declDoc = (0, ast_util_1.getDocument)(targetAstNode);
                const nameNode = this.findNameNode(targetAstNode, selectedNode.text);
                if (nameNode)
                    refs.push({ docUri: declDoc.uri, range: nameNode.range });
            }
            this.references.findReferences(targetAstNode).forEach(reference => {
                if ((0, ast_util_1.isReference)(reference)) {
                    refs.push({ docUri: document.uri, range: reference.$refNode.range });
                }
                else {
                    const range = reference.segment.range;
                    refs.push({ docUri: reference.sourceUri, range });
                }
            });
        }
        return refs.map(ref => vscode_languageserver_1.Location.create(ref.docUri.toString(), ref.range));
    }
    findNameNode(node, name) {
        const nameNode = this.nameProvider.getNameNode(node);
        if (nameNode)
            return nameNode;
        if (node.$cstNode) {
            // try find first leaf with name as text
            const leafNode = (0, cst_util_1.flatten)(node.$cstNode).find((n) => n.text === name);
            if (leafNode)
                return leafNode;
        }
        return node.$cstNode;
    }
}
exports.DefaultReferenceFinder = DefaultReferenceFinder;
//# sourceMappingURL=reference-finder.js.map