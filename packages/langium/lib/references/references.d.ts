/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { LangiumServices } from '../services';
import { AstNode, CstNode, Reference } from '../syntax-tree';
import { Stream } from '../utils/stream';
import { ReferenceDescription } from '../workspace/ast-descriptions';
import { AstNodeLocator } from '../workspace/ast-node-locator';
import { IndexManager } from '../workspace/index-manager';
import { NameProvider } from './naming';
export interface References {
    /**
     * If the CstNode is a reference node the target CstNode will be returned.
     * If the CstNode is a significant node of the CstNode this CstNode will be returned.
     *
     * @param sourceCstNode CstNode that points to a AstNode
     */
    findDeclaration(sourceCstNode: CstNode): CstNode | undefined;
    /**
     * Finds all references to the target node as references (local references) or reference descriptions.
     *
     * @param targetNode Specified target node whose references should be returned
     */
    findReferences(targetNode: AstNode): Stream<ReferenceDescription>;
}
export declare class DefaultReferences implements References {
    protected readonly nameProvider: NameProvider;
    protected readonly index: IndexManager;
    protected readonly nodeLocator: AstNodeLocator;
    constructor(services: LangiumServices);
    findDeclaration(sourceCstNode: CstNode): CstNode | undefined;
    findReferences(targetNode: AstNode): Stream<ReferenceDescription>;
    protected processReference(reference: Reference): CstNode | undefined;
}
//# sourceMappingURL=references.d.ts.map