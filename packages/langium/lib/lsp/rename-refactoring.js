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
exports.DefaultRenameHandler = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const naming_1 = require("../references/naming");
const ast_util_1 = require("../utils/ast-util");
class DefaultRenameHandler {
    constructor(services) {
        this.referenceFinder = services.lsp.ReferenceFinder;
        this.references = services.references.References;
        this.nameProvider = services.references.NameProvider;
    }
    renameElement(document, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const changes = {};
            const references = yield this.referenceFinder.findReferences(document, Object.assign(Object.assign({}, params), { context: { includeDeclaration: true } }));
            if (!Array.isArray(references)) {
                return undefined;
            }
            references.forEach(location => {
                const change = vscode_languageserver_1.TextEdit.replace(location.range, params.newName);
                if (changes[location.uri]) {
                    changes[location.uri].push(change);
                }
                else {
                    changes[location.uri] = [change];
                }
            });
            return { changes };
        });
    }
    prepareRename(document, params) {
        return this.renameNodeRange(document, params.position);
    }
    renameNodeRange(doc, position) {
        const rootNode = doc.parseResult.value.$cstNode;
        const offset = doc.textDocument.offsetAt(position);
        if (rootNode && offset) {
            const leafNode = (0, ast_util_1.findLeafNodeAtOffset)(rootNode, offset);
            if (!leafNode) {
                return undefined;
            }
            const isCrossRef = this.references.findDeclaration(leafNode);
            // return range if selected CstNode is the name node or it is a crosslink which points to a declaration
            if (isCrossRef || this.isNameNode(leafNode)) {
                return leafNode.range;
            }
        }
        return undefined;
    }
    isNameNode(leafNode) {
        return (leafNode === null || leafNode === void 0 ? void 0 : leafNode.element) && (0, naming_1.isNamed)(leafNode.element) && leafNode === this.nameProvider.getNameNode(leafNode.element);
    }
}
exports.DefaultRenameHandler = DefaultRenameHandler;
//# sourceMappingURL=rename-refactoring.js.map