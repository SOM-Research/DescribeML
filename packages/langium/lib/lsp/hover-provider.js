"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultilineCommentHoverProvider = exports.AstNodeHoverProvider = void 0;
const ast_util_1 = require("../utils/ast-util");
const cst_util_1 = require("../utils/cst-util");
class AstNodeHoverProvider {
    constructor(services) {
        this.references = services.references.References;
    }
    getHoverContent(document, params) {
        var _a, _b;
        const rootNode = (_b = (_a = document.parseResult) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.$cstNode;
        if (rootNode) {
            const offset = document.textDocument.offsetAt(params.position);
            const cstNode = (0, ast_util_1.findLeafNodeAtOffset)(rootNode, offset);
            if (cstNode && cstNode.offset + cstNode.length > offset) {
                const targetNode = this.references.findDeclaration(cstNode);
                if (targetNode) {
                    return this.getAstNodeHoverContent(targetNode.element);
                }
            }
        }
        return undefined;
    }
}
exports.AstNodeHoverProvider = AstNodeHoverProvider;
class MultilineCommentHoverProvider extends AstNodeHoverProvider {
    constructor(services) {
        super(services);
        this.commentContentRegex = /\/\*([\s\S]*?)\*\//;
        this.grammarConfig = services.parser.GrammarConfig;
    }
    getAstNodeHoverContent(node) {
        const lastNode = (0, cst_util_1.findCommentNode)(node.$cstNode, this.grammarConfig.multilineCommentRules);
        let content;
        if (lastNode) {
            const exec = this.commentContentRegex.exec(lastNode.text);
            if (exec && exec[1]) {
                content = this.getCommentContent(exec[1]);
            }
        }
        if (content) {
            return {
                contents: {
                    kind: 'markdown',
                    value: content
                }
            };
        }
        return undefined;
    }
    getCommentContent(commentText) {
        const split = commentText.split('\n').map(e => {
            e = e.trim();
            if (e.startsWith('*')) {
                e = e.substring(1).trim();
            }
            return e;
        });
        return split.join(' ').trim();
    }
}
exports.MultilineCommentHoverProvider = MultilineCommentHoverProvider;
//# sourceMappingURL=hover-provider.js.map