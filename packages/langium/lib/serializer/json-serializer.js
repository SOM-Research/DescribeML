"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultJsonSerializer = void 0;
const linker_1 = require("../references/linker");
const ast_util_1 = require("../utils/ast-util");
class DefaultJsonSerializer {
    constructor(services) {
        this.linker = services.references.Linker;
    }
    serialize(node, space) {
        return JSON.stringify(this.decycle(node, '$container', '$document', '$cstNode', '$path'), undefined, space);
    }
    deserialize(content) {
        return this.revive(JSON.parse(content));
    }
    decycle(object, ...ignore) {
        const objects = new Set(); // Keep references to each unique object
        const replace = (item) => {
            // The replace function recurses through the object, producing the deep copy.
            if (typeof item === 'object' && item !== null) {
                if (objects.has(item)) {
                    throw new Error('Cycle in ast detected.');
                }
                else {
                    objects.add(item);
                }
                // If it is a reference, just return the name
                if ((0, ast_util_1.isReference)(item)) {
                    return { $refText: item.$refText }; // surprisingly this cast works at the time of writing, although $refNode is absent
                }
                let newItem;
                // If it is an array, replicate the array.
                if (Array.isArray(item)) {
                    newItem = [];
                    for (let i = 0; i < item.length; i++) {
                        newItem[i] = replace(item[i]);
                    }
                }
                else {
                    // If it is an object, replicate the object.
                    newItem = {};
                    for (const [name, itemValue] of Object.entries(item)) {
                        if (!ignore.includes(name)) {
                            newItem[name] = replace(itemValue);
                        }
                    }
                }
                return newItem;
            }
            return item;
        };
        return replace(object);
    }
    revive(object) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const internalRevive = (value, container, propName) => {
            if (value && typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                    for (let i = 0; i < value.length; i++) {
                        const item = value[i];
                        if ((0, ast_util_1.isReference)(item) && (0, ast_util_1.isAstNode)(container)) {
                            const refId = (0, linker_1.getReferenceId)(container.$type, propName);
                            const reference = this.linker.buildReference(container, item.$refNode, refId, item.$refText);
                            value[i] = reference;
                        }
                        else if (typeof item === 'object' && item !== null) {
                            internalRevive(item, item);
                            item.$container = container;
                        }
                    }
                }
                else {
                    for (const [name, item] of Object.entries(value)) {
                        if (typeof item === 'object' && item !== null) {
                            if ((0, ast_util_1.isReference)(item)) {
                                const refId = (0, linker_1.getReferenceId)(value.$type, name);
                                const reference = this.linker.buildReference(value, item.$refNode, refId, item.$refText);
                                value[name] = reference;
                            }
                            else if (Array.isArray(item)) {
                                internalRevive(item, value, name);
                            }
                            else {
                                internalRevive(item);
                                item.$container = value;
                            }
                        }
                    }
                }
            }
        };
        internalRevive(object);
        return object;
    }
}
exports.DefaultJsonSerializer = DefaultJsonSerializer;
//# sourceMappingURL=json-serializer.js.map