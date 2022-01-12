/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { CodeActionParams } from 'vscode-languageserver-protocol';
import { CodeAction, Command } from 'vscode-languageserver-types';
import { CodeActionProvider } from '../lsp/code-action';
import { MaybePromise } from '../utils/promise-util';
import { LangiumDocument } from '../workspace/documents';
export declare class LangiumGrammarCodeActionProvider implements CodeActionProvider {
    getCodeActions(document: LangiumDocument, params: CodeActionParams): MaybePromise<Array<Command | CodeAction>>;
    private createCodeAction;
    private fixUnnecessaryFileExtension;
    private fixMissingImport;
    private makeUpperCase;
    private addEntryKeyword;
    private fixRegexTokens;
    private fixCrossRefSyntax;
    private fixHiddenTerminals;
}
//# sourceMappingURL=langium-grammar-code-actions.d.ts.map