/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { IToken, TokenType } from 'chevrotain';
import { Range } from 'vscode-languageserver-types';
import { AbstractElement } from '../grammar/generated/ast';
import { AstNode, CompositeCstNode, CstNode, LeafCstNode } from '../syntax-tree';
export declare class CstNodeBuilder {
    private rootNode;
    private nodeStack;
    private get current();
    buildRootNode(input: string): void;
    buildCompositeNode(feature: AbstractElement): CompositeCstNode;
    buildLeafNode(token: IToken, feature: AbstractElement): LeafCstNode;
    construct(item: {
        $type: string | symbol | undefined;
        $cstNode: CstNode;
    }): void;
}
export declare abstract class AbstractCstNode implements CstNode {
    abstract get offset(): number;
    abstract get length(): number;
    abstract get end(): number;
    abstract get range(): Range;
    parent?: CompositeCstNode;
    feature: AbstractElement;
    root: RootCstNodeImpl;
    private _element;
    get hidden(): boolean;
    get element(): AstNode;
    set element(value: AstNode);
    get text(): string;
}
export declare class LeafCstNodeImpl extends AbstractCstNode implements LeafCstNode {
    get offset(): number;
    get length(): number;
    get end(): number;
    get hidden(): boolean;
    get tokenType(): TokenType;
    get range(): Range;
    private _hidden;
    private _offset;
    private _length;
    private _range;
    private _tokenType;
    constructor(offset: number, length: number, range: Range, tokenType: TokenType, hidden?: boolean);
}
export declare class CompositeCstNodeImpl extends AbstractCstNode implements CompositeCstNode {
    get offset(): number;
    get length(): number;
    get end(): number;
    get range(): Range;
    private get firstNonHiddenNode();
    private get lastNonHiddenNode();
    readonly children: CstNode[];
}
export declare class RootCstNodeImpl extends CompositeCstNodeImpl {
    private _text;
    set text(value: string);
    get text(): string;
    get offset(): number;
    get length(): number;
    constructor(input?: string);
}
//# sourceMappingURL=cst-node-builder.d.ts.map