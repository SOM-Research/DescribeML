/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CancellationToken, Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { Range } from 'vscode-languageserver-textdocument';
import { LangiumServices } from '../services';
import { AstNode } from '../syntax-tree';
import { LangiumDocument } from '../workspace/documents';
import { DiagnosticInfo, ValidationRegistry } from './validation-registry';
export interface DocumentValidator {
    /**
     * Validates the whole specified document.
     * @param document specified document to validate
     * @param cancelToken allows to cancel the current operation
     * @throws `OperationCanceled` if a user action occurs during execution
     */
    validateDocument(document: LangiumDocument, cancelToken?: CancellationToken): Promise<Diagnostic[]>;
}
export declare class DefaultDocumentValidator {
    protected readonly validationRegistry: ValidationRegistry;
    constructor(services: LangiumServices);
    validateDocument(document: LangiumDocument, cancelToken?: CancellationToken): Promise<Diagnostic[]>;
    protected validateAst(rootNode: AstNode, document: LangiumDocument, cancelToken?: CancellationToken): Promise<Diagnostic[]>;
    protected toDiagnostic<N extends AstNode>(severity: 'error' | 'warning' | 'info' | 'hint', message: string, info: DiagnosticInfo<N, string>): Diagnostic;
}
export declare function getDiagnosticRange<N extends AstNode>(info: DiagnosticInfo<N, string>): Range;
export declare function toDiagnosticSeverity(severity: 'error' | 'warning' | 'info' | 'hint'): DiagnosticSeverity;
//# sourceMappingURL=document-validator.d.ts.map