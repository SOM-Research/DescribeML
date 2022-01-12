"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateModule = void 0;
const langium_1 = require("langium");
const util_1 = require("./util");
function generateModule(grammars, config, grammarConfigMap) {
    const parserConfig = config.chevrotainParserConfig;
    const node = new langium_1.CompositeGeneratorNode();
    node.append(util_1.generatedHeader);
    if (config.langiumInternal) {
        node.append(`import { LanguageMetaData${parserConfig ? ', IParserConfig' : ''} } from '../..';`, langium_1.NL);
        node.append("import { Module } from '../../dependency-injection';", langium_1.NL);
        node.contents.push("import { LangiumGeneratedServices, LangiumGeneratedSharedServices, LangiumSharedServices, LangiumServices } from '../../services';", langium_1.NL);
    }
    else {
        node.append(`import { LangiumGeneratedServices, LangiumGeneratedSharedServices, LangiumSharedServices, LangiumServices, LanguageMetaData, Module${parserConfig ? ', IParserConfig' : ''} } from 'langium';`, langium_1.NL);
    }
    node.append('import { ', config.projectName, "AstReflection } from './ast';", langium_1.NL, 'import { ');
    for (let i = 0; i < grammars.length; i++) {
        const grammar = grammars[i];
        node.append(grammar.name, 'Grammar');
        if (i < grammars.length - 1) {
            node.append(', ');
        }
    }
    node.append(" } from './grammar';", langium_1.NL, langium_1.NL);
    for (const grammar of grammars) {
        const config = grammarConfigMap.get(grammar);
        node.append('export const ', grammar.name, 'LanguageMetaData: LanguageMetaData = {', langium_1.NL);
        node.indent(metaData => {
            metaData.append(`languageId: '${config.id}',`, langium_1.NL);
            metaData.append(`fileExtensions: [${config.fileExtensions && config.fileExtensions.map(e => appendQuotesAndDot(e)).join(', ')}],`, langium_1.NL);
            metaData.append(`caseInsensitive: ${!!config.caseInsensitive}`, langium_1.NL);
        });
        node.append('};', langium_1.NL, langium_1.NL);
    }
    let needsGeneralParserConfig = false;
    for (const grammar of grammars) {
        const grammarConfig = grammarConfigMap.get(grammar);
        const grammarParserConfig = grammarConfig.chevrotainParserConfig;
        if (grammarParserConfig) {
            node.append('export const ', grammar.name, 'ParserConfig: IParserConfig = ', generateParserConfig(grammarParserConfig));
        }
        else {
            needsGeneralParserConfig = true;
        }
    }
    if (needsGeneralParserConfig && parserConfig) {
        node.append('export const parserConfig: IParserConfig = ', generateParserConfig(parserConfig));
    }
    node.append('export const ', config.projectName, 'GeneratedSharedModule: Module<LangiumSharedServices, LangiumGeneratedSharedServices> = {', langium_1.NL);
    node.indent(moduleNode => {
        moduleNode.append('AstReflection: () => new ', config.projectName, 'AstReflection()', langium_1.NL);
    });
    node.append('};', langium_1.NL, langium_1.NL);
    for (let i = 0; i < grammars.length; i++) {
        const grammar = grammars[i];
        const grammarConfig = grammarConfigMap.get(grammar);
        node.append('export const ', grammar.name, 'GeneratedModule: Module<LangiumServices, LangiumGeneratedServices> = {', langium_1.NL);
        node.indent(moduleNode => {
            moduleNode.append('Grammar: () => ', grammar.name, 'Grammar(),', langium_1.NL, 'LanguageMetaData: () => ', grammar.name, 'LanguageMetaData,', langium_1.NL, 'parser: {');
            if (parserConfig) {
                moduleNode.append(langium_1.NL);
                moduleNode.indent(parserGroupNode => {
                    const parserConfigName = grammarConfig.chevrotainParserConfig
                        ? grammar.name + 'ParserConfig'
                        : 'parserConfig';
                    parserGroupNode.append('ParserConfig: () => ', parserConfigName, langium_1.NL);
                });
            }
            moduleNode.append('}', langium_1.NL);
        });
        node.append('};', langium_1.NL);
        if (i < grammars.length - 1) {
            node.append(langium_1.NL);
        }
    }
    return (0, langium_1.processGeneratorNode)(node);
}
exports.generateModule = generateModule;
function generateParserConfig(config) {
    const node = new langium_1.CompositeGeneratorNode();
    node.append('{', langium_1.NL);
    node.indent(configNode => {
        for (const [key, value] of Object.entries(config)) {
            configNode.append(`${key}: ${typeof value === 'string' ? `'${value}'` : value},`, langium_1.NL);
        }
    });
    node.append('};', langium_1.NL, langium_1.NL);
    return node;
}
function appendQuotesAndDot(input) {
    if (!input.startsWith('.')) {
        input = '.' + input;
    }
    return `'${input}'`;
}
//# sourceMappingURL=module-generator.js.map