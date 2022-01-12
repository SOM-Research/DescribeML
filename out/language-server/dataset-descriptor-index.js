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
exports.DatasetDescriptorDescriptionProvider = void 0;
const langium_1 = require("langium");
const vscode_languageserver_1 = require("vscode-languageserver");
const ast_1 = require("./generated/ast");
class DatasetDescriptorDescriptionProvider extends langium_1.DefaultAstNodeDescriptionProvider {
    constructor(services) {
        super(services);
    }
    createDescriptions(document, cancelToken = vscode_languageserver_1.CancellationToken.None) {
        return __awaiter(this, void 0, void 0, function* () {
            const descr = [];
            const rootNode = document.parseResult.value;
            const name = this.nameProvider.getName(rootNode);
            if (name) {
                descr.push(this.createDescription(rootNode, name, document));
            }
            for (const content of (0, langium_1.streamAllContents)(rootNode)) {
                yield (0, langium_1.interruptAndCheck)(cancelToken);
                const name = this.nameProvider.getName(content.node);
                if ((0, ast_1.isAttribute)(content.node)) {
                    let container = content.node.$container;
                    if (name && (container.name)) {
                        descr.push(this.createDescription(content.node, container.name + '.' + name, document));
                    }
                }
                if (name) {
                    descr.push(this.createDescription(content.node, name, document));
                }
            }
            return descr;
        });
    }
}
exports.DatasetDescriptorDescriptionProvider = DatasetDescriptorDescriptionProvider;
//# sourceMappingURL=dataset-descriptor-index.js.map