"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangiumParser = exports.DatatypeSymbol = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const chevrotain_1 = require("chevrotain");
const ast_1 = require("../grammar/generated/ast");
const ast_util_1 = require("../utils/ast-util");
const cst_util_1 = require("../utils/cst-util");
const cst_node_builder_1 = require("./cst-node-builder");
exports.DatatypeSymbol = Symbol('Datatype');
class LangiumParser {
    constructor(services, tokens) {
        this.nodeBuilder = new cst_node_builder_1.CstNodeBuilder();
        this.stack = [];
        this.assignmentMap = new Map();
        this.wrapper = new ChevrotainWrapper(tokens, services.parser.ParserConfig);
        this.linker = services.references.Linker;
        this.converter = services.parser.ValueConverter;
        this.lexer = new chevrotain_1.Lexer(tokens);
    }
    get current() {
        return this.stack[this.stack.length - 1];
    }
    MAIN_RULE(name, type, implementation) {
        return this.mainRule = this.DEFINE_RULE(name, type, implementation);
    }
    DEFINE_RULE(name, type, implementation) {
        return this.wrapper.DEFINE_RULE(name, this.startImplementation(type, implementation).bind(this));
    }
    parse(input) {
        this.nodeBuilder.buildRootNode(input);
        const lexerResult = this.lexer.tokenize(input);
        this.wrapper.input = lexerResult.tokens;
        const result = this.mainRule.call(this.wrapper);
        this.addHiddenTokens(result.$cstNode, lexerResult.groups.hidden);
        return {
            value: result,
            lexerErrors: lexerResult.errors,
            parserErrors: this.wrapper.errors
        };
    }
    addHiddenTokens(node, tokens) {
        for (const token of tokens) {
            const hiddenNode = new cst_node_builder_1.LeafCstNodeImpl(token.startOffset, token.image.length, (0, cst_util_1.tokenToRange)(token), token.tokenType, true);
            hiddenNode.root = node;
            this.addHiddenToken(node, hiddenNode);
        }
    }
    addHiddenToken(node, token) {
        const { offset, end } = node;
        const { offset: tokenStart, end: tokenEnd } = token;
        if (offset >= tokenEnd) {
            node.children.unshift(token);
        }
        else if (end <= tokenStart) {
            node.children.push(token);
        }
        else {
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                const childEnd = child.end;
                if (child instanceof cst_node_builder_1.CompositeCstNodeImpl && tokenEnd < childEnd) {
                    this.addHiddenToken(child, token);
                    return;
                }
                else if (tokenEnd <= child.offset) {
                    node.children.splice(i, 0, token);
                    return;
                }
            }
        }
    }
    startImplementation($type, implementation) {
        return () => {
            if (!this.wrapper.IS_RECORDING) {
                this.stack.push({ $type });
            }
            let result;
            try {
                result = implementation();
            }
            catch (err) {
                console.log('Parser exception thrown!', err);
                result = undefined;
            }
            if (!this.wrapper.IS_RECORDING && result === undefined) {
                result = this.construct();
            }
            return result;
        };
    }
    alternatives(idx, choices) {
        this.wrapper.wrapOr(idx, choices);
    }
    optional(idx, callback) {
        this.wrapper.wrapOption(idx, callback);
    }
    many(idx, callback) {
        this.wrapper.wrapMany(idx, callback);
    }
    atLeastOne(idx, callback) {
        this.wrapper.wrapAtLeastOne(idx, callback);
    }
    consume(idx, tokenType, feature) {
        const token = this.wrapper.wrapConsume(idx, tokenType);
        if (!this.wrapper.IS_RECORDING) {
            const leafNode = this.nodeBuilder.buildLeafNode(token, feature);
            const { assignment, crossRef } = this.getAssignment(feature);
            if (assignment) {
                let crossRefId;
                if (crossRef) {
                    crossRefId = `${this.current.$type}:${assignment.feature}`;
                }
                this.assign(assignment, token.image, leafNode, crossRefId);
            }
        }
    }
    unassignedSubrule(idx, rule, feature) {
        const result = this.subrule(idx, rule, feature);
        if (!this.wrapper.IS_RECORDING) {
            const resultKind = result.$type;
            const object = this.assignWithoutOverride(result, this.current);
            if (resultKind) {
                object.$type = resultKind;
            }
            const newItem = object;
            this.stack.pop();
            this.stack.push(newItem);
        }
    }
    subrule(idx, rule, feature) {
        let cstNode;
        if (!this.wrapper.IS_RECORDING) {
            cstNode = this.nodeBuilder.buildCompositeNode(feature);
        }
        const subruleResult = this.wrapper.wrapSubrule(idx, rule);
        if (!this.wrapper.IS_RECORDING) {
            const { assignment, crossRef } = this.getAssignment(feature);
            if (assignment && cstNode) {
                let crossRefId;
                if (crossRef) {
                    crossRefId = `${this.current.$type}:${assignment.feature}`;
                }
                this.assign(assignment, subruleResult, cstNode, crossRefId);
            }
        }
        return subruleResult;
    }
    action($type, action) {
        if (!this.wrapper.IS_RECORDING) {
            let last = this.current;
            // This branch is used for left recursive grammar rules.
            // Those don't call `construct` before another action.
            // Therefore, we need to call it here.
            if (!last.$cstNode && action.feature && action.operator) {
                last = this.construct(false);
                const feature = last.$cstNode.feature;
                this.nodeBuilder.buildCompositeNode(feature);
            }
            const newItem = { $type };
            this.stack.pop();
            this.stack.push(newItem);
            if (action.feature && action.operator) {
                this.assign(action, last, last.$cstNode);
            }
        }
    }
    /**
     * Initializes array fields of the current object. Array fields are not allowed to be undefined.
     * Therefore, all array fields are initialized with an empty array.
     * @param initialArrayProperties The grammar access element that belongs to the current rule
     */
    initializeElement(initialArrayProperties) {
        if (!this.wrapper.IS_RECORDING) {
            const item = this.current;
            for (const element of initialArrayProperties) {
                item[element] = [];
            }
        }
    }
    construct(pop = true) {
        if (this.wrapper.IS_RECORDING) {
            return undefined;
        }
        const obj = this.current;
        for (const [name, value] of Object.entries(obj)) {
            if (!name.startsWith('$')) {
                if (Array.isArray(value)) {
                    for (const item of value) {
                        if (item !== null && typeof item === 'object') {
                            item.$container = obj;
                        }
                    }
                }
                else if (obj !== null && typeof (value) === 'object') {
                    value.$container = obj;
                }
            }
        }
        this.nodeBuilder.construct(obj);
        if (pop) {
            this.stack.pop();
        }
        if (obj.$type === exports.DatatypeSymbol) {
            const node = obj.$cstNode;
            return node.text;
        }
        return obj;
    }
    getAssignment(feature) {
        if (!this.assignmentMap.has(feature)) {
            const assignment = (0, ast_util_1.getContainerOfType)(feature, ast_1.isAssignment);
            this.assignmentMap.set(feature, {
                assignment: assignment,
                crossRef: assignment ? (0, ast_1.isCrossReference)(assignment.terminal) : false
            });
        }
        return this.assignmentMap.get(feature);
    }
    assign(assignment, value, cstNode, crossRefId) {
        const obj = this.current;
        const feature = assignment.feature.replace(/\^/g, '');
        let item;
        if (crossRefId && typeof value === 'string') {
            const refText = cstNode ? this.converter.convert(value, cstNode).toString() : value;
            item = this.linker.buildReference(obj, cstNode, crossRefId, refText);
        }
        else if (cstNode && typeof value === 'string') {
            item = this.converter.convert(value, cstNode);
        }
        else {
            item = value;
        }
        switch (assignment.operator) {
            case '=': {
                obj[feature] = item;
                break;
            }
            case '?=': {
                obj[feature] = true;
                break;
            }
            case '+=': {
                if (!Array.isArray(obj[feature])) {
                    obj[feature] = [];
                }
                obj[feature].push(item);
            }
        }
    }
    assignWithoutOverride(target, source) {
        for (const [name, value] of Object.entries(source)) {
            if (target[name] === undefined) {
                target[name] = value;
            }
        }
        return target;
    }
    finalize() {
        this.wrapper.wrapSelfAnalysis();
    }
}
exports.LangiumParser = LangiumParser;
const defaultConfig = {
    recoveryEnabled: true,
    nodeLocationTracking: 'full',
    skipValidations: true
};
/**
 * This class wraps the embedded actions parser of chevrotain and exposes protected methods.
 * This way, we can build the `LangiumParser` as a composition.
 */
class ChevrotainWrapper extends chevrotain_1.EmbeddedActionsParser {
    constructor(tokens, config) {
        super(tokens, Object.assign(Object.assign({}, defaultConfig), config));
    }
    get IS_RECORDING() {
        return this.RECORDING_PHASE;
    }
    DEFINE_RULE(name, impl) {
        return this.RULE(name, impl);
    }
    wrapSelfAnalysis() {
        this.performSelfAnalysis();
    }
    wrapConsume(idx, tokenType) {
        return this.consume(idx, tokenType);
    }
    wrapSubrule(idx, rule) {
        return this.subrule(idx, rule);
    }
    wrapOr(idx, choices) {
        this.or(idx, choices.map(e => ({ ALT: e })));
    }
    wrapOption(idx, callback) {
        this.option(idx, callback);
    }
    wrapMany(idx, callback) {
        this.many(idx, callback);
    }
    wrapAtLeastOne(idx, callback) {
        this.atLeastOne(idx, callback);
    }
}
//# sourceMappingURL=langium-parser.js.map