
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

 import { DefaultNameProvider } from 'langium';
 import { isDeclaration, Declaration } from './generated/ast';
 
 export function toQualifiedName(pack: Declaration, childName: string): string {
     return (isDeclaration(pack.$container) ? toQualifiedName(pack.$container, pack.name) : pack.name) + '.' + childName;
 }
 
 export class DatasetDescriptorNameProvider extends DefaultNameProvider {
 
     /**
      * @param qualifier if the qualifier is a `string`, simple string concatenation is done: `qualifier.name`.
      *      if the qualifier is a `PackageDeclaration` fully qualified name is created: `package1.package2.name`.
      * @param name simple name
      * @returns qualified name separated by `.`
      */
     getQualifiedName(qualifier: Declaration | string, name: string): string {
         let prefix = qualifier;
         if (isDeclaration(prefix)) {
             prefix = (isDeclaration(prefix.$container)
                 ? this.getQualifiedName(prefix.$container, prefix.name) : prefix.name);
         }
         return (prefix ? prefix + '.' : '') + name;
     }
 
 }