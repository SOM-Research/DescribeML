"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultNameProvider = exports.isNamed = void 0;
const grammar_util_1 = require("../grammar/grammar-util");
function isNamed(node) {
    return node.name !== undefined;
}
exports.isNamed = isNamed;
class DefaultNameProvider {
    getName(node) {
        if (isNamed(node)) {
            return node.name;
        }
        return undefined;
    }
    getNameNode(node) {
        return (0, grammar_util_1.findNodeForFeature)(node.$cstNode, 'name');
    }
}
exports.DefaultNameProvider = DefaultNameProvider;
//# sourceMappingURL=naming.js.map