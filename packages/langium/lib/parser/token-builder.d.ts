/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { TokenPattern, TokenType } from 'chevrotain';
import { Grammar, Keyword, TerminalRule } from '../grammar/generated/ast';
export interface TokenBuilder {
    buildTokens(grammar: Grammar, options?: {
        caseInsensitive?: boolean;
    }): TokenType[];
}
export declare class DefaultTokenBuilder implements TokenBuilder {
    protected readonly KEYWORD_SUFFIX = "_KEYWORD";
    protected readonly TERMINAL_SUFFIX = "_TERMINAL";
    buildTokens(grammar: Grammar, options?: {
        caseInsensitive?: boolean;
    }): TokenType[];
    protected buildTerminalToken(terminal: TerminalRule): TokenType;
    protected buildKeywordToken(keyword: Keyword, keywords: Keyword[], terminals: TerminalRule[], tokenMap: Map<string, TokenType>, caseInsensitive: boolean): TokenType;
    protected buildKeywordPattern(keyword: Keyword, caseInsensitive: boolean): TokenPattern;
    protected findLongerAlt(keyword: Keyword, keywords: Keyword[], terminals: TerminalRule[], tokenMap: Map<string, TokenType>): TokenType[];
}
//# sourceMappingURL=token-builder.d.ts.map