"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertBoolean = exports.convertNumber = exports.convertInt = exports.convertID = exports.convertString = exports.DefaultValueConverter = void 0;
const ast_1 = require("../grammar/generated/ast");
class DefaultValueConverter {
    convert(input, cstNode) {
        let feature = cstNode.feature;
        if ((0, ast_1.isCrossReference)(feature)) {
            feature = feature.terminal;
        }
        if ((0, ast_1.isRuleCall)(feature)) {
            const rule = feature.rule.ref;
            if (!rule) {
                throw new Error('This cst node was not parsed by a rule.');
            }
            return this.runConverter(rule, input, cstNode);
        }
        return input;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    runConverter(rule, input, cstNode) {
        switch (rule.name.toUpperCase()) {
            case 'INT': return convertInt(input);
            case 'STRING': return convertString(input);
            case 'ID': return convertID(input);
            case 'REGEXLITERAL': return convertString(input);
        }
        switch (rule.type.toLowerCase()) {
            case 'number': return convertNumber(input);
            case 'boolean': return convertBoolean(input);
            default: return input;
        }
    }
}
exports.DefaultValueConverter = DefaultValueConverter;
function convertString(input) {
    return input.substring(1, input.length - 1);
}
exports.convertString = convertString;
function convertID(input) {
    if (input.charAt(0) === '^') {
        return input.substring(1);
    }
    else {
        return input;
    }
}
exports.convertID = convertID;
function convertInt(input) {
    return parseInt(input);
}
exports.convertInt = convertInt;
function convertNumber(input) {
    return Number(input);
}
exports.convertNumber = convertNumber;
function convertBoolean(input) {
    return input.toLowerCase() === 'true';
}
exports.convertBoolean = convertBoolean;
//# sourceMappingURL=value-converter.js.map