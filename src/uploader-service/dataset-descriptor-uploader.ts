/******************************************************************************
 * Copyright 2022 SOM Research
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

 import { parse } from 'csv-parse/sync';
 import fs from 'fs';
import path from 'path';
 import { DatasetMetrics } from './dataset-metrics';
 
 export interface Uploader {
     // The main function, recieves a filepath of the selected .csv from the user and loads the content
     uploadDataset(filepath: string): Promise<string>;
     // Build the snippet and return it to the LSP
     buildDescriptionDraft(data: Array<any>, filepath: string): string;
 }
 
 /**
  * Data uploader service main class 
 */
 export class DatasetUploader implements Uploader {
 
     constructor() {
     }
 
     // Get the dataset file, read it, parse it, and build the description draft
     async uploadDataset(filepath: string): Promise<string> {
         // Loading the .CSV
         const fileContent = fs.readFileSync(filepath, { encoding: 'utf-8' });
      
         // Parsing the .CSV
         const parsed: Array<any> = parse(fileContent) as Array<any>;
         // Building the snnipet
         const descriptionDraft = this.buildDescriptionDraft(parsed, filepath);
         return descriptionDraft;
     }
 
     // Building the description draft 
     buildDescriptionDraft(data: Array<any>, filepath: string) {
         // Build the metadata snippet
         let body: string = this.buildMetadataSnippet();
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
     buildCompositionSnippet(data: Array<any>, filepath: string) {
 
         const datasetMetrics = new DatasetMetrics;
         // Get Headers
         const headers: Array<string> = data[0];
         // Get number of rows
         const numberofResults = data.length - 1
         let body: string = `
 Composition:
     Rationale: ""
     Total size: ${numberofResults}
     Data Instances:
         Instance:  ${path.basename(filepath).split('.')[0]}
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
                 const catDist = datasetMetrics.attributeCatDist(attrData);;
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
                 } else {
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
 
             } else {
                 // Numerical
                 // Parse to numbers
                 const attrNumerical: number[] = attrData.map(Number)
                 // Calculate mean  
                 const mean = Math.round((attrNumerical.reduce((a, b) => a + b) / attrNumerical.length) * 10) / 10;
                 // Calculate variance
                 const variance = attrData.map(ele => Math.pow(ele - mean, 2)).reduce((a, b) => a + b);
                 // Calculate covariance
                 const std = Math.round((Math.sqrt(variance)) * 10) / 10;
                 // Calculate maximmum
                 const max = Math.max(...attrNumerical.map(o => o))
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
     Data Splits: ""\n`
 
         return body;
     }
     // Building the provenance part
     buildProvenanceSnippet(data: Array<any>, filepath: string) {
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
 `
 
     }
 
     buildSocialConcernSnippet(data: Array<any>, filepath: string) {
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