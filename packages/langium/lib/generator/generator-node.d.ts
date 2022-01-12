/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
export declare type GeneratorNode = CompositeGeneratorNode | IndentNode | NewLineNode | string;
export declare class CompositeGeneratorNode {
    readonly contents: GeneratorNode[];
    constructor(...contents: GeneratorNode[]);
    append(...args: Array<GeneratorNode | ((node: CompositeGeneratorNode) => void)>): CompositeGeneratorNode;
    indent(func?: (indentNode: IndentNode) => void): CompositeGeneratorNode;
}
export declare class IndentNode extends CompositeGeneratorNode {
    indentation?: string;
    indentImmediately: boolean;
    indentEmptyLines: boolean;
    constructor(indentation?: string | number, indentImmediately?: boolean, indentEmptyLines?: boolean);
}
export declare class NewLineNode {
    lineDelimiter: string;
    ifNotEmpty: boolean;
    constructor(lineDelimiter?: string, ifNotEmpty?: boolean);
}
export declare const NL: NewLineNode;
export declare const NLEmpty: NewLineNode;
//# sourceMappingURL=generator-node.d.ts.map