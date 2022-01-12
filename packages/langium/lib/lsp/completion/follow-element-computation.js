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
exports.findFirstFeatures = exports.findNextFeaturesInternal = exports.findNextFeatures = void 0;
const ast = __importStar(require("../../grammar/generated/ast"));
const grammar_util_1 = require("../../grammar/grammar-util");
/**
 * Calculates any features that can follow the given feature stack.
 * This also includes features following optional features and features from previously called rules that could follow the last feature.
 * @param featureStack A stack of features starting at the entry rule and ending at the feature of the current cursor position.
 * @returns Any `AbstractElement` that could be following the given feature stack.
 */
function findNextFeatures(featureStack) {
    return findNextFeaturesInternal(featureStack, new Map());
}
exports.findNextFeatures = findNextFeatures;
function findNextFeaturesInternal(featureStack, cardinalities) {
    var _a;
    if (featureStack.length === 0) {
        return [];
    }
    const features = [];
    const feature = featureStack[0];
    let parent;
    let item = feature;
    while (item.$container) {
        if (ast.isGroup(item.$container)) {
            parent = item.$container;
            break;
        }
        else if (ast.isAbstractElement(item.$container)) {
            item = item.$container;
        }
        else {
            break;
        }
    }
    // First try to iterate the same element again
    if ((0, grammar_util_1.isArray)((_a = item.cardinality) !== null && _a !== void 0 ? _a : cardinalities.get(item))) {
        features.push(...findFirstFeatures(item, cardinalities));
    }
    if (parent) {
        const ownIndex = parent.elements.indexOf(item);
        // Find next elements of the same group
        if (ownIndex !== undefined && ownIndex < parent.elements.length - 1) {
            features.push(...findNextFeaturesInGroup(parent, ownIndex + 1, cardinalities));
        }
        if (features.every(e => { var _a; return (0, grammar_util_1.isOptional)((_a = e.cardinality) !== null && _a !== void 0 ? _a : cardinalities.get(e)); })) {
            // secondly, try to find the next elements of the parent
            features.push(...findNextFeaturesInternal([parent], cardinalities));
        }
        if (features.every(e => { var _a; return (0, grammar_util_1.isOptional)((_a = e.cardinality) !== null && _a !== void 0 ? _a : cardinalities.get(e)); })) {
            // lasty, climb the feature stack and calculate completion for previously called rules
            featureStack.shift();
            features.push(...findNextFeaturesInternal(featureStack, cardinalities));
        }
    }
    else {
        // Climb the feature stack if this feature is the only one in a rule
        featureStack.shift();
        features.push(...findNextFeaturesInternal(featureStack, cardinalities));
    }
    return features;
}
exports.findNextFeaturesInternal = findNextFeaturesInternal;
/**
 * Calculates the first child feature of any `AbstractElement`.
 * @param feature The `AbstractElement` whose first child features should be calculated.
 * @returns A list of features that could be the first feature of the given `AbstractElement`.
 * These features contain a modified `cardinality` property. If the given `feature` is optional, the returned features will be optional as well.
 */
function findFirstFeatures(feature, cardinalities) {
    const card = cardinalities !== null && cardinalities !== void 0 ? cardinalities : new Map();
    if (feature === undefined) {
        return [];
    }
    else if (ast.isGroup(feature)) {
        return findNextFeaturesInGroup(feature, 0, card)
            .map(e => modifyCardinality(e, feature.cardinality, card));
    }
    else if (ast.isAlternatives(feature)) {
        return feature.elements.flatMap(e => findFirstFeatures(e, card))
            .map(e => modifyCardinality(e, feature.cardinality, card));
    }
    else if (ast.isUnorderedGroup(feature)) {
        // TODO: Do we want to continue supporting unordered groups?
        return [];
    }
    else if (ast.isAssignment(feature)) {
        return findFirstFeatures(feature.terminal, card)
            .map(e => modifyCardinality(e, feature.cardinality, card));
    }
    else if (ast.isAction(feature)) {
        return findNextFeaturesInternal([feature], card)
            .map(e => modifyCardinality(e, feature.cardinality, card));
    }
    else if (ast.isRuleCall(feature) && ast.isParserRule(feature.rule.ref)) {
        return findFirstFeatures(feature.rule.ref.alternatives, card)
            .map(e => modifyCardinality(e, feature.cardinality, card));
    }
    else {
        return [feature];
    }
}
exports.findFirstFeatures = findFirstFeatures;
/**
 * Modifying the cardinality is necessary to identify which features are coming from an optional feature.
 * Those features should be optional as well.
 * @param feature The next feature that could be made optionally.
 * @param cardinality The cardinality of the calling (parent) object.
 * @returns A new feature that could be now optional (`?` or `*`).
 */
function modifyCardinality(feature, cardinality, cardinalities) {
    if ((0, grammar_util_1.isOptional)(cardinality)) {
        if ((0, grammar_util_1.isArray)(feature.cardinality)) {
            cardinalities.set(feature, '*');
        }
        else {
            cardinalities.set(feature, '?');
        }
    }
    return feature;
}
function findNextFeaturesInGroup(group, index, cardinalities) {
    var _a;
    const features = [];
    let firstFeature;
    do {
        firstFeature = group.elements[index++];
        features.push(...findFirstFeatures(firstFeature, cardinalities));
        if (!(0, grammar_util_1.isOptional)((_a = firstFeature === null || firstFeature === void 0 ? void 0 : firstFeature.cardinality) !== null && _a !== void 0 ? _a : cardinalities.get(firstFeature))) {
            break;
        }
    } while (firstFeature);
    return features;
}
//# sourceMappingURL=follow-element-computation.js.map