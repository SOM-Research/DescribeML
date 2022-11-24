/******************************************************************************
 * Copyright 2022 SOM Research
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

 import { AstNodeDescription, DefaultScopeComputation, interruptAndCheck, LangiumDocument, LangiumServices, streamAllContents } from 'langium';
 import { CancellationToken } from 'vscode-jsonrpc';
 import { isAttribute, DataInstance, isLabels, isLabelingProcess, isDataInstance, isSocialIssue} from './generated/ast';
 
 export class DatasetDescriptorScopeComputation extends DefaultScopeComputation {
 
     constructor(services: LangiumServices) {
         super(services);
     }
 
     /**
      * Exports only types (`DataType or `Entity`) with their qualified names.
      */
     async computeExports(document: LangiumDocument, cancelToken = CancellationToken.None): Promise<AstNodeDescription[]> {
         const descr: AstNodeDescription[] = [];
         for (const modelNode of streamAllContents(document.parseResult.value)) {
             await interruptAndCheck(cancelToken);
          
                 let name = this.nameProvider.getName(modelNode);
                 let container = modelNode.$container as DataInstance;
                 if (name) {
                    if (isAttribute(modelNode) || isDataInstance(modelNode) || isLabels (modelNode) || isSocialIssue(modelNode)) {
                        descr.push(this.descriptions.createDescription(modelNode, container.name+'.'+ name, document));
                        //name = (this.nameProvider as DomainModelNameProvider).getQualifiedName(modelNode.$container as PackageDeclaration, name);
                    }
                    descr.push(this.descriptions.createDescription(modelNode, name, document));
                 }  
             
         }
         return descr;
     }
 
 }