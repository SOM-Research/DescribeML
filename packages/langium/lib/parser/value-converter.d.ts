/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { AbstractRule } from '../grammar/generated/ast';
import { CstNode } from '../syntax-tree';
export interface ValueConverter {
    convert(input: string, cstNode: CstNode): ValueType;
}
export declare type ValueType = string | number | boolean | bigint | Date;
export declare class DefaultValueConverter implements ValueConverter {
    convert(input: string, cstNode: CstNode): ValueType;
    protected runConverter(rule: AbstractRule, input: string, cstNode: CstNode): ValueType;
}
export declare function convertString(input: string): string;
export declare function convertID(input: string): string;
export declare function convertInt(input: string): number;
export declare function convertNumber(input: string): number;
export declare function convertBoolean(input: string): boolean;
//# sourceMappingURL=value-converter.d.ts.map