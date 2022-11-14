"use strict";
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
/**
 * Generator for HTML that implements Declaration.
*/
class DatasetUploader {
    //private readonly parser: LangiumParser;
    constructor(services) {
        //this.parser = services.parser.LangiumParser;
    }
    uploadDataset(filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileContent = fs_1.default.readFileSync(filepath, { encoding: 'utf-8' });
            const parsed = (0, sync_1.parse)(fileContent);
            const snippet = this.buildSnippet(parsed, filepath);
            return snippet;
        });
    }
    buildSnippet(data, filepath) {
        // Can we infer the most probable type?
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
    buildCompositionSnippet(data, filepath) {
        var _a;
        // Get Headers
        const headers = data[0];
        // Get number of rows
        const numberofResults = data.length - 1;
        let body = `
Composition:
    Rationale: ""
    Total size: ${numberofResults}
    Data Instances:
        Instance:  ${(_a = filepath.split("\\").pop()) === null || _a === void 0 ? void 0 : _a.split(".")[0]}
            Description: \"Describe the instance\"
            Type: Record-Data
            Attribute number: ${headers.length}
            Attributes:\n`;
        headers.forEach((attr, index) => {
            // Can we calculate attribute completeness?
            let attrData = data.map(function (value, index2) { return value[index]; });
            const datHeaders = attrData.shift();
            // Completness
            const completness = this.attributeCompletness(attrData);
            // Unique
            const unique = this.attributeUnique(attrData);
            // Check if all the elements are numeric
            let isNumber = this.isNumber(attrData);
            if ((attrData.length < 50 || attrData.length * 0.80 > unique) || (isNumber == false)) {
                // Categorical
                // Mode
                const mode = this.mode(attrData);
                // Cateogrical Distribution
                const catDist = this.attributeCatDist(attrData);
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
                const mean = Math.round((attrNumerical.reduce((a, b) => a + b) / attrNumerical.length) * 10) / 10;
                const variance = attrData.map(ele => Math.pow(ele - mean, 2)).reduce((a, b) => a + b);
                const std = Math.round((Math.sqrt(variance)) * 10) / 10;
                const max = Math.max(...attrNumerical.map(o => o));
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
    attributeUnique(attrData) {
        let uniques = attrData.filter((v, i, a) => a.indexOf(v) === i);
        return uniques.length;
    }
    attributeCompletness(attrData) {
        let validValues = 0;
        attrData.forEach(element => {
            if (element === undefined || element === null || element == '' || element == 'NaN') {
            }
            else {
                validValues = validValues + 1;
            }
        });
        if (validValues != 0)
            return ((validValues / attrData.length) * 100).toFixed(0);
        else
            return 0;
    }
    attributeCatDist(attrData) {
        // index signature
        let percent = 0;
        let body = "[";
        let uniques = attrData.filter((v, i, a) => a.indexOf(v) === i);
        uniques.forEach((value, idx, array) => {
            percent = (attrData.filter((v) => (v === value)).length / attrData.length) * 100;
            if (percent >= 0.1) {
                body = body + '"' + value + '"' + ":" + (Math.round(percent * 10) / 10) + '%, ';
            }
        });
        body = body.slice(0, -2) + "]";
        if (body.length < 5)
            return false;
        else
            return body;
    }
    isNumber(attrData) {
        let isNumber = true;
        attrData.forEach(value => {
            if (isNaN(Number(value)))
                isNumber = false;
        });
        return isNumber;
    }
    mode(arr) {
        const mode = [];
        let max = 0, count = 0;
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (mode[item]) {
                mode[item]++;
            }
            else {
                mode[item] = 1;
            }
            if (count < mode[item]) {
                max = item;
                count = mode[item];
            }
        }
        return max;
    }
    ;
}
exports.DatasetUploader = DatasetUploader;
//# sourceMappingURL=dataset-descriptor-uploader.js.map