/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import * as langium from 'langium';
import { LangiumDocuments } from 'langium';
declare type Field = {
    name: string;
    array: boolean;
    optional: boolean;
    types: string[];
    reference: boolean;
};
export declare class Interface {
    name: string;
    superTypes: string[];
    subTypes: string[];
    containerTypes: string[];
    fields: Field[];
    constructor(name: string, superTypes: string[], fields: Field[]);
    toString(): string;
}
export declare function collectAst(documents: LangiumDocuments, grammars: langium.Grammar[]): Interface[];
export {};
//# sourceMappingURL=type-collector.d.ts.map