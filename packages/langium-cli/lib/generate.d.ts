/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { LangiumConfig } from './package';
export declare type GenerateOptions = {
    file?: string;
    watch: boolean;
};
export declare type GeneratorResult = 'success' | 'failure';
export declare function generate(config: LangiumConfig, options: GenerateOptions): Promise<GeneratorResult>;
//# sourceMappingURL=generate.d.ts.map