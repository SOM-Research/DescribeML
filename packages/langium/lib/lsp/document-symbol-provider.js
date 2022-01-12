"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultDocumentSymbolProvider = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const ast_util_1 = require("../utils/ast-util");
class DefaultDocumentSymbolProvider {
    constructor(services) {
        this.nameProvider = services.references.NameProvider;
    }
    getSymbols(document) {
        return this.getSymbol(document, document.parseResult.value);
    }
    getSymbol(document, astNode) {
        const node = astNode.$cstNode;
        const nameNode = this.nameProvider.getNameNode(astNode);
        if (nameNode && node) {
            const name = this.nameProvider.getName(astNode);
            return [{
                    kind: this.getSymbolKind(astNode.$type),
                    name: name !== null && name !== void 0 ? name : nameNode.text,
                    range: node.range,
                    selectionRange: nameNode.range,
                    children: this.getChildSymbols(document, astNode)
                }];
        }
        else {
            return this.getChildSymbols(document, astNode) || [];
        }
    }
    getChildSymbols(document, astNode) {
        const children = [];
        for (const child of (0, ast_util_1.streamContents)(astNode)) {
            const result = this.getSymbol(document, child.node);
            children.push(...result);
        }
        if (children.length > 0) {
            return children;
        }
        return undefined;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getSymbolKind(type) {
        return vscode_languageserver_1.SymbolKind.Field;
    }
}
exports.DefaultDocumentSymbolProvider = DefaultDocumentSymbolProvider;
//# sourceMappingURL=document-symbol-provider.js.map