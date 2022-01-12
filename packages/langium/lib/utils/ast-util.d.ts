/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken } from 'vscode-languageserver';
import { AstNode, AstNodeDescription, CstNode, LeafCstNode, LinkingError, Reference, ReferenceInfo } from '../syntax-tree';
import { Stream, TreeStream } from '../utils/stream';
import { LangiumDocument } from '../workspace/documents';
export declare type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
export declare function isAstNode(obj: unknown): obj is AstNode;
export declare function isReference(obj: unknown): obj is Reference;
export declare function isAstNodeDescription(obj: unknown): obj is AstNodeDescription;
export declare function isLinkingError(obj: unknown): obj is LinkingError;
export declare function getContainerOfType<T extends AstNode>(node: AstNode | undefined, typePredicate: (n: AstNode) => n is T): T | undefined;
export declare function hasContainerOfType(node: AstNode | undefined, predicate: (n: AstNode) => boolean): boolean;
export declare function getDocument<T extends AstNode = AstNode>(node: AstNode): LangiumDocument<T>;
export interface AstNodeContent {
    node: AstNode;
    property: string;
    index?: number;
}
export declare function streamContents(node: AstNode): Stream<AstNodeContent>;
export declare function streamAllContents(node: AstNode): TreeStream<AstNodeContent>;
export declare function streamReferences(node: AstNode): Stream<ReferenceInfo>;
export declare function resolveAllReferences(node: AstNode, cancelToken?: CancellationToken): Promise<void>;
export declare function findLeafNodeAtOffset(node: CstNode, offset: number): LeafCstNode | undefined;
/**
 * Returns a Stream of references to the target node from the AstNode tree
 *
 * @param targetNode AstNode we are looking for
 * @param lookup AstNode where we search for references. If not provided, the root node of the document is used as the default value
 */
export declare function findLocalReferences(targetNode: AstNode, lookup?: AstNode): Stream<Reference>;
//# sourceMappingURL=ast-util.d.ts.map