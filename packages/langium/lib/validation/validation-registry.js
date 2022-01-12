"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationRegistry = void 0;
const collections_1 = require("../utils/collections");
class ValidationRegistry {
    constructor(services) {
        this.validationChecks = new collections_1.MultiMap();
        this.reflection = services.shared.AstReflection;
    }
    register(checksRecord, thisObj = this) {
        for (const [type, ch] of Object.entries(checksRecord)) {
            if (Array.isArray(ch)) {
                for (const check of ch) {
                    this.doRegister(type, this.wrapValidationException(check, thisObj));
                }
            }
            else if (ch) {
                this.doRegister(type, this.wrapValidationException(ch, thisObj));
            }
        }
    }
    wrapValidationException(check, thisObj) {
        return (node, accept, cancelToken) => {
            try {
                check.call(thisObj, node, accept, cancelToken);
            }
            catch (e) {
                console.error('An exception occured executing a validation.', e);
            }
        };
    }
    doRegister(type, check) {
        for (const subtype of this.reflection.getAllTypes()) {
            if (this.reflection.isSubtype(subtype, type)) {
                this.validationChecks.add(subtype, check);
            }
        }
    }
    getChecks(type) {
        return this.validationChecks.get(type);
    }
}
exports.ValidationRegistry = ValidationRegistry;
//# sourceMappingURL=validation-registry.js.map