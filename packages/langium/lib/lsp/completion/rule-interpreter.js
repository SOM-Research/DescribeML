"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleInterpreter = void 0;
const ast = __importStar(require("../../grammar/generated/ast"));
const grammar_util_1 = require("../../grammar/grammar-util");
const follow_element_computation_1 = require("./follow-element-computation");
/**
 * The `RuleInterpreter` is used by the `CompletionProvider` to identify any `AbstractElement` that could apply at a given cursor position.
 *
 * This is necessary as the parser uses the best fitting grammar rule for any given text input.
 * Assuming we could have multiple different applying rules at a certain point in the text input, only one of those will be successfully parsed.
 * However, this `RuleInterpreter` will return **all** possible features that are applicable.
 */
class RuleInterpreter {
    interpretRule(rule, nodes, offset) {
        let features = [];
        let nextFeatures = (0, follow_element_computation_1.findFirstFeatures)(rule.alternatives);
        let node = nodes.shift();
        while (node && nextFeatures.length > 0) {
            const n = node;
            const feats = [];
            features = [];
            nextFeatures.forEach(e => {
                const match = this.featureMatches(e, n, offset);
                if (nodes.length === 0 && match !== 'none') {
                    feats.push(e);
                }
                if (match === 'full' || match === 'both') {
                    features.push(e);
                }
            });
            nextFeatures = features.flatMap(e => (0, follow_element_computation_1.findNextFeatures)([e]));
            features.push(...feats);
            node = nodes.shift();
        }
        return features;
    }
    featureMatches(feature, node, offset) {
        if (ast.isKeyword(feature)) {
            const content = feature.value;
            const nodeEnd = node.end;
            const text = nodeEnd > offset ? node.text.substring(0, nodeEnd - offset) : node.text;
            if (content === text) {
                return 'full';
            }
            else if (content.startsWith(text)) {
                return 'partial';
            }
            else {
                return 'none';
            }
        }
        else if (ast.isRuleCall(feature)) {
            return this.ruleMatches(feature.rule.ref, node, offset);
        }
        else if (ast.isCrossReference(feature)) {
            return this.featureMatches(feature.terminal, node, offset);
        }
        return 'none';
    }
    ruleMatches(rule, node, offset) {
        if (ast.isParserRule(rule)) {
            const ruleFeatures = (0, follow_element_computation_1.findFirstFeatures)(rule.alternatives);
            const matchType = (0, grammar_util_1.isDataTypeRule)(rule) ? 'both' : 'full';
            return ruleFeatures.some(e => this.featureMatches(e, node, offset)) ? matchType : 'none';
        }
        else if (ast.isTerminalRule(rule)) {
            // We have to take keywords into account
            // e.g. most keywords are valid IDs as well
            // Only return 'full' if this terminal does not match a keyword. TODO
            return node.text.match((0, grammar_util_1.terminalRegex)(rule)) !== null ? 'both' : 'none';
        }
        else {
            return 'none';
        }
    }
}
exports.RuleInterpreter = RuleInterpreter;
//# sourceMappingURL=rule-interpreter.js.map