"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultGoToResolverProvider = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const ast_util_1 = require("../utils/ast-util");
class DefaultGoToResolverProvider {
    constructor(services) {
        this.nameProvider = services.references.NameProvider;
        this.references = services.references.References;
    }
    goToDefinition(document, params) {
        const rootNode = document.parseResult.value;
        const targetCstNodes = [];
        if (rootNode.$cstNode) {
            const cst = rootNode.$cstNode;
            const sourceCstNode = (0, ast_util_1.findLeafNodeAtOffset)(cst, document.textDocument.offsetAt(params.position));
            if (sourceCstNode) {
                const targetNode = this.references.findDeclaration(sourceCstNode);
                if (targetNode === null || targetNode === void 0 ? void 0 : targetNode.element) {
                    const targetDoc = (0, ast_util_1.getDocument)(targetNode === null || targetNode === void 0 ? void 0 : targetNode.element);
                    if (targetNode && targetDoc) {
                        targetCstNodes.push({ source: sourceCstNode, target: targetNode, targetDocument: targetDoc });
                    }
                }
            }
        }
        return targetCstNodes.map(link => {
            var _a;
            return vscode_languageserver_1.LocationLink.create(link.targetDocument.textDocument.uri, ((_a = this.findActualNodeFor(link.target)) !== null && _a !== void 0 ? _a : link.target).range, link.target.range, link.source.range);
        });
    }
    findActualNodeFor(cstNode) {
        var _a;
        let actualNode = cstNode;
        while (!((_a = actualNode === null || actualNode === void 0 ? void 0 : actualNode.element) === null || _a === void 0 ? void 0 : _a.$cstNode)) {
            if (!actualNode)
                return undefined;
            actualNode = actualNode.parent;
        }
        return actualNode.element.$cstNode;
    }
}
exports.DefaultGoToResolverProvider = DefaultGoToResolverProvider;
//# sourceMappingURL=goto.js.map