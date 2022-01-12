/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken } from 'vscode-languageserver';
import { AstNode, LangiumDocument, LangiumDocuments, LangiumServices } from 'langium';
import { GeneratorArguments, IDiagramGenerator, SModelRoot } from 'sprotty-protocol';
/**
 * Additional arguments that can be passed to `LangiumDiagramGenerator` implementations.
 * If any of these are missing, they are added so the implementations can rely on a `LangiumDocument` etc.
 */
export interface LangiumDiagramGeneratorArguments extends GeneratorArguments {
    document?: LangiumDocument;
    cancelToken?: CancellationToken;
    idCache?: IdCache;
}
/**
 * Context data for generating diagram models.
 */
export interface GeneratorContext<T extends AstNode = AstNode> extends LangiumDiagramGeneratorArguments {
    document: LangiumDocument<T>;
    cancelToken: CancellationToken;
    idCache: IdCache;
}
/**
 * Abstract superclass for diagram model generators.
 */
export declare abstract class LangiumDiagramGenerator implements IDiagramGenerator {
    protected readonly langiumDocuments: LangiumDocuments;
    constructor(services: LangiumServices);
    /**
     * Builds a `GeneratorContext` and calls `generateRoot` with it.
     */
    generate(args: LangiumDiagramGeneratorArguments): SModelRoot | Promise<SModelRoot>;
    /**
     * Implement this method to generate a diagram model tree, represented by its root element.
     */
    protected abstract generateRoot(args: GeneratorContext): SModelRoot | Promise<SModelRoot>;
}
/**
 * Generate unique IDs for model elements.
 *
 * In Sprotty, it's the diagram implementor's responsibility to create unique IDs for SModel elements.
 * For consistent animations on model updates, these IDs should be based on properties of the
 * underlying model in a way that they are resilient to reordering.
 *
 * This class makes sure these IDs are unique, and allows to look them up for a given model element in
 * order to establish cross references in the SModel, e.g. for `sourceId` and `targetId` of an SEdge.
 *
 * Default implementation: `IdCacheImpl`
 */
export interface IdCache<T = AstNode> {
    /**
     * Create a unique ID based on the given proposal and optionally associated with a source element.
     * _Note:_ For a consistent mapping of source elements to diagram model elements, the proposed IDs
     * should already be as unique as possible.
     *
     * @param idProposal A proposed string to use as ID. This will become a prefix of the actually assigned ID.
     * @param element If present, the created ID is associated to this source element so it can be queried
     *        with `getId` afterwards.
     */
    uniqueId(idProposal: string, element?: T): string;
    /**
     * Returns `true` if the given ID has already been assigned with a previous call to `uniqueId`,
     * and `false` otherwise.
     *
     * @param id The ID string to test
     */
    isIdAlreadyUsed(id: string): boolean;
    /**
     * Return a previously assigned ID of the given element, if present. IDs can be assigned to source
     * elements by passing these elements as arguments to `uniqueId`.
     *
     * @param element A source element to look up.
     */
    getId(element: T | undefined): string | undefined;
}
export declare class IdCacheImpl<T = AstNode> implements IdCache<T> {
    protected readonly id2element: Map<string, T>;
    protected readonly element2id: Map<T, string>;
    protected readonly otherIds: Set<string>;
    uniqueId(idProposal: string, element?: T): string;
    isIdAlreadyUsed(id: string): boolean;
    getId(element: T | undefined): string | undefined;
}
//# sourceMappingURL=diagram-generator.d.ts.map