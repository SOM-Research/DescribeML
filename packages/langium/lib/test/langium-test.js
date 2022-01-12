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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDocument = exports.expectHover = exports.expectGoToDefinition = exports.expectCompletion = exports.expectFoldings = exports.expectSymbols = exports.parseHelper = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const ast_util_1 = require("../utils/ast-util");
const regex_util_1 = require("../utils/regex-util");
function parseHelper(services) {
    const metaData = services.LanguageMetaData;
    const documentBuilder = services.shared.workspace.DocumentBuilder;
    return (input) => __awaiter(this, void 0, void 0, function* () {
        const randomNumber = Math.floor(Math.random() * 10000000) + 1000000;
        const uri = vscode_uri_1.URI.parse(`file:///${randomNumber}${metaData.fileExtensions[0]}`);
        const document = services.shared.workspace.LangiumDocumentFactory.fromString(input, uri);
        const buildResult = yield documentBuilder.build(document);
        return buildResult;
    });
}
exports.parseHelper = parseHelper;
function expectSymbols(services, expectEqual) {
    return (input) => __awaiter(this, void 0, void 0, function* () {
        const document = yield parseDocument(services, input.text);
        const symbolProvider = services.lsp.DocumentSymbolProvider;
        const symbols = yield symbolProvider.getSymbols(document, textDocumentParams(document));
        expectEqual(symbols.length, input.expectedSymbols.length);
        for (let i = 0; i < input.expectedSymbols.length; i++) {
            const expected = input.expectedSymbols[i];
            const item = symbols[i];
            if (typeof expected === 'string') {
                expectEqual(item.name, expected);
            }
            else {
                expectEqual(item, expected);
            }
        }
    });
}
exports.expectSymbols = expectSymbols;
function expectFoldings(services, expectEqual) {
    return (input) => __awaiter(this, void 0, void 0, function* () {
        const { output, ranges } = replaceIndices(input);
        const document = yield parseDocument(services, output);
        const foldingRangeProvider = services.lsp.FoldingRangeProvider;
        const foldings = yield foldingRangeProvider.getFoldingRanges(document, textDocumentParams(document));
        foldings.sort((a, b) => a.startLine - b.startLine);
        expectEqual(foldings.length, ranges.length);
        for (let i = 0; i < ranges.length; i++) {
            const expected = ranges[i];
            const item = foldings[i];
            expectEqual(item.startLine, document.textDocument.positionAt(expected[0]).line);
            expectEqual(item.endLine, document.textDocument.positionAt(expected[1]).line);
        }
    });
}
exports.expectFoldings = expectFoldings;
function textDocumentParams(document) {
    return { textDocument: { uri: document.textDocument.uri } };
}
function expectCompletion(services, expectEqual) {
    return (expectedCompletion) => __awaiter(this, void 0, void 0, function* () {
        const { output, indices } = replaceIndices(expectedCompletion);
        const document = yield parseDocument(services, output);
        const completionProvider = services.lsp.completion.CompletionProvider;
        const offset = indices[expectedCompletion.index];
        const completions = yield completionProvider.getCompletion(document, textDocumentPositionParams(document, offset));
        const items = completions.items.sort((a, b) => { var _a; return ((_a = a.sortText) === null || _a === void 0 ? void 0 : _a.localeCompare(b.sortText || '0')) || 0; });
        expectEqual(items.length, expectedCompletion.expectedItems.length);
        for (let i = 0; i < expectedCompletion.expectedItems.length; i++) {
            const expected = expectedCompletion.expectedItems[i];
            const completion = items[i];
            if (typeof expected === 'string') {
                expectEqual(completion.label, expected);
            }
            else {
                expectEqual(completion, expected);
            }
        }
    });
}
exports.expectCompletion = expectCompletion;
function expectGoToDefinition(services, expectEqual) {
    return (expectedGoToDefinition) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { output, indices, ranges } = replaceIndices(expectedGoToDefinition);
        const document = yield parseDocument(services, output);
        const goToResolver = services.lsp.GoToResolver;
        const locationLink = (_a = yield goToResolver.goToDefinition(document, textDocumentPositionParams(document, indices[expectedGoToDefinition.index]))) !== null && _a !== void 0 ? _a : [];
        const expectedRange = {
            start: document.textDocument.positionAt(ranges[expectedGoToDefinition.rangeIndex][0]),
            end: document.textDocument.positionAt(ranges[expectedGoToDefinition.rangeIndex][1])
        };
        expectEqual(locationLink.length, 1);
        expectEqual(locationLink[0].targetSelectionRange, expectedRange);
    });
}
exports.expectGoToDefinition = expectGoToDefinition;
function expectHover(services, cb) {
    return (expectedHover) => __awaiter(this, void 0, void 0, function* () {
        const { output, indices } = replaceIndices(expectedHover);
        const document = yield parseDocument(services, output);
        const hoverProvider = services.lsp.HoverProvider;
        const hover = yield hoverProvider.getHoverContent(document, textDocumentPositionParams(document, indices[expectedHover.index]));
        const hoverContent = hover && vscode_languageserver_1.MarkupContent.is(hover.contents) ? hover.contents.value : undefined;
        cb(hoverContent, expectedHover.hover);
    });
}
exports.expectHover = expectHover;
function textDocumentPositionParams(document, offset) {
    return { textDocument: { uri: document.textDocument.uri }, position: document.textDocument.positionAt(offset) };
}
function parseDocument(services, input) {
    return __awaiter(this, void 0, void 0, function* () {
        const buildResult = yield parseHelper(services)(input);
        const document = (0, ast_util_1.getDocument)(buildResult.document.parseResult.value);
        if (!document.parseResult) {
            throw new Error('Could not parse document');
        }
        return document;
    });
}
exports.parseDocument = parseDocument;
function replaceIndices(base) {
    const indices = [];
    const ranges = [];
    const rangeStack = [];
    const indexMarker = base.indexMarker || '<|>';
    const rangeStartMarker = base.rangeStartMarker || '<|';
    const rangeEndMarker = base.rangeEndMarker || '|>';
    const regex = new RegExp(`${(0, regex_util_1.escapeRegExp)(indexMarker)}|${(0, regex_util_1.escapeRegExp)(rangeStartMarker)}|${(0, regex_util_1.escapeRegExp)(rangeEndMarker)}`);
    let matched = true;
    let input = base.text;
    while (matched) {
        const regexMatch = regex.exec(input);
        if (regexMatch) {
            const matchedString = regexMatch[0];
            switch (matchedString) {
                case indexMarker:
                    indices.push(regexMatch.index);
                    break;
                case rangeStartMarker:
                    rangeStack.push(regexMatch.index);
                    break;
                case rangeEndMarker: {
                    const rangeStart = rangeStack.pop() || 0;
                    ranges.push([rangeStart, regexMatch.index]);
                    break;
                }
            }
            input = input.substring(0, regexMatch.index) + input.substring(regexMatch.index + matchedString.length);
        }
        else {
            matched = false;
        }
    }
    return { output: input, indices, ranges: ranges.sort((a, b) => a[0] - b[0]) };
}
//# sourceMappingURL=langium-test.js.map