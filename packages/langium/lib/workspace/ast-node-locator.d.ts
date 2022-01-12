/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { AstNode } from '../syntax-tree';
import { LangiumDocument } from './documents';
export interface AstNodeLocator {
    /**
     * Creates a path represented by a `string` that identifies an `AstNode` inside its document.
     * It must be possible to retrieve exactly the same `AstNode` from the document using this path.
     *
     * @param node The `AstNode` for which to create the path.
     * @returns a path represented by a `string` that identifies `node` inside its document.
     * @see AstNodeLocator.getAstNode
     */
    getAstNodePath(node: AstNode): string;
    /**
     * Locates an `AstNode` inside a document by following the given path.
     *
     * @param document The document in which to look up.
     * @param path Describes how to locate the `AstNode` inside the given `document`.
     * @returns The `AstNode` located under the given path, or `undefined` if the path cannot be resolved.
     * @see AstNodeLocator.getAstNodePath
     */
    getAstNode(document: LangiumDocument, path: string): AstNode | undefined;
}
export declare class DefaultAstNodeLocator implements AstNodeLocator {
    protected segmentSeparator: string;
    protected indexSeparator: string;
    getAstNodePath(node: AstNode): string;
    protected getPathSegment(node: AstNode, container: AstNode): string;
    getAstNode(document: LangiumDocument, path: string): AstNode | undefined;
}
//# sourceMappingURL=ast-node-locator.d.ts.map