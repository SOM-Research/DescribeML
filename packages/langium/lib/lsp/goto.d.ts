/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken, DefinitionParams, LocationLink } from 'vscode-languageserver';
import { NameProvider } from '../references/naming';
import { References } from '../references/references';
import { LangiumServices } from '../services';
import { CstNode } from '../syntax-tree';
import { MaybePromise } from '../utils/promise-util';
import { LangiumDocument } from '../workspace/documents';
export interface GoToResolver {
    /**
     * Handle a go to definition request.
     *
     * @throws `OperationCancelled` if cancellation is detected during execution
     * @throws `ResponseError` if an error is detected that should be sent as response to the client
     */
    goToDefinition(document: LangiumDocument, params: DefinitionParams, cancelToken?: CancellationToken): MaybePromise<LocationLink[] | undefined>;
}
export declare class DefaultGoToResolverProvider implements GoToResolver {
    protected readonly nameProvider: NameProvider;
    protected readonly references: References;
    constructor(services: LangiumServices);
    goToDefinition(document: LangiumDocument, params: DefinitionParams): MaybePromise<LocationLink[] | undefined>;
    protected findActualNodeFor(cstNode: CstNode): CstNode | undefined;
}
//# sourceMappingURL=goto.d.ts.map