/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken, Hover, HoverParams } from 'vscode-languageserver';
import { GrammarConfig } from '../grammar/grammar-config';
import { References } from '../references/references';
import { LangiumServices } from '../services';
import { AstNode } from '../syntax-tree';
import { MaybePromise } from '../utils/promise-util';
import { LangiumDocument } from '../workspace/documents';
export interface HoverProvider {
    /**
     * Handle a hover request.
     *
     * @throws `OperationCancelled` if cancellation is detected during execution
     * @throws `ResponseError` if an error is detected that should be sent as response to the client
     */
    getHoverContent(document: LangiumDocument, params: HoverParams, cancelToken?: CancellationToken): MaybePromise<Hover | undefined>;
}
export declare abstract class AstNodeHoverProvider implements HoverProvider {
    protected readonly references: References;
    constructor(services: LangiumServices);
    getHoverContent(document: LangiumDocument, params: HoverParams): MaybePromise<Hover | undefined>;
    protected abstract getAstNodeHoverContent(node: AstNode): MaybePromise<Hover | undefined>;
}
export declare class MultilineCommentHoverProvider extends AstNodeHoverProvider {
    protected readonly commentContentRegex: RegExp;
    protected readonly grammarConfig: GrammarConfig;
    constructor(services: LangiumServices);
    protected getAstNodeHoverContent(node: AstNode): MaybePromise<Hover | undefined>;
    protected getCommentContent(commentText: string): string;
}
//# sourceMappingURL=hover-provider.d.ts.map