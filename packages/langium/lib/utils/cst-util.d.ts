/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { IToken } from '@chevrotain/types';
import { Range } from 'vscode-languageserver';
import { AstNode, CstNode, LeafCstNode } from '../syntax-tree';
import { DocumentSegment } from '../workspace/documents';
import { TreeStream } from './stream';
export declare function streamCst(node: CstNode): TreeStream<CstNode>;
export declare function flatten(node: CstNode): LeafCstNode[];
export declare function tokenToRange(token: IToken): Range;
export declare function toDocumentSegment(node: CstNode): DocumentSegment;
export declare function findRelevantNode(cstNode: CstNode): AstNode | undefined;
export declare function findCommentNode(cstNode: CstNode | undefined, commentNames: string[]): CstNode | undefined;
//# sourceMappingURL=cst-util.d.ts.map