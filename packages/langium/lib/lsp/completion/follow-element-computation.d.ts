/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import * as ast from '../../grammar/generated/ast';
import { Cardinality } from '../../grammar/grammar-util';
/**
 * Calculates any features that can follow the given feature stack.
 * This also includes features following optional features and features from previously called rules that could follow the last feature.
 * @param featureStack A stack of features starting at the entry rule and ending at the feature of the current cursor position.
 * @returns Any `AbstractElement` that could be following the given feature stack.
 */
export declare function findNextFeatures(featureStack: ast.AbstractElement[]): ast.AbstractElement[];
export declare function findNextFeaturesInternal(featureStack: ast.AbstractElement[], cardinalities: Map<ast.AbstractElement, Cardinality>): ast.AbstractElement[];
/**
 * Calculates the first child feature of any `AbstractElement`.
 * @param feature The `AbstractElement` whose first child features should be calculated.
 * @returns A list of features that could be the first feature of the given `AbstractElement`.
 * These features contain a modified `cardinality` property. If the given `feature` is optional, the returned features will be optional as well.
 */
export declare function findFirstFeatures(feature: ast.AbstractElement | undefined, cardinalities?: Map<ast.AbstractElement, Cardinality>): ast.AbstractElement[];
//# sourceMappingURL=follow-element-computation.d.ts.map