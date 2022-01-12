/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken, Location, ReferenceParams } from 'vscode-languageserver';
import { NameProvider } from '../references/naming';
import { References } from '../references/references';
import { LangiumServices } from '../services';
import { AstNode, CstNode } from '../syntax-tree';
import { MaybePromise } from '../utils/promise-util';
import { LangiumDocument } from '../workspace/documents';
export interface ReferenceFinder {
    /**
     * Handle a find references request.
     *
     * @throws `OperationCancelled` if cancellation is detected during execution
     * @throws `ResponseError` if an error is detected that should be sent as response to the client
     */
    findReferences(document: LangiumDocument, params: ReferenceParams, cancelToken?: CancellationToken): MaybePromise<Location[]>;
}
export declare class DefaultReferenceFinder implements ReferenceFinder {
    protected readonly nameProvider: NameProvider;
    protected readonly references: References;
    constructor(services: LangiumServices);
    findReferences(document: LangiumDocument, params: ReferenceParams): MaybePromise<Location[]>;
    protected findNameNode(node: AstNode, name: string): CstNode | undefined;
}
//# sourceMappingURL=reference-finder.d.ts.map