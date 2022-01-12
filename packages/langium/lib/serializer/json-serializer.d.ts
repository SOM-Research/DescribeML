/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { AstNode } from '../syntax-tree';
import { LangiumServices } from '../services';
export interface JsonSerializer {
    serialize(node: AstNode, space?: string | number): string;
    deserialize(content: string): AstNode;
}
export declare class DefaultJsonSerializer {
    private readonly linker;
    constructor(services: LangiumServices);
    serialize(node: AstNode, space?: string | number): string;
    deserialize(content: string): AstNode;
    protected decycle(object: AstNode, ...ignore: string[]): unknown;
    protected revive(object: AstNode): AstNode;
}
//# sourceMappingURL=json-serializer.d.ts.map