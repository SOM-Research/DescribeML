"use strict";
/******************************************************************************
 * Copyright 2022 SOM Research
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatasetDescriptorValidator = exports.DatasetDescriptorValidationRegistry = void 0;
const langium_1 = require("langium");
/**
 * In this class we implement the custom validation services for the tool
 */
//type DatasetDescriptorChecks = { [type in DatasetDescriptorAstType ]: ValidationCheck | ValidationCheck[] }
/**
 * Registry for validation checks.
 */
class DatasetDescriptorValidationRegistry extends langium_1.ValidationRegistry {
    constructor(services) {
        super(services);
        const validator = services.validation.DatasetDescriptorValidator;
        const checks = {
            Description: validator.hintsOfDescription,
            Author: validator.authorValidator,
            Funder: validator.hintsOfFunder,
            Authoring: validator.hintsOfAuthoring,
            Composition: validator.hintOfComposition,
            Areas: validator.hintsOfAreas,
            Tags: validator.hintsofTags,
            Distribution: validator.hintsOfDistribution
        };
        this.register(checks, validator);
    }
}
exports.DatasetDescriptorValidationRegistry = DatasetDescriptorValidationRegistry;
/**
 * Implementation of custom validations.
 */
class DatasetDescriptorValidator {
    hintsofTags(type, accept) {
        accept('hint', 'Set the tags separated by a whitespace', { node: type, property: 'tags' });
    }
    hintsOfAreas(type, accept) {
        accept('hint', 'Set the areas separated by a whitespace', { node: type, property: 'areas' });
    }
    hintsOfDistribution(type, accept) {
        accept('hint', 'Set the licence of the dataset. Indicate in `others:` if any other policy is applied to the data', { node: type, property: 'name' });
        accept('hint', 'Stand-alone: Choose the level of distribution of the stand-alone data.', { node: type, property: 'rights' });
        accept('hint', 'Rights-model: Choose the level of distribution of the models trained with the data.', { node: type, property: 'rightsModels' });
    }
    hintsOfDescription(type, accept) {
        //new MultilineCommentHoverProvider(services: DatasetDescriptorServices).getHoverContent(type, params);
        accept('hint', 'For what propose was the dataser created? \nPlease provide a description', { node: type, property: 'descriptionpurpose' });
        accept('hint', 'For what tasks this dataset is inteded for', { node: type, property: 'tasks' });
        accept('hint', 'Was there specific gap that needed to be filled?\nPlease provide a description', { node: type, property: 'descriptionGaps' });
    }
    hintsOfTasks(type, accept) {
        accept('hint', 'Was there a specific task in mind?\nPlease provide a description', { node: type, property: 'name' });
    }
    hintsOfFunder(type, accept) {
        accept('hint', '1 - Who founded the creation of the dataset?\n2 - If is there any associated grant, please provide the number and the name of the grantor and the gran name and number \n Set a `_` or a `-` as a white spaces in the name e.g: "John_Smith"? ', { node: type, property: 'name' });
    }
    hintsOfAuthoring(type, accept) {
        accept('hint', 'Who is the author of the dataset?', { node: type, property: 'name' });
        accept('hint', 'Who maintan the dataset? How can be contacted?', { node: type, property: 'maintainers' });
        accept('hint', 'Is there an erratum? If so, please provide a link or other access point?', { node: type, property: 'erratum' });
        accept('hint', 'If the dataset belongs to people, are there applicable limits on the retention of the data associated with them? If so, please describre how. If not, please describre how its obsolescence will be communicated to the dataset', { node: type, property: 'dataRetention' });
        accept('hint', '1 - Will the dataset by updated (p.e: to correct labels, add or delete new instances)? If so, please describre how \n2 - Will older version of the dataset continue to be supported/hosted/maintained?', { node: type, property: 'support' });
        accept('hint', 'Please describre the mechanism for contribution here', { node: type, property: 'contribGuides' });
    }
    hintOfComposition(type, accept) {
        accept('hint', 'What do the instances that comprise the dataset represent(for example, documents, photos, people, countries)', { node: type, property: 'compodesc' });
        accept('hint', 'How many instances are there in total?', { node: type, property: 'numberInst' });
    }
    authorValidator(type, accept) {
        accept('hint', 'Please, set a `_` or a `-` as a white spaces in the name e.g: "John_Smith"?', { node: type, property: 'name' });
        if (type.name) {
            const firstChar = type.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Type name should start with a capital.', { node: type, property: 'name' });
            }
        }
    }
}
exports.DatasetDescriptorValidator = DatasetDescriptorValidator;
//# sourceMappingURL=dataset-descriptor-validator.js.map