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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatasetUploader = void 0;
const sync_1 = require("csv-parse/sync");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dataset_metrics_1 = require("./dataset-metrics");
/**
 * Data uploader service main class
*/
class DatasetUploader {
    constructor() {
    }
    // Get the dataset file, read it, parse it, and build the description draft
    uploadDataset(filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            // Loading the .CSV
            const fileContent = fs_1.default.readFileSync(filepath, { encoding: 'utf-8' });
            // Parsing the .CSV
            const parsed = (0, sync_1.parse)(fileContent);
            // Building the snnipet
            const descriptionDraft = this.buildDescriptionDraft(parsed, filepath);
            return descriptionDraft;
        });
    }
    // Building the description draft 
    buildDescriptionDraft(data, filepath) {
        // Build the metadata snippet
        let body = this.buildMetadataSnippet();
        // Build Composition snippet
        body = body + this.buildCompositionSnippet(data, filepath);
        // Build Provenance ans social concerns snippet
        body = body + this.buildProvenanceSnippet(data, filepath);
        // Build Social Concern snippet
        body = body + this.buildSocialConcernSnippet(data, filepath);
        return body;
    }
    // Building the metadata snippet
    buildMetadataSnippet() {
        return `Dataset: datasetName
     Metadata:
         Title: "" 
         Unique-identifier: aUniqueId
         Version: v0000
         Dates:
             Release Date: 11-11-1989
         Citation: 
             Raw Citation: ""
         Description:  
             Purposes: "" 
             Tasks: [other]
             Gaps: ""
             Areas: datasetArea
             Tags: datasetTags
         Applications: 
             Past Uses:""
             Recommended:""
             Non-recommended:""
             Benchmarking: [  ]
         Distribution: 
             Licences: CC0: Public Domain
             Rights(stand-alone): Access
             Rights(with models): Benchmark
         Authoring:
             Authors:
                 Name "authorName" email XXXX@mail.com
             Funders:
                 Name "founderName" type mixed
             Erratum?: ""
             Version lifecycle:""
         Contribution guidelines: ""
         \n`;
    }
    // Building Composition snippet
    buildCompositionSnippet(data, filepath) {
        const datasetMetrics = new dataset_metrics_1.DatasetMetrics;
        // Get Headers
        const headers = data[0];
        // Get number of rows
        const numberofResults = data.length - 1;
        let body = `
 Composition:
     Rationale: ""
     Total size: ${numberofResults}
     Data Instances:
         Instance:  ${path_1.default.basename(filepath).split('.')[0]}
             Description: \"Describe the instance\"
             Type: Record-Data
             Attribute number: ${headers.length}
             Attributes:\n`;
        // For each attribute
        headers.forEach((attr, index) => {
            let attrData = data.map(function (value, index2) { return value[index]; });
            const datHeaders = attrData.shift();
            // Calculate completness
            const completness = datasetMetrics.attributeCompletness(attrData);
            // Calculate unique values
            const unique = datasetMetrics.attributeUnique(attrData);
            // Check if all the elements are numeric
            let isNumber = datasetMetrics.isAttributeNumerical(attrData);
            // Check if attributes are categorical or numerical
            if ((attrData.length < 50 || attrData.length * 0.80 > unique) || (isNumber == false)) {
                // Categorical
                // Calculate Mode
                const mode = datasetMetrics.attributeMode(attrData);
                // Calculate Cateogrical Distribution
                const catDist = datasetMetrics.attributeCatDist(attrData);
                ;
                if (catDist === false) {
                    body = body +
                        `\t\t\t\tattribute:  ${datHeaders.replaceAll(' ', '_')}  
                         description: \"Describe the attribute\"
                         count: ${unique}
                         ofType: Categorical
                         Statistics: 
                             Mode: "${mode}"
                             Quality Metrics:
                                 Completeness: ${completness} \n`;
                }
                else {
                    body = body +
                        `\t\t\t\tattribute:  ${datHeaders.replaceAll(' ', '_')}  
                         description: \"Describe the attribute\"
                         count: ${unique}
                         ofType: Categorical
                         Statistics: 
                             Mode: "${mode}"
                             Categoric Distribution: ${catDist}
                             Quality Metrics:
                                 Completeness: ${completness} \n`;
                }
            }
            else {
                // Numerical
                // Parse to numbers
                const attrNumerical = attrData.map(Number);
                // Calculate mean  
                const mean = Math.round((attrNumerical.reduce((a, b) => a + b) / attrNumerical.length) * 10) / 10;
                // Calculate variance
                const variance = attrData.map(ele => Math.pow(ele - mean, 2)).reduce((a, b) => a + b);
                // Calculate covariance
                const std = Math.round((Math.sqrt(variance)) * 10) / 10;
                // Calculate maximmum
                const max = Math.max(...attrNumerical.map(o => o));
                // Calculate minimmum
                const min = Math.min(...attrNumerical.map(o => o));
                body = body + `\t\t\t\tattribute:  ${datHeaders.replaceAll(' ', '_')}  
                     description: \"Describe the attribute\"
                     count: ${unique}
                     ofType: Numerical
                     Statistics: 
                         Mean: ${mean}
                         Standard Desviation: ${std}
                         Minimmum: ${min}
                         Maximmum: ${max}\n`;
            }
        });
        body = body +
            `       Statistics:
             Quality Metrics:
                 Sparsity: 00 // Not calculated, to be filled
     Dependencies:
         Description: ""
     Data Splits: ""\n`;
        return body;
    }
    // Building the provenance part
    buildProvenanceSnippet(data, filepath) {
        return `   
 Data Provenance:
     Curation Rationale: ""
     Gathering Processes:
         Process: gatherProcesId
             Description: ""
             Source: SourceID
                 Description: ""
                 Noise: ""
             How data is collected: Others   // Choose an option from the list
             Gather Requirements: 
                 Requirement: ""
     LabelingProcesses:
         Labeling process: labelProcesIDReference
         Description: ""
         Type: 3D cuboids // Choose an option from the list
         Labels:
           Label: labelIdReference
           Description: ""
           Mapping: DECLARED_ATTRIBUTE_ID // Set the ID of the label attribute
         Label Requirements:
             Requirement: "" 
     Preprocesses:
         Preprocess: preprocessId
         Description: ""
         Type: Others
 `;
    }
    buildSocialConcernSnippet(data, filepath) {
        return `  
 Social Concerns:
         Social Issue: issueId
             IssueType: Privacy // Choose one from the list
             Description: ""
             Related Attributes:
                attribute: DECLARED_ATTRIBUTE_ID // Set the affected attribute
         
         
         `;
    }
}
exports.DatasetUploader = DatasetUploader;
//# sourceMappingURL=dataset-descriptor-uploader.js.map