/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import * as langium from 'langium';
import { LangiumLanguageConfig } from '../package';
export interface TextMateGrammar {
    repository: Repository;
    readonly scopeName: string;
    readonly patterns: Pattern[];
    readonly injections?: {
        [expression: string]: Pattern;
    };
    readonly injectionSelector?: string;
    readonly fileTypes?: string[];
    readonly name?: string;
    readonly firstLineMatch?: string;
}
export interface Repository {
    [name: string]: Pattern;
}
export interface Pattern {
    id?: number;
    readonly include?: string;
    readonly name?: string;
    readonly contentName?: string;
    readonly match?: string;
    readonly captures?: Captures;
    readonly begin?: string;
    readonly beginCaptures?: Captures;
    readonly end?: string;
    readonly endCaptures?: Captures;
    readonly while?: string;
    readonly whileCaptures?: Captures;
    readonly patterns?: Pattern[];
    readonly repository?: Repository;
    readonly applyEndPatternLast?: boolean;
}
export interface Captures {
    [captureId: string]: Pattern;
}
export declare function generateTextMate(grammar: langium.Grammar, config: LangiumLanguageConfig): string;
//# sourceMappingURL=textmate-generator.d.ts.map