/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken, CodeDescription, DiagnosticRelatedInformation, DiagnosticTag, integer, Range } from 'vscode-languageserver';
import { LangiumServices } from '../services';
import { AstNode, Properties } from '../syntax-tree';
import { MaybePromise } from '../utils/promise-util';
export declare type DiagnosticInfo<N extends AstNode, P = Properties<N>> = {
    /** The AST node to which the diagnostic is attached. */
    node: N;
    /** If a property name is given, the diagnostic is resticted to the corresponding text region. */
    property?: P;
    /** In case of a multi-value property (array), an index can be given to select a specific element. */
    index?: number;
    /** If you want to create a diagnostic independent to any property, use the range property. */
    range?: Range;
    /** The diagnostic's code, which usually appear in the user interface. */
    code?: integer | string;
    /** An optional property to describe the error code. */
    codeDescription?: CodeDescription;
    /** Additional metadata about the diagnostic. */
    tags?: DiagnosticTag[];
    /** An array of related diagnostic information, e.g. when symbol-names within a scope collide all definitions can be marked via this property. */
    relatedInformation?: DiagnosticRelatedInformation[];
    /** A data entry field that is preserved between a `textDocument/publishDiagnostics` notification and `textDocument/codeAction` request. */
    data?: unknown;
};
export declare type ValidationAcceptor = <N extends AstNode>(severity: 'error' | 'warning' | 'info' | 'hint', message: string, info: DiagnosticInfo<N>) => void;
export declare type ValidationCheck = (node: any, accept: ValidationAcceptor, cancelToken: CancellationToken) => MaybePromise<void>;
export declare class ValidationRegistry {
    private readonly validationChecks;
    private readonly reflection;
    constructor(services: LangiumServices);
    register(checksRecord: {
        [type: string]: ValidationCheck | ValidationCheck[] | undefined;
    }, thisObj?: ThisParameterType<unknown>): void;
    protected wrapValidationException(check: ValidationCheck, thisObj: unknown): ValidationCheck;
    protected doRegister(type: string, check: ValidationCheck): void;
    getChecks(type: string): readonly ValidationCheck[];
}
//# sourceMappingURL=validation-registry.d.ts.map