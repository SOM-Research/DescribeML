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
exports.toDiagnosticSeverity = exports.getDiagnosticRange = exports.DefaultDocumentValidator = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const __1 = require("..");
const grammar_util_1 = require("../grammar/grammar-util");
const ast_util_1 = require("../utils/ast-util");
const promise_util_1 = require("../utils/promise-util");
class DefaultDocumentValidator {
    constructor(services) {
        this.validationRegistry = services.validation.ValidationRegistry;
    }
    validateDocument(document, cancelToken = vscode_languageserver_1.CancellationToken.None) {
        return __awaiter(this, void 0, void 0, function* () {
            const parseResult = document.parseResult;
            const diagnostics = [];
            yield (0, promise_util_1.interruptAndCheck)(cancelToken);
            // Process lexer errors
            for (const lexerError of parseResult.lexerErrors) {
                const diagnostic = {
                    severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                    range: {
                        start: {
                            line: lexerError.line - 1,
                            character: lexerError.column - 1
                        },
                        end: {
                            line: lexerError.line - 1,
                            character: lexerError.column + lexerError.length - 1
                        }
                    },
                    message: lexerError.message
                };
                diagnostics.push(diagnostic);
            }
            // Process parser errors
            for (const parserError of parseResult.parserErrors) {
                const token = parserError.token;
                const diagnostic = {
                    severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                    range: (0, __1.tokenToRange)(token),
                    message: parserError.message
                };
                diagnostics.push(diagnostic);
            }
            // Process unresolved references
            for (const reference of document.references) {
                const linkingError = reference.error;
                if (linkingError) {
                    const info = {
                        node: linkingError.container,
                        property: linkingError.property,
                        index: linkingError.index
                    };
                    diagnostics.push(this.toDiagnostic('error', linkingError.message, info));
                }
            }
            // Process custom validations
            try {
                diagnostics.push(...yield this.validateAst(parseResult.value, document, cancelToken));
            }
            catch (err) {
                console.error('An error occurred during validation:', err);
            }
            yield (0, promise_util_1.interruptAndCheck)(cancelToken);
            return diagnostics;
        });
    }
    validateAst(rootNode, document, cancelToken = vscode_languageserver_1.CancellationToken.None) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationItems = [];
            const acceptor = (severity, message, info) => {
                validationItems.push(this.toDiagnostic(severity, message, info));
            };
            const runChecks = (node) => __awaiter(this, void 0, void 0, function* () {
                const checks = this.validationRegistry.getChecks(node.$type);
                for (const check of checks) {
                    yield check(node, acceptor, cancelToken);
                }
            });
            yield runChecks(rootNode);
            yield Promise.all((0, ast_util_1.streamAllContents)(rootNode).map((c) => __awaiter(this, void 0, void 0, function* () {
                yield (0, promise_util_1.interruptAndCheck)(cancelToken);
                yield runChecks(c.node);
            })));
            return validationItems;
        });
    }
    toDiagnostic(severity, message, info) {
        return {
            message,
            range: getDiagnosticRange(info),
            severity: toDiagnosticSeverity(severity),
            code: info.code,
            codeDescription: info.codeDescription,
            tags: info.tags,
            relatedInformation: info.relatedInformation,
            data: info.data
        };
    }
}
exports.DefaultDocumentValidator = DefaultDocumentValidator;
function getDiagnosticRange(info) {
    var _a;
    if (info.range) {
        return info.range;
    }
    if (info.property !== undefined && typeof info.property !== 'string') {
        throw new Error('Invalid property: ' + info.property);
    }
    const cstNode = (_a = (0, grammar_util_1.findNodeForFeature)(info.node.$cstNode, info.property, info.index)) !== null && _a !== void 0 ? _a : info.node.$cstNode;
    if (!cstNode) {
        return {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 }
        };
    }
    return cstNode.range;
}
exports.getDiagnosticRange = getDiagnosticRange;
function toDiagnosticSeverity(severity) {
    switch (severity) {
        case 'error':
            return vscode_languageserver_1.DiagnosticSeverity.Error;
        case 'warning':
            return vscode_languageserver_1.DiagnosticSeverity.Warning;
        case 'info':
            return vscode_languageserver_1.DiagnosticSeverity.Information;
        case 'hint':
            return vscode_languageserver_1.DiagnosticSeverity.Hint;
        default:
            throw new Error('Invalid diagnostic severity: ' + severity);
    }
}
exports.toDiagnosticSeverity = toDiagnosticSeverity;
//# sourceMappingURL=document-validator.js.map