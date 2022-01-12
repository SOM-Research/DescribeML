"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultReferences = void 0;
const grammar_util_1 = require("../grammar/grammar-util");
const ast_util_1 = require("../utils/ast-util");
const cst_util_1 = require("../utils/cst-util");
class DefaultReferences {
    constructor(services) {
        this.nameProvider = services.references.NameProvider;
        this.index = services.shared.workspace.IndexManager;
        this.nodeLocator = services.index.AstNodeLocator;
    }
    findDeclaration(sourceCstNode) {
        if (sourceCstNode) {
            const assignment = (0, grammar_util_1.findAssignment)(sourceCstNode);
            const nodeElem = (0, cst_util_1.findRelevantNode)(sourceCstNode);
            if (assignment && nodeElem) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const reference = nodeElem[assignment.feature];
                if ((0, ast_util_1.isReference)(reference)) {
                    return this.processReference(reference);
                }
                else if (Array.isArray(reference)) {
                    for (const ref of reference) {
                        if ((0, ast_util_1.isReference)(ref)) {
                            const target = this.processReference(ref);
                            if (target && target.text === sourceCstNode.text)
                                return target;
                        }
                    }
                }
                else {
                    const nameNode = this.nameProvider.getNameNode(nodeElem);
                    if (nameNode === sourceCstNode
                        || nameNode && nameNode.offset <= sourceCstNode.offset
                            && nameNode.offset + nameNode.length > sourceCstNode.offset) {
                        return nameNode;
                    }
                }
            }
        }
        return undefined;
    }
    findReferences(targetNode) {
        return this.index.findAllReferences(targetNode, this.nodeLocator.getAstNodePath(targetNode));
    }
    processReference(reference) {
        const ref = reference.ref;
        if (ref && ref.$cstNode) {
            const targetNode = this.nameProvider.getNameNode(ref);
            if (!targetNode) {
                return ref.$cstNode;
            }
            else {
                return targetNode;
            }
        }
        return undefined;
    }
}
exports.DefaultReferences = DefaultReferences;
//# sourceMappingURL=references.js.map