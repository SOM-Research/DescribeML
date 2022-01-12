"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParser = void 0;
const langium_1 = require("langium");
function validateParser(grammar, config) {
    const parserConfig = Object.assign(Object.assign({}, config.chevrotainParserConfig), { skipValidations: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unavailable = () => ({});
    const generatedSharedModule = {
        AstReflection: unavailable,
    };
    const generatedModule = {
        Grammar: () => grammar,
        LanguageMetaData: unavailable,
        parser: {
            ParserConfig: () => parserConfig
        }
    };
    const shared = (0, langium_1.inject)((0, langium_1.createDefaultSharedModule)(), generatedSharedModule);
    const services = (0, langium_1.inject)((0, langium_1.createDefaultModule)({ shared }), generatedModule);
    try {
        (0, langium_1.createLangiumParser)(services);
        return undefined;
    }
    catch (err) {
        if (err instanceof Error) {
            return err;
        }
        throw err;
    }
}
exports.validateParser = validateParser;
//# sourceMappingURL=parser-validation.js.map