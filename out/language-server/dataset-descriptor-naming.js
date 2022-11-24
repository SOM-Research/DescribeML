"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatasetDescriptorNameProvider = exports.toQualifiedName = void 0;
const langium_1 = require("langium");
const ast_1 = require("./generated/ast");
function toQualifiedName(pack, childName) {
    return ((0, ast_1.isDeclaration)(pack.$container) ? toQualifiedName(pack.$container, pack.name) : pack.name) + '.' + childName;
}
exports.toQualifiedName = toQualifiedName;
class DatasetDescriptorNameProvider extends langium_1.DefaultNameProvider {
    /**
     * @param qualifier if the qualifier is a `string`, simple string concatenation is done: `qualifier.name`.
     *      if the qualifier is a `PackageDeclaration` fully qualified name is created: `package1.package2.name`.
     * @param name simple name
     * @returns qualified name separated by `.`
     */
    getQualifiedName(qualifier, name) {
        let prefix = qualifier;
        if ((0, ast_1.isDeclaration)(prefix)) {
            prefix = ((0, ast_1.isDeclaration)(prefix.$container)
                ? this.getQualifiedName(prefix.$container, prefix.name) : prefix.name);
        }
        return (prefix ? prefix + '.' : '') + name;
    }
}
exports.DatasetDescriptorNameProvider = DatasetDescriptorNameProvider;
//# sourceMappingURL=dataset-descriptor-naming.js.map