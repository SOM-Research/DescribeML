"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.processGeneratorNode = void 0;
const generator_node_1 = require("./generator-node");
class Context {
    constructor(defaultIndent) {
        this.defaultIndentation = '    ';
        this.pendingIndent = true;
        this.currentIndents = [];
        this.lines = [[]];
        if (typeof defaultIndent === 'string') {
            this.defaultIndentation = defaultIndent;
        }
        else if (typeof defaultIndent === 'number') {
            this.defaultIndentation = ''.padStart(defaultIndent);
        }
    }
    get content() {
        return this.lines.map(e => e.join('')).join('');
    }
    get currentLineNumber() {
        return this.lines.length - 1;
    }
    get currentLineContent() {
        return this.lines[this.currentLineNumber].join('');
    }
    append(value) {
        if (value.length > 0) {
            this.lines[this.currentLineNumber].push(value);
        }
    }
    increaseIndent(node) {
        this.currentIndents.push(node);
    }
    decreaseIndent() {
        this.currentIndents.pop();
    }
    resetCurrentLine() {
        this.lines[this.currentLineNumber] = [];
    }
    addNewLine() {
        this.pendingIndent = true;
        this.lines.push([]);
    }
}
function processGeneratorNode(node, defaultIndentation) {
    const context = new Context(defaultIndentation);
    processNodeInternal(node, context);
    return context.content;
}
exports.processGeneratorNode = processGeneratorNode;
function processNodeInternal(node, context) {
    if (typeof (node) === 'string') {
        processStringNode(node, context);
    }
    else if (node instanceof generator_node_1.IndentNode) {
        processIndentNode(node, context);
    }
    else if (node instanceof generator_node_1.CompositeGeneratorNode) {
        processCompositeNode(node, context);
    }
    else if (node instanceof generator_node_1.NewLineNode) {
        processNewLineNode(node, context);
    }
}
function hasContent(node, ctx) {
    if (typeof (node) === 'string') {
        return hasNonWhitespace(node);
    }
    else if (node instanceof generator_node_1.CompositeGeneratorNode) {
        return node.contents.some(e => hasContent(e, ctx));
    }
    else if (node instanceof generator_node_1.NewLineNode) {
        return !(node.ifNotEmpty && ctx.currentLineContent.length === 0);
    }
    else {
        return false;
    }
}
function processStringNode(node, context) {
    if (node) {
        if (context.pendingIndent) {
            handlePendingIndent(context, false);
        }
        context.append(node);
    }
}
function handlePendingIndent(ctx, endOfLine) {
    var _a;
    let indent = '';
    for (const indentNode of ctx.currentIndents.filter(e => e.indentEmptyLines || !endOfLine)) {
        indent += (_a = indentNode.indentation) !== null && _a !== void 0 ? _a : ctx.defaultIndentation;
    }
    ctx.append(indent);
    ctx.pendingIndent = false;
}
function processCompositeNode(node, context) {
    for (const child of node.contents) {
        processNodeInternal(child, context);
    }
}
function processIndentNode(node, context) {
    var _a;
    if (hasContent(node, context)) {
        if (node.indentImmediately && !context.pendingIndent) {
            context.append((_a = node.indentation) !== null && _a !== void 0 ? _a : context.defaultIndentation);
        }
        try {
            context.increaseIndent(node);
            processCompositeNode(node, context);
        }
        finally {
            context.decreaseIndent();
        }
    }
}
function processNewLineNode(node, context) {
    if (node.ifNotEmpty && !hasNonWhitespace(context.currentLineContent)) {
        context.resetCurrentLine();
    }
    else {
        if (context.pendingIndent) {
            handlePendingIndent(context, true);
        }
        context.append(node.lineDelimiter);
        context.addNewLine();
    }
}
function hasNonWhitespace(text) {
    return text.trimStart() !== '';
}
//# sourceMappingURL=node-processor.js.map