/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 
******************************************************************************/

/*
import fs from 'fs';
import _ from 'lodash';
import { CompositeGeneratorNode, IndentNode, NL, processGeneratorNode } from 'langium';
import { Declaration, Domainmodel, Instance, Requeriment, isInstance, isDatasetDefinition, Type } from '../language-server/generated/ast';
import { extractAstNode, extractDestinationAndName, setRootFolder } from './cli-util';
import { createDomainModelServices } from '../language-server/domain-model-module';
import { DomainModelLanguageMetaData } from '../language-server/generated/module';
import colors from 'colors';
import path from 'path';

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createDomainModelServices().domainmodel;
    await setRootFolder(fileName, services, opts.root);
    const domainmodel = await extractAstNode<Domainmodel>(fileName, DomainModelLanguageMetaData.fileExtensions, services);
    const generatedDirPath = generateJava(domainmodel, fileName, opts.destination);
    console.log(colors.green(`Java classes generated successfully: ${colors.yellow(generatedDirPath)}`));
};

export type GenerateOptions = {
    destination?: string;
    root?: string;
}

export function generateJava(domainmodel: Domainmodel, fileName: string, destination?: string): string {
    const data = extractDestinationAndName(fileName, destination);
    return generateDeclarations(data.destination, domainmodel.elements, data.name);
}

function generateDeclarations(destination: string, elements: Array<Declaration | Type>, filePath: string): string {

    function generateDeclarationsInternal(elements: Array<Declaration | Type>, filePath: string): string {
        const fullPath = path.join(destination, filePath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }

        const packagePath = filePath.replace(/\//g, '.').replace(/^\.+/, '');
        for (const elem of elements) {
            if (isDatasetDefinition(elem)) {
      //          generateDeclarationsInternal(elem.elements, path.join(filePath, elem.name.replace(/\./g, '/')));
            } else if (isInstance(elem)) {
                const fileNode = new CompositeGeneratorNode();
                fileNode.append(`package ${packagePath};`, NL, NL);
                generateInstance(elem, fileNode);
                fs.writeFileSync(path.join(fullPath, `${elem.name}.java`), processGeneratorNode(fileNode));
            }
        }
        return fullPath;
    }

    return generateDeclarationsInternal(elements, filePath);
}

function generateInstance(Instance: Instance, fileNode: CompositeGeneratorNode): void {
 //   const maybeExtends = Instance.superType ? ` extends ${Instance.superType.$refText}` : '';
  //  fileNode.append(`class ${Instance.name}${maybeExtends} {`, NL);
    fileNode.indent(classBody => {
   //     const RequerimentData = Instance.Requeriments.map(f => generateRequeriment(f, classBody));
   //     RequerimentData.forEach(([generateField, , ]) => generateField());
   //     RequerimentData.forEach(([, generateSetter, generateGetter]) => { generateSetter(); generateGetter(); } );
    });
    fileNode.append('}', NL);
}

function generateRequeriment(Requeriment: Requeriment, classBody: IndentNode): [() => void, () => void, () => void] {
    const name = Requeriment.name;
    const type = Requeriment.type.$refText + (Requeriment.many ? '[]' : '');

    return [
        () => { // generate the field
            classBody.append(`private ${type} ${name};`, NL);
        },
        () => { // generate the setter
            classBody.append(NL);
            classBody.append(`public void set${_.upperFirst(name)}(${type} ${name}) {`, NL);
            classBody.indent(methodBody => {
                methodBody.append(`this.${name} = ${name};`, NL);
            });
            classBody.append('}', NL);
        },
        () => { // generate the getter
            classBody.append(NL);
            classBody.append(`public ${type} get${_.upperFirst(name)}() {`, NL);
            classBody.indent(methodBody => {
                methodBody.append(`return ${name};`, NL);
            });
            classBody.append('}', NL);
        }
    ];
}
*/