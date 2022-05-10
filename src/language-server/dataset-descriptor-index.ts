/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

 import { AstNodeDescription, DefaultAstNodeDescriptionProvider, interruptAndCheck, LangiumDocument, LangiumServices, streamAllContents } from 'langium';
 import { CancellationToken } from 'vscode-languageserver';
 import { isAttribute, DataInstance } from './generated/ast';

 
 export class DatasetDescriptorDescriptionProvider extends DefaultAstNodeDescriptionProvider {
 
     constructor(services: LangiumServices) {
         super(services);
     }
 
     async createDescriptions(document: LangiumDocument, cancelToken = CancellationToken.None): Promise<AstNodeDescription[]> {
         const descr: AstNodeDescription[] = [];
         const rootNode = document.parseResult.value;
         const name = this.nameProvider.getName(rootNode);
         if (name) {
             descr.push(this.createDescription(rootNode, name, document));
         }
         for (const content of streamAllContents(rootNode)) {
             await interruptAndCheck(cancelToken);
             const name = this.nameProvider.getName(content.node);
             if (isAttribute(content.node)){
                 let container = content.node.$container as DataInstance;
                 if (name && (container.name)) {
                     descr.push(this.createDescription(content.node, container.name+'.'+ name, document));
                 }
             }
             if (name) {
                 descr.push(this.createDescription(content.node, name, document));
             }
 
         }
         return descr;
     }
 }