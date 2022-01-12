"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const langium_1 = require("langium");
const path_1 = __importDefault(require("path"));
const vscode_uri_1 = require("vscode-uri");
const ast_generator_1 = require("./generator/ast-generator");
const grammar_serializer_1 = require("./generator/grammar-serializer");
const module_generator_1 = require("./generator/module-generator");
const textmate_generator_1 = require("./generator/textmate-generator");
const util_1 = require("./generator/util");
const package_1 = require("./package");
const parser_validation_1 = require("./parser-validation");
const { shared: sharedServices, grammar: grammarServices } = (0, langium_1.createLangiumGrammarServices)();
const documents = sharedServices.workspace.LangiumDocuments;
function eagerLoad(document, uris = new Set()) {
    const uriString = document.uri.toString();
    if (!uris.has(uriString)) {
        uris.add(uriString);
        const grammar = document.parseResult.value;
        if ((0, langium_1.isGrammar)(grammar)) {
            for (const imp of grammar.imports) {
                const importedGrammar = (0, langium_1.resolveImport)(documents, imp);
                if (importedGrammar) {
                    const importedDoc = (0, langium_1.getDocument)(importedGrammar);
                    eagerLoad(importedDoc, uris);
                }
            }
        }
    }
    return Array.from(uris).map(e => vscode_uri_1.URI.parse(e));
}
/**
 * Creates a map that contains all rules of all grammars.
 * This includes both input grammars and their transitive dependencies.
 */
function mapRules(grammars, visited = new Set(), map = new Map()) {
    for (const grammar of grammars) {
        const doc = (0, langium_1.getDocument)(grammar);
        const uriString = doc.uri.toString();
        if (!visited.has(uriString)) {
            visited.add(uriString);
            map.set(grammar, grammar.rules.map(e => {
                // Create a new array of rules and copy all rules
                // Also deactivate all entry rules
                const shallowCopy = Object.assign({}, e);
                if ((0, langium_1.isParserRule)(shallowCopy)) {
                    shallowCopy.entry = false;
                }
                return shallowCopy;
            }));
            const importedGrammars = grammar.imports.map(e => (0, langium_1.resolveImport)(documents, e));
            mapRules(importedGrammars, visited, map);
        }
    }
    return map;
}
function embedReferencedRules(grammar, map) {
    const allGrammars = (0, langium_1.resolveTransitiveImports)(documents, grammar);
    for (const importedGrammar of allGrammars) {
        const rules = map.get(importedGrammar);
        if (rules) {
            grammar.rules.push(...rules);
        }
    }
}
function buildAll(config) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const doc of documents.all) {
            documents.invalidateDocument(doc.uri);
        }
        const map = new Map();
        const relPath = config[package_1.RelativePath];
        for (const languageConfig of config.languages) {
            const absGrammarPath = vscode_uri_1.URI.file(path_1.default.resolve(relPath, languageConfig.grammar));
            const document = documents.getOrCreateDocument(absGrammarPath);
            const allUris = eagerLoad(document);
            yield sharedServices.workspace.DocumentBuilder.update(allUris, []);
        }
        for (const doc of documents.all) {
            const buildResult = yield sharedServices.workspace.DocumentBuilder.build(doc);
            map.set(doc.uri.fsPath, buildResult);
        }
        return map;
    });
}
function generate(config, options) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!config.languages || config.languages.length === 0) {
            (0, util_1.log)('error', options, 'No languages specified in config.');
            return 'failure';
        }
        const all = yield buildAll(config);
        let hasErrors = false;
        for (const [path, buildResult] of all) {
            const diagnostics = buildResult.diagnostics;
            for (const diagnostic of diagnostics) {
                const message = `${vscode_uri_1.Utils.basename(vscode_uri_1.URI.file(path))}:${diagnostic.range.start.line + 1}:${diagnostic.range.start.character + 1} - ${diagnostic.message}`;
                if (diagnostic.severity === 1) {
                    (0, util_1.log)('error', options, message.red);
                }
                else if (diagnostic.severity === 2) {
                    (0, util_1.log)('warn', options, message.yellow);
                }
                else {
                    (0, util_1.log)('log', options, message);
                }
            }
            if (!hasErrors) {
                hasErrors = diagnostics.length > 0 && diagnostics.some(e => e.severity === 1);
            }
        }
        if (hasErrors) {
            (0, util_1.log)('error', options, `Langium generator ${'failed'.red.bold}.`);
            return 'failure';
        }
        const grammars = [];
        const configMap = new Map();
        const relPath = config[package_1.RelativePath];
        for (const languageConfig of config.languages) {
            const absGrammarPath = vscode_uri_1.URI.file(path_1.default.resolve(relPath, languageConfig.grammar)).fsPath;
            const buildResult = all.get(absGrammarPath);
            if (buildResult) {
                const grammar = buildResult.document.parseResult.value;
                grammars.push(grammar);
                configMap.set(grammar, languageConfig);
            }
        }
        const ruleMap = mapRules(grammars);
        for (const grammar of grammars) {
            embedReferencedRules(grammar, ruleMap);
            // Create and validate the in-memory parser
            const parserAnalysis = (0, parser_validation_1.validateParser)(grammar, config);
            if (parserAnalysis instanceof Error) {
                (0, util_1.log)('error', options, parserAnalysis.toString().red);
                return 'failure';
            }
        }
        // Generate the output files
        const output = path_1.default.resolve(relPath, (_a = config.out) !== null && _a !== void 0 ? _a : 'src/generated');
        (0, util_1.log)('log', options, `Writing generated files to ${output.white.bold}`);
        if (yield rmdirWithFail(output, ['ast.ts', 'grammar.ts', 'module.ts'], options)) {
            return 'failure';
        }
        if (yield mkdirWithFail(output, options)) {
            return 'failure';
        }
        const genAst = (0, ast_generator_1.generateAst)(grammarServices, grammars, config);
        yield writeWithFail(path_1.default.resolve(output, 'ast.ts'), genAst, options);
        const serializedGrammar = (0, grammar_serializer_1.serializeGrammar)(grammarServices, grammars, config);
        yield writeWithFail(path_1.default.resolve(output, 'grammar.ts'), serializedGrammar, options);
        const genModule = (0, module_generator_1.generateModule)(grammars, config, configMap);
        yield writeWithFail(path_1.default.resolve(output, 'module.ts'), genModule, options);
        for (const grammar of grammars) {
            const languageConfig = configMap.get(grammar);
            if (languageConfig === null || languageConfig === void 0 ? void 0 : languageConfig.textMate) {
                const genTmGrammar = (0, textmate_generator_1.generateTextMate)(grammar, languageConfig);
                const textMatePath = path_1.default.resolve(relPath, languageConfig.textMate.out);
                (0, util_1.log)('log', options, `Writing textmate grammar to ${textMatePath.white.bold}`);
                const parentDir = path_1.default.dirname(textMatePath).split(path_1.default.sep).pop();
                parentDir && (yield mkdirWithFail(parentDir, options));
                yield writeWithFail(textMatePath, genTmGrammar, options);
            }
        }
        return 'success';
    });
}
exports.generate = generate;
function rmdirWithFail(dirPath, expectedFiles, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let deleteDir = true;
            const dirExists = yield fs_extra_1.default.pathExists(dirPath);
            if (dirExists) {
                const existingFiles = yield fs_extra_1.default.readdir(dirPath);
                const unexpectedFiles = existingFiles.filter(file => !expectedFiles.includes(path_1.default.basename(file)));
                if (unexpectedFiles.length > 0) {
                    (0, util_1.log)('log', options, `Found unexpected files in the generated directory: ${unexpectedFiles.map(e => e.yellow).join(', ')}`);
                    deleteDir = (yield (0, util_1.getUserChoice)('Do you want to delete the files?', ['yes', 'no'], 'yes')) === 'yes';
                }
                if (deleteDir) {
                    yield fs_extra_1.default.remove(dirPath);
                }
            }
            return false;
        }
        catch (e) {
            (0, util_1.log)('error', options, `Failed to delete directory ${dirPath.red.bold}`, e);
            return true;
        }
    });
}
function mkdirWithFail(path, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs_extra_1.default.mkdirs(path);
            return false;
        }
        catch (e) {
            (0, util_1.log)('error', options, `Failed to create directory ${path.red.bold}`, e);
            return true;
        }
    });
}
function writeWithFail(path, content, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs_extra_1.default.writeFile(path, content);
        }
        catch (e) {
            (0, util_1.log)('error', options, `Failed to write file to ${path.red.bold}`, e);
        }
    });
}
//# sourceMappingURL=generate.js.map