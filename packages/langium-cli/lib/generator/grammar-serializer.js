"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeGrammar = void 0;
const langium_1 = require("langium");
const os_1 = require("os");
const util_1 = require("./util");
function serializeGrammar(services, grammars, config) {
    const node = new langium_1.CompositeGeneratorNode();
    node.append(util_1.generatedHeader);
    if (config.langiumInternal) {
        node.append("import { loadGrammar } from '../grammar-util';", langium_1.NL, "import { Grammar } from './ast';");
    }
    else {
        node.append("import { loadGrammar, Grammar } from 'langium';");
    }
    node.append(langium_1.NL, langium_1.NL);
    for (let i = 0; i < grammars.length; i++) {
        const grammar = grammars[i];
        // The json serializer returns strings with \n line delimiter by default
        // We need to translate these line endings to the OS specific line ending
        const json = services.serializer.JsonSerializer.serialize(grammar, 2).replace(/\\/g, '\\\\').split('\n').join(os_1.EOL);
        node.append('let loaded', grammar.name, 'Grammar: Grammar | undefined;', langium_1.NL, 'export const ', grammar.name, 'Grammar = (): Grammar => loaded', grammar.name, 'Grammar ||', '(loaded', grammar.name, 'Grammar = loadGrammar(`', json, '`));', langium_1.NL);
        if (i < grammars.length - 1) {
            node.append(langium_1.NL);
        }
    }
    return (0, langium_1.processGeneratorNode)(node);
}
exports.serializeGrammar = serializeGrammar;
//# sourceMappingURL=grammar-serializer.js.map