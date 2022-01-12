"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.NLEmpty = exports.NL = exports.NewLineNode = exports.IndentNode = exports.CompositeGeneratorNode = void 0;
const os_1 = require("os");
class CompositeGeneratorNode {
    constructor(...contents) {
        this.contents = [];
        this.append(...contents);
    }
    append(...args) {
        for (const arg of args) {
            if (typeof arg === 'function') {
                arg(this);
            }
            else {
                this.contents.push(arg);
            }
        }
        return this;
    }
    indent(func) {
        const node = new IndentNode();
        this.contents.push(node);
        if (func) {
            func(node);
        }
        return this;
    }
}
exports.CompositeGeneratorNode = CompositeGeneratorNode;
class IndentNode extends CompositeGeneratorNode {
    constructor(indentation, indentImmediately = true, indentEmptyLines = false) {
        super();
        this.indentImmediately = true;
        this.indentEmptyLines = false;
        if (typeof (indentation) === 'string') {
            this.indentation = indentation;
        }
        else if (typeof (indentation) === 'number') {
            this.indentation = ''.padStart(indentation);
        }
        this.indentImmediately = indentImmediately;
        this.indentEmptyLines = indentEmptyLines;
    }
}
exports.IndentNode = IndentNode;
class NewLineNode {
    constructor(lineDelimiter, ifNotEmpty = false) {
        this.ifNotEmpty = false;
        this.lineDelimiter = lineDelimiter !== null && lineDelimiter !== void 0 ? lineDelimiter : os_1.EOL;
        this.ifNotEmpty = ifNotEmpty;
    }
}
exports.NewLineNode = NewLineNode;
exports.NL = new NewLineNode();
exports.NLEmpty = new NewLineNode(undefined, true);
//# sourceMappingURL=generator-node.js.map