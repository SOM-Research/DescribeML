/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import * as langium from 'langium';
import type { GenerateOptions } from '../generate';
export declare function log(level: 'log' | 'warn' | 'error', options: GenerateOptions, message: string, ...args: any[]): void;
export declare function elapsedTime(): string;
export declare function getTime(): string;
export declare function collectKeywords(grammar: langium.Grammar): string[];
export declare function getUserInput(text: string): Promise<string>;
export declare function getUserChoice<R extends string>(text: string, values: R[], defaultValue: R, lowerCase?: boolean): Promise<R>;
export declare const cliVersion: string;
export declare const generatedHeader: langium.GeneratorNode;
export declare const schema: Promise<any>;
//# sourceMappingURL=util.d.ts.map