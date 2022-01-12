"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootCstNodeImpl = exports.CompositeCstNodeImpl = exports.LeafCstNodeImpl = exports.AbstractCstNode = exports.CstNodeBuilder = void 0;
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const cst_util_1 = require("../utils/cst-util");
class CstNodeBuilder {
    constructor() {
        this.nodeStack = [];
    }
    get current() {
        return this.nodeStack[this.nodeStack.length - 1];
    }
    buildRootNode(input) {
        this.rootNode = new RootCstNodeImpl(input);
        this.nodeStack = [this.rootNode];
    }
    buildCompositeNode(feature) {
        const compositeNode = new CompositeCstNodeImpl();
        compositeNode.feature = feature;
        compositeNode.root = this.rootNode;
        this.current.children.push(compositeNode);
        this.nodeStack.push(compositeNode);
        return compositeNode;
    }
    buildLeafNode(token, feature) {
        const leafNode = new LeafCstNodeImpl(token.startOffset, token.image.length, (0, cst_util_1.tokenToRange)(token), token.tokenType, false);
        leafNode.feature = feature;
        leafNode.root = this.rootNode;
        this.current.children.push(leafNode);
        return leafNode;
    }
    construct(item) {
        const current = this.current;
        // The specified item could be a datatype ($type is symbol) or a fragment ($type is undefined)
        // Only if the $type is a string, we actually assign the element
        if (typeof item.$type === 'string') {
            this.current.element = item;
        }
        item.$cstNode = current;
        this.nodeStack.pop();
    }
}
exports.CstNodeBuilder = CstNodeBuilder;
class AbstractCstNode {
    get hidden() {
        return false;
    }
    get element() {
        var _a, _b;
        return (_a = this._element) !== null && _a !== void 0 ? _a : (_b = this.parent) === null || _b === void 0 ? void 0 : _b.element;
    }
    set element(value) {
        this._element = value;
    }
    get text() {
        return this.root.text.substring(this.offset, this.end);
    }
}
exports.AbstractCstNode = AbstractCstNode;
class LeafCstNodeImpl extends AbstractCstNode {
    constructor(offset, length, range, tokenType, hidden = false) {
        super();
        this._hidden = hidden;
        this._offset = offset;
        this._tokenType = tokenType;
        this._length = length;
        this._range = range;
    }
    get offset() {
        return this._offset;
    }
    get length() {
        return this._length;
    }
    get end() {
        return this._offset + this._length;
    }
    get hidden() {
        return this._hidden;
    }
    get tokenType() {
        return this._tokenType;
    }
    get range() {
        return this._range;
    }
}
exports.LeafCstNodeImpl = LeafCstNodeImpl;
class CompositeCstNodeImpl extends AbstractCstNode {
    constructor() {
        super(...arguments);
        this.children = new CstNodeContainer(this);
    }
    get offset() {
        if (this.children.length > 0) {
            return this.firstNonHiddenNode.offset;
        }
        else {
            return 0;
        }
    }
    get length() {
        return this.end - this.offset;
    }
    get end() {
        if (this.children.length > 0) {
            return this.lastNonHiddenNode.end;
        }
        else {
            return 0;
        }
    }
    get range() {
        if (this.children.length > 0) {
            const { range: firstRange } = this.firstNonHiddenNode;
            const { range: lastRange } = this.lastNonHiddenNode;
            return { start: firstRange.start, end: lastRange.end.line < firstRange.start.line ? firstRange.start : lastRange.end };
        }
        else {
            return { start: vscode_languageserver_types_1.Position.create(0, 0), end: vscode_languageserver_types_1.Position.create(0, 0) };
        }
    }
    get firstNonHiddenNode() {
        for (const child of this.children) {
            if (!child.hidden) {
                return child;
            }
        }
        throw new Error('Composite node contains only hidden nodes');
    }
    get lastNonHiddenNode() {
        for (let i = this.children.length - 1; i >= 0; i--) {
            const child = this.children[i];
            if (!child.hidden) {
                return child;
            }
        }
        throw new Error('Composite node contains only hidden nodes');
    }
}
exports.CompositeCstNodeImpl = CompositeCstNodeImpl;
class CstNodeContainer extends Array {
    constructor(parent) {
        super();
        this.parent = parent;
        Object.setPrototypeOf(this, CstNodeContainer.prototype);
    }
    push(...items) {
        this.addParents(items);
        return super.push(...items);
    }
    unshift(...items) {
        this.addParents(items);
        return super.unshift(...items);
    }
    splice(start, count, ...items) {
        this.addParents(items);
        return super.splice(start, count, ...items);
    }
    addParents(items) {
        for (const item of items) {
            item.parent = this.parent;
        }
    }
}
class RootCstNodeImpl extends CompositeCstNodeImpl {
    constructor(input) {
        super();
        this._text = '';
        this._text = input !== null && input !== void 0 ? input : '';
    }
    set text(value) {
        this._text = value;
    }
    get text() {
        return this._text;
    }
    get offset() {
        return 0;
    }
    get length() {
        return this.text.length;
    }
}
exports.RootCstNodeImpl = RootCstNodeImpl;
//# sourceMappingURL=cst-node-builder.js.map