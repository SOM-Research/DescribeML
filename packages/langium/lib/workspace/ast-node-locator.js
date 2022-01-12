"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultAstNodeLocator = void 0;
const grammar_util_1 = require("../grammar/grammar-util");
class DefaultAstNodeLocator {
    constructor() {
        this.segmentSeparator = '/';
        this.indexSeparator = '@';
    }
    getAstNodePath(node) {
        if (node.$path) {
            // If the node already has a path, use that (this can be used to locate without a CST)
            return node.$path;
        }
        // Otherwise concatenate the container's path with a new path segment
        if (node.$container) {
            const containerPath = this.getAstNodePath(node.$container);
            const newSegment = this.getPathSegment(node, node.$container);
            const nodePath = containerPath + this.segmentSeparator + newSegment;
            node.$path = nodePath;
            return nodePath;
        }
        return '';
    }
    getPathSegment(node, container) {
        if (node.$cstNode) {
            const assignment = (0, grammar_util_1.findAssignment)(node.$cstNode);
            if (assignment) {
                if (assignment.operator === '+=') {
                    const array = container[assignment.feature];
                    const idx = array.indexOf(node);
                    return assignment.feature + this.indexSeparator + idx;
                }
                return assignment.feature;
            }
        }
        return '<missing>';
    }
    getAstNode(document, path) {
        const segments = path.split(this.segmentSeparator);
        return segments.reduce((previousValue, currentValue) => {
            if (!previousValue || currentValue.length === 0) {
                return previousValue;
            }
            const propertyIndex = currentValue.indexOf(this.indexSeparator);
            if (propertyIndex > 0) {
                const property = currentValue.substring(0, propertyIndex);
                const arrayIndex = parseInt(currentValue.substring(propertyIndex + 1));
                const array = previousValue[property];
                return array[arrayIndex];
            }
            return previousValue[currentValue];
        }, document.parseResult.value);
    }
}
exports.DefaultAstNodeLocator = DefaultAstNodeLocator;
//# sourceMappingURL=ast-node-locator.js.map