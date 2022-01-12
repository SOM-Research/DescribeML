"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAst = void 0;
const langium_1 = require("langium");
const type_collector_1 = require("./type-collector");
const util_1 = require("./util");
function generateAst(services, grammars, config) {
    const types = (0, type_collector_1.collectAst)(services.shared.workspace.LangiumDocuments, grammars);
    const fileNode = new langium_1.CompositeGeneratorNode();
    fileNode.append(util_1.generatedHeader, '/* eslint-disable @typescript-eslint/array-type */', langium_1.NL, '/* eslint-disable @typescript-eslint/no-empty-interface */', langium_1.NL);
    const crossRef = grammars.some(grammar => hasCrossReferences(grammar));
    if (config.langiumInternal) {
        fileNode.append(`import { AstNode, AstReflection${crossRef ? ', Reference' : ''} } from '../../syntax-tree';`, langium_1.NL, "import { isAstNode } from '../../utils/ast-util';", langium_1.NL, langium_1.NL);
    }
    else {
        fileNode.append(`import { AstNode, AstReflection${crossRef ? ', Reference' : ''}, isAstNode } from 'langium';`, langium_1.NL, langium_1.NL);
    }
    for (const type of types) {
        fileNode.append(type.toString(), langium_1.NL);
    }
    for (const primitiveRule of (0, langium_1.stream)(grammars.flatMap(e => e.rules)).distinct().filter(langium_1.isParserRule).filter(e => (0, langium_1.isDataTypeRule)(e))) {
        fileNode.append(buildDatatype(primitiveRule), langium_1.NL, langium_1.NL);
    }
    fileNode.append(generateAstReflection(config, types));
    return (0, langium_1.processGeneratorNode)(fileNode);
}
exports.generateAst = generateAst;
function buildDatatype(rule) {
    var _a;
    if ((0, langium_1.isAlternatives)(rule.alternatives) && rule.alternatives.elements.every(e => (0, langium_1.isKeyword)(e))) {
        return `export type ${rule.name} = ${(0, langium_1.stream)(rule.alternatives.elements).filter(langium_1.isKeyword).map(e => `'${e.value}'`).join(' | ')}`;
    }
    else {
        return `export type ${rule.name} = ${(_a = rule.type) !== null && _a !== void 0 ? _a : 'string'}`;
    }
}
function hasCrossReferences(grammar) {
    let result = false;
    (0, langium_1.streamAllContents)(grammar).forEach(e => {
        if ((0, langium_1.isCrossReference)(e.node)) {
            result = true;
        }
    });
    return result;
}
function generateAstReflection(config, interfaces) {
    const reflectionNode = new langium_1.CompositeGeneratorNode();
    const crossReferenceTypes = buildCrossReferenceTypes(interfaces);
    reflectionNode.append('export type ', config.projectName, 'AstType = ', interfaces.map(t => `'${t.name}'`).join(' | '), ';', langium_1.NL, langium_1.NL, 'export type ', config.projectName, 'AstReference = ', crossReferenceTypes.map(e => `'${e.type}:${e.feature}'`).join(' | ') || 'never', ';', langium_1.NL, langium_1.NL, 'export class ', config.projectName, 'AstReflection implements AstReflection {', langium_1.NL, langium_1.NL);
    reflectionNode.indent(classBody => {
        classBody.append('getAllTypes(): string[] {', langium_1.NL);
        classBody.indent(allTypes => {
            allTypes.append('return [', interfaces.map(t => `'${t.name}'`).join(', '), '];', langium_1.NL);
        });
        classBody.append('}', langium_1.NL, langium_1.NL, 'isInstance(node: unknown, type: string): boolean {', langium_1.NL);
        classBody.indent(isInstance => {
            isInstance.append('return isAstNode(node) && this.isSubtype(node.$type, type);', langium_1.NL);
        });
        classBody.append('}', langium_1.NL, langium_1.NL, 'isSubtype(subtype: string, supertype: string): boolean {', langium_1.NL, buildIsSubtypeMethod(interfaces), '}', langium_1.NL, langium_1.NL, 'getReferenceType(referenceId: ', config.projectName, 'AstReference): string {', langium_1.NL, buildReferenceTypeMethod(interfaces), '}', langium_1.NL);
    });
    reflectionNode.append('}', langium_1.NL, langium_1.NL, 'export const reflection = new ', config.projectName, 'AstReflection();', langium_1.NL);
    return reflectionNode;
}
function buildReferenceTypeMethod(interfaces) {
    const crossReferenceTypes = buildCrossReferenceTypes(interfaces);
    const typeSwitchNode = new langium_1.IndentNode();
    typeSwitchNode.append('switch (referenceId) {', langium_1.NL);
    typeSwitchNode.indent(caseNode => {
        for (const crossRef of crossReferenceTypes) {
            caseNode.append(`case '${crossRef.type}:${crossRef.feature}': {`, langium_1.NL);
            caseNode.indent(caseContent => {
                caseContent.append(`return ${crossRef.referenceType};`, langium_1.NL);
            });
            caseNode.append('}', langium_1.NL);
        }
        caseNode.append('default: {', langium_1.NL);
        caseNode.indent(defaultNode => {
            defaultNode.append('throw new Error(`${referenceId} is not a valid reference id.`);', langium_1.NL);
        });
        caseNode.append('}', langium_1.NL);
    });
    typeSwitchNode.append('}', langium_1.NL);
    return typeSwitchNode;
}
function buildCrossReferenceTypes(interfaces) {
    const crossReferences = [];
    for (const type of interfaces) {
        for (const field of type.fields.filter(e => e.reference)) {
            crossReferences.push({ type: type.name, feature: field.name, referenceType: field.types[0] });
        }
    }
    return crossReferences;
}
function buildIsSubtypeMethod(interfaces) {
    const methodNode = new langium_1.IndentNode();
    methodNode.append('if (subtype === supertype) {', langium_1.NL);
    methodNode.indent(ifNode => {
        ifNode.append('return true;', langium_1.NL);
    });
    methodNode.append('}', langium_1.NL, 'switch (subtype) {', langium_1.NL);
    methodNode.indent(switchNode => {
        const groups = groupBySupertypes(interfaces.filter(e => e.superTypes.length > 0));
        for (const superTypes of groups.keys()) {
            const typeGroup = groups.get(superTypes);
            for (const typeItem of typeGroup) {
                switchNode.append(`case ${typeItem.name}:`, langium_1.NL);
            }
            switchNode.contents.pop();
            switchNode.append(' {', langium_1.NL);
            switchNode.indent(caseNode => {
                caseNode.append('return ', superTypes.split(':').map(e => `this.isSubtype(${e}, supertype)`).join(' || '), ';');
            });
            switchNode.append(langium_1.NL, '}', langium_1.NL);
        }
        switchNode.append('default: {', langium_1.NL);
        switchNode.indent(defaultNode => {
            defaultNode.append('return false;', langium_1.NL);
        });
        switchNode.append('}', langium_1.NL);
    });
    methodNode.append('}', langium_1.NL);
    return methodNode;
}
function groupBySupertypes(interfaces) {
    const map = new langium_1.MultiMap();
    for (const item of interfaces) {
        map.add(item.superTypes.join(':'), item);
    }
    return map;
}
//# sourceMappingURL=ast-generator.js.map