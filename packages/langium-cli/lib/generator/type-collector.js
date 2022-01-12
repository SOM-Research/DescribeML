"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectAst = exports.Interface = void 0;
const lodash_1 = __importDefault(require("lodash"));
const langium = __importStar(require("langium"));
const langium_1 = require("langium");
const langium_2 = require("langium");
const langium_3 = require("langium");
const langium_4 = require("langium");
class Interface {
    constructor(name, superTypes, fields) {
        this.subTypes = [];
        this.containerTypes = [];
        this.name = name;
        this.superTypes = Array.from(new Set(superTypes));
        this.fields = fields;
    }
    toString() {
        const interfaceNode = new langium_2.CompositeGeneratorNode();
        const superTypes = this.superTypes.length > 0 ? this.superTypes : ['AstNode'];
        interfaceNode.contents.push('export interface ', this.name, ' extends ', superTypes.join(', '), ' {', langium_2.NL);
        const fieldsNode = new langium_2.IndentNode();
        if (this.containerTypes.length > 0) {
            fieldsNode.contents.push('readonly $container: ', Array.from(new Set(this.containerTypes)).join(' | '), ';', langium_2.NL);
        }
        for (const field of this.fields.sort((a, b) => a.name.localeCompare(b.name))) {
            const option = field.optional && field.reference && !field.array ? '?' : '';
            let type = field.types.join(' | ');
            type = field.reference ? 'Reference<' + type + '>' : type;
            type = field.array ? 'Array<' + type + '>' : type;
            fieldsNode.contents.push(field.name, option, ': ', type, langium_2.NL);
        }
        interfaceNode.contents.push(fieldsNode, '}', langium_2.NL, langium_2.NL);
        interfaceNode.contents.push(`export const ${this.name} = '${this.name}';`, langium_2.NL, langium_2.NL);
        interfaceNode.contents.push('export function is', this.name, '(item: unknown): item is ', this.name, ' {', langium_2.NL);
        const methodBody = new langium_2.IndentNode();
        methodBody.contents.push(`return reflection.isInstance(item, ${this.name});`, langium_2.NL);
        interfaceNode.contents.push(methodBody, '}', langium_2.NL);
        return (0, langium_3.processGeneratorNode)(interfaceNode);
    }
}
exports.Interface = Interface;
class TypeTree {
    constructor() {
        this.descendents = new Map();
    }
    addRoot(root) {
        this.descendents.set(root, []);
    }
    split(type, count) {
        const descendents = [];
        for (let i = 0; i < count; i++) {
            const clone = lodash_1.default.cloneDeep(type);
            descendents.push(clone);
            this.descendents.set(clone, []);
        }
        this.descendents.set(type, descendents);
        return descendents;
    }
    getLeafNodesOf(type) {
        var _a;
        const leaves = [];
        const direct = (_a = this.descendents.get(type)) !== null && _a !== void 0 ? _a : [];
        for (const directDesc of direct) {
            if (!this.hasLeaves(directDesc)) {
                leaves.push(directDesc);
            }
            else {
                leaves.push(...this.getLeafNodesOf(directDesc));
            }
        }
        if (leaves.length === 0) {
            leaves.push(type);
        }
        return leaves;
    }
    getLeafNodes() {
        const leaves = [];
        for (const [type, children] of this.descendents.entries()) {
            if (children.length === 0) {
                leaves.push(type);
            }
        }
        return leaves;
    }
    hasLeaves(type) {
        var _a;
        return ((_a = this.descendents.get(type)) !== null && _a !== void 0 ? _a : []).length > 0;
    }
}
function collectAst(documents, grammars) {
    const state = createState();
    const parserRules = collectAllParserRules(documents, grammars);
    const allTypes = [];
    for (const rule of parserRules) {
        state.tree = new TypeTree();
        const type = simpleType(rule);
        state.tree.addRoot(type);
        collectElement(state, type, rule.alternatives);
        allTypes.push(...state.tree.getLeafNodes());
    }
    return calculateAst(allTypes);
}
exports.collectAst = collectAst;
function collectAllParserRules(documents, grammars, rules = new Set(), visited = new Set()) {
    for (const grammar of grammars) {
        const doc = (0, langium_1.getDocument)(grammar);
        if (visited.has(doc.uri)) {
            continue;
        }
        visited.add(doc.uri);
        for (const rule of grammar.rules) {
            if (langium.isParserRule(rule) && !rule.fragment && !(0, langium_1.isDataTypeRule)(rule)) {
                rules.add(rule);
            }
        }
        const importedGrammars = grammar.imports.map(e => (0, langium_1.resolveImport)(documents, e));
        collectAllParserRules(documents, importedGrammars, rules, visited);
    }
    return Array.from(rules);
}
function createState(type) {
    const state = { types: [], cardinalities: [], tree: new TypeTree() };
    if (type) {
        state.tree.addRoot(type);
    }
    return state;
}
function simpleType(rule) {
    return {
        name: (0, langium_1.getTypeName)(rule),
        super: [],
        fields: [],
        ruleCalls: [],
        hasAction: false
    };
}
function enterGroup(state, cardinality) {
    state.cardinalities.push(cardinality);
}
function leaveGroup(state) {
    state.cardinalities.pop();
}
function isStateOptional(state) {
    return state.cardinalities.some(e => (0, langium_4.isOptional)(e));
}
function collectElement(state, type, element) {
    enterGroup(state, element.cardinality);
    if ((0, langium_4.isOptional)(element.cardinality)) {
        const [item] = state.tree.split(type, 2);
        type = item;
    }
    if (langium.isAlternatives(element)) {
        const splits = state.tree.split(type, element.elements.length);
        for (let i = 0; i < splits.length; i++) {
            const item = element.elements[i];
            const splitType = splits[i];
            collectElement(state, splitType, item);
        }
    }
    else if (langium.isGroup(element) || langium.isUnorderedGroup(element)) {
        for (const item of element.elements) {
            const leaves = state.tree.getLeafNodesOf(type);
            for (const leaf of leaves) {
                collectElement(state, leaf, item);
            }
        }
    }
    else if (langium.isAction(element)) {
        addAction(state, type, element);
    }
    else if (langium.isAssignment(element)) {
        addAssignment(state, type, element);
    }
    else if (langium.isRuleCall(element)) {
        addRuleCall(state, type, element);
    }
    leaveGroup(state);
}
function addAction(state, type, action) {
    var _a;
    if (action.type !== type.name) {
        type.super.push(type.name);
    }
    type.hasAction = true;
    type.name = action.type;
    if (action.feature && action.operator) {
        if (state.lastRuleCall) {
            type.fields.push({
                name: action.feature,
                array: action.operator === '+=',
                optional: false,
                reference: false,
                types: [(0, langium_1.getTypeName)((_a = state.lastRuleCall.rule) === null || _a === void 0 ? void 0 : _a.ref)]
            });
        }
        else {
            throw new Error('Actions with features can only be called after an unassigned rule call');
        }
    }
}
function addAssignment(state, type, assignment) {
    const typeItems = { types: [], reference: false };
    findTypes(assignment.terminal, typeItems);
    type.fields.push({
        name: assignment.feature,
        array: assignment.operator === '+=',
        optional: (0, langium_4.isOptional)(assignment.cardinality) || isStateOptional(state),
        types: assignment.operator === '?=' ? ['boolean'] : typeItems.types,
        reference: typeItems.reference
    });
}
function findTypes(terminal, types) {
    if (langium.isAlternatives(terminal) || langium.isUnorderedGroup(terminal) || langium.isGroup(terminal)) {
        findInCollection(terminal, types);
    }
    else if (langium.isKeyword(terminal)) {
        types.types.push(`'${terminal.value}'`);
    }
    else if (langium.isRuleCall(terminal)) {
        if ((0, langium_1.isParserRule)(terminal.rule.ref) && (0, langium_1.isDataTypeRule)(terminal.rule.ref)) {
            types.types.push(terminal.rule.ref.name);
        }
        else {
            types.types.push((0, langium_1.getRuleType)(terminal.rule.ref));
        }
    }
    else if (langium.isCrossReference(terminal)) {
        types.types.push((0, langium_1.getRuleType)(terminal.type.ref));
        types.reference = true;
    }
}
function findInCollection(collection, types) {
    for (const element of collection.elements) {
        findTypes(element, types);
    }
}
function addRuleCall(state, type, ruleCall) {
    const rule = ruleCall.rule.ref;
    // Add all fields of fragments to the current type
    if (langium.isParserRule(rule) && rule.fragment) {
        const fragmentType = simpleType(rule);
        const fragmentState = createState(fragmentType);
        collectElement(fragmentState, fragmentType, rule.alternatives);
        const types = calculateAst(fragmentState.tree.getLeafNodes());
        const foundType = types.find(e => e.name === rule.name);
        if (foundType) {
            type.fields.push(...foundType.fields);
        }
    }
    else if (langium.isParserRule(rule)) {
        type.ruleCalls.push((0, langium_1.getRuleType)(rule));
        state.lastRuleCall = ruleCall;
    }
}
function flattenTypes(alternatives) {
    const names = new Set(alternatives.map(e => e.name));
    const types = [];
    for (const name of names) {
        const fields = [];
        const ruleCalls = new Set();
        const type = { name, fields, ruleCalls: [], super: [], hasAction: false };
        const namedAlternatives = alternatives.filter(e => e.name === name);
        for (const alt of namedAlternatives) {
            type.super.push(...alt.super);
            type.hasAction = type.hasAction || alt.hasAction;
            const altFields = alt.fields;
            for (const altField of altFields) {
                const existingField = fields.find(e => e.name === altField.name);
                if (existingField) {
                    existingField.optional = existingField.optional && altField.optional;
                    const typeSet = new Set(existingField.types);
                    for (const type of altField.types) {
                        typeSet.add(type);
                    }
                    existingField.types = Array.from(typeSet.values());
                }
                else {
                    fields.push(Object.assign({}, altField));
                }
            }
            if (altFields.length === 0) {
                for (const ruleCall of alt.ruleCalls) {
                    ruleCalls.add(ruleCall);
                }
            }
        }
        type.ruleCalls = Array.from(ruleCalls);
        types.push(type);
    }
    return types;
}
function calculateAst(alternatives) {
    const interfaces = [];
    const ruleCallAlternatives = [];
    const flattened = flattenTypes(alternatives);
    for (const flat of flattened) {
        const type = new Interface(flat.name, flat.super, flat.fields);
        interfaces.push(type);
        if (flat.ruleCalls.length > 0) {
            ruleCallAlternatives.push(flat);
        }
        // all other cases assume we have a data type rule
        // we do not generate an AST type for data type rules
    }
    for (const ruleCallType of ruleCallAlternatives) {
        let exists = false;
        for (const ruleCall of ruleCallType.ruleCalls) {
            const calledInterface = interfaces.find(e => e.name === ruleCall);
            if (calledInterface && calledInterface.name === ruleCallType.name) {
                exists = true;
            }
            else if (calledInterface) {
                calledInterface.superTypes.push(ruleCallType.name);
            }
        }
        if (!exists && !interfaces.some(e => e.name === ruleCallType.name)) {
            interfaces.push(new Interface(ruleCallType.name, ruleCallType.super, []));
        }
    }
    for (const type of interfaces) {
        type.superTypes = Array.from(new Set(type.superTypes));
    }
    removeInvalidSuperTypes(interfaces);
    liftFields(interfaces);
    buildContainerTypes(interfaces);
    return sortTypes(interfaces);
}
function removeInvalidSuperTypes(interfaces) {
    for (const type of interfaces) {
        const toRemove = [];
        for (const superType of type.superTypes) {
            if (!interfaces.some(e => e.name === superType)) {
                toRemove.push(superType);
            }
        }
        type.superTypes = type.superTypes.filter(e => !toRemove.includes(e));
    }
}
function buildContainerTypes(interfaces) {
    // 1st stage: collect container types
    for (const type of interfaces) {
        for (const field of type.fields.filter(e => !e.reference)) {
            for (const fieldTypeName of field.types) {
                const fieldType = interfaces.find(e => e.name === fieldTypeName);
                if (fieldType) {
                    fieldType.containerTypes.push(type.name);
                }
            }
        }
    }
    const connectedComponents = [];
    // 2nd stage: share container types and lift them in supertypes
    calculateSubTypes(interfaces);
    calculateConnectedComponents(connectedComponents, interfaces);
    shareAndLiftContainerTypes(connectedComponents);
}
function calculateSubTypes(interfaces) {
    for (const type of interfaces) {
        for (const superTypeName of type.superTypes) {
            const superType = interfaces.find(e => e.name === superTypeName);
            if (superType) {
                superType.subTypes.push(type.name);
            }
        }
        type.subTypes = Array.from(new Set(type.subTypes));
    }
}
function calculateConnectedComponents(connectedComponents, interfaces) {
    const visited = new Set();
    function dfs(type) {
        let component = [type];
        visited.add(type.name);
        for (const nextTypeName of type.subTypes.concat(type.superTypes)) {
            if (!visited.has(nextTypeName)) {
                const superType = interfaces.find(e => e.name === nextTypeName);
                if (superType) {
                    component = component.concat(dfs(superType));
                }
            }
        }
        return component;
    }
    for (const type of interfaces) {
        if (!visited.has(type.name)) {
            connectedComponents.push(dfs(type));
        }
    }
}
function shareAndLiftContainerTypes(connectedComponents) {
    for (const component of connectedComponents) {
        let containerTypes = [];
        component.forEach(type => containerTypes = containerTypes.concat(type.containerTypes));
        for (const type of component) {
            if (type.superTypes.length > 0) {
                type.containerTypes = [];
            }
            else {
                type.containerTypes = containerTypes;
            }
        }
    }
}
function liftFields(interfaces) {
    for (const interfaceType of interfaces) {
        const subInterfaces = interfaces.filter(e => e.superTypes.includes(interfaceType.name));
        const first = subInterfaces[0];
        if (first) {
            const removal = [];
            for (const field of first.fields) {
                const fieldTypeSet = new Set(field.types);
                if (subInterfaces.every(e => e.fields.some(f => f.name === field.name && lodash_1.default.isEqual(new Set(f.types), fieldTypeSet)))) {
                    if (!interfaceType.fields.some(e => e.name === field.name)) {
                        interfaceType.fields.push(field);
                    }
                    removal.push(field);
                }
            }
            for (const remove of removal) {
                for (const subInterface of subInterfaces) {
                    const index = subInterface.fields.findIndex(e => e.name === remove.name);
                    subInterface.fields.splice(index, 1);
                }
            }
        }
    }
}
/**
 * Performs topological sorting on the generated interfaces.
 * @param interfaces The interfaces to sort topologically.
 * @returns A topologically sorted set of interfaces.
 */
function sortTypes(interfaces) {
    const nodes = interfaces
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(e => ({ value: e, nodes: [] }));
    for (const node of nodes) {
        node.nodes = nodes.filter(e => node.value.superTypes.includes(e.value.name));
    }
    const l = [];
    const s = nodes.filter(e => e.nodes.length === 0);
    while (s.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const n = s.shift();
        if (!l.includes(n)) {
            l.push(n);
            for (const m of nodes.filter(e => e.nodes.includes(n))) {
                s.push(m);
            }
        }
    }
    return l.map(e => e.value);
}
//# sourceMappingURL=type-collector.js.map