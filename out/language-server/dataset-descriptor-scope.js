"use strict";
/******************************************************************************
 * Copyright 2022 SOM Research
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
exports.DatasetDescriptorScopeComputation = void 0;
const langium_1 = require("langium");
const vscode_jsonrpc_1 = require("vscode-jsonrpc");
const ast_1 = require("./generated/ast");
class DatasetDescriptorScopeComputation extends langium_1.DefaultScopeComputation {
    constructor(services) {
        super(services);
    }
    /**
     * Exports only types (`DataType or `Entity`) with their qualified names.
     */
    computeExports(document, cancelToken = vscode_jsonrpc_1.CancellationToken.None) {
        return __awaiter(this, void 0, void 0, function* () {
            const descr = [];
            for (const modelNode of (0, langium_1.streamAllContents)(document.parseResult.value)) {
                yield (0, langium_1.interruptAndCheck)(cancelToken);
                let name = this.nameProvider.getName(modelNode);
                let container = modelNode.$container;
                if (name) {
                    if ((0, ast_1.isAttribute)(modelNode) || (0, ast_1.isDataInstance)(modelNode) || (0, ast_1.isLabels)(modelNode) || (0, ast_1.isLabelingProcess)(modelNode) || (0, ast_1.isSocialIssue)(modelNode)) {
                        descr.push(this.descriptions.createDescription(modelNode, container.name + '.' + name, document));
                        //name = (this.nameProvider as DomainModelNameProvider).getQualifiedName(modelNode.$container as PackageDeclaration, name);
                    }
                    descr.push(this.descriptions.createDescription(modelNode, name, document));
                }
            }
            return descr;
        });
    }
}
exports.DatasetDescriptorScopeComputation = DatasetDescriptorScopeComputation;
//# sourceMappingURL=dataset-descriptor-scope.js.map