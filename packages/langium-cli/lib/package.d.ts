/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import type { IParserConfig } from 'langium';
import type { GenerateOptions } from './generate';
export interface Package {
    name: string;
    version: string;
    langium: LangiumConfig;
}
export declare const RelativePath: unique symbol;
export interface LangiumConfig {
    /** Relative path to the directory of the config */
    [RelativePath]: string;
    projectName: string;
    languages: LangiumLanguageConfig[];
    /** Main output directory for TypeScript code */
    out?: string;
    chevrotainParserConfig?: IParserConfig;
    /** The following option is meant to be used only by Langium itself */
    langiumInternal?: boolean;
}
export interface LangiumLanguageConfig {
    /** The identifier of your language as used in vscode */
    id: string;
    /** Path to the grammar file */
    grammar: string;
    /** File extensions with leading `.` */
    fileExtensions?: string[];
    /** Enable case-insensitive keywords parsing */
    caseInsensitive?: boolean;
    /** Enable generating a TextMate syntax highlighting file */
    textMate?: {
        /** Output path to syntax highlighting file */
        out: string;
    };
    /** Configure the chevrotain parser */
    chevrotainParserConfig?: IParserConfig;
}
export declare function loadConfigs(options: GenerateOptions): Promise<LangiumConfig[]>;
//# sourceMappingURL=package.d.ts.map