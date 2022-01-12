/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { Linker } from '../references/linker';
import { NameProvider } from '../references/naming';
import { LangiumServices } from '../services';
import { AstNode, AstNodeDescription } from '../syntax-tree';
import { AstNodeLocator } from './ast-node-locator';
import { DocumentSegment, LangiumDocument } from './documents';
export interface ReferenceDescription {
    /** URI of the document that holds a reference */
    sourceUri: URI;
    /** Path to AstNode that holds a reference */
    sourcePath: string;
    /** Target document uri */
    targetUri: URI;
    /** Path to the target AstNode inside the document */
    targetPath: string;
    /** Segment of the reference text. */
    segment: DocumentSegment;
    /** Marks a local reference i.e. a cross reference inside a document.   */
    local?: boolean;
}
export interface AstNodeDescriptionProvider {
    createDescription(node: AstNode, name: string, document: LangiumDocument, cancelToken?: CancellationToken): AstNodeDescription;
    createDescriptions(document: LangiumDocument, cancelToken?: CancellationToken): Promise<AstNodeDescription[]>;
}
export interface ReferenceDescriptionProvider {
    createDescriptions(document: LangiumDocument, cancelToken?: CancellationToken): Promise<ReferenceDescription[]>;
}
export declare class DefaultAstNodeDescriptionProvider implements AstNodeDescriptionProvider {
    protected readonly astNodeLocator: AstNodeLocator;
    protected readonly nameProvider: NameProvider;
    constructor(services: LangiumServices);
    createDescription(node: AstNode, name: string, document: LangiumDocument): AstNodeDescription;
    createDescriptions(document: LangiumDocument, cancelToken?: CancellationToken): Promise<AstNodeDescription[]>;
}
export declare class DefaultReferenceDescriptionProvider implements ReferenceDescriptionProvider {
    protected readonly linker: Linker;
    protected readonly nodeLocator: AstNodeLocator;
    constructor(services: LangiumServices);
    createDescriptions(document: LangiumDocument, cancelToken?: CancellationToken): Promise<ReferenceDescription[]>;
}
//# sourceMappingURL=ast-descriptions.d.ts.map