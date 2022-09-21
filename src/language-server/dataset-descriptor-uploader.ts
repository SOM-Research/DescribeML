import { DatasetDescriptorServices } from './dataset-descriptor-module';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
//import math from 'mathjs';



export interface Uploader {
    uploadDataset(filepath: string) :   Promise<string> ;
    buildSnippet(data: Array<any>, filepath: string): string; 
}

/**
 * Generator for HTML that implements Declaration.
*/
export class DatasetUploader implements Uploader {


    //private readonly parser: LangiumParser;

    constructor(services: DatasetDescriptorServices) {
        //this.parser = services.parser.LangiumParser;

    }

    async uploadDataset(filepath: string): Promise<string> {

        const fileContent = fs.readFileSync(filepath, { encoding: 'utf-8' });  
        const parsed: Array<any> = parse(fileContent) as Array<any>;
        
        const snippet = this.buildSnippet(parsed, filepath);
        return snippet;
    }

    buildSnippet(data: Array<any>, filepath: string) {
    
        // Can we infer the most probable type?
        
        // Build the metadata snippet
        let body:string = this.buildMetadataSnippet();
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
                Name authorName email XXXX@mail.com
            Funders:
                Name founderName type mixed
            Erratum?: ""
            Version lifecycle:""
        Contribution guidelines: ""
        \n`;
    }
    buildCompositionSnippet(data: Array<any>, filepath: string) {
        // Get Headers
        const headers: Array<string> = data[0];
        // Get number of rows
        const numberofResults = data.length - 1
        let body:string= `
Composition:
    Rationale: ""
    Total size: ${numberofResults}
    Data Instances:
        Instance:  ${filepath.split("\\").pop()?.split(".")[0]}
            Description: \"Describe the instance\"
            Type: Record-Data
            Attribute number: ${numberofResults}
            Attributes:\n`;

        headers.forEach((attr, index) => {
            // Can we calculate attribute completeness?
            let attrData = data.map(function(value,index2) { return value[index]; });
            const datHeaders = attrData.shift();
            // Completness
            //const completness = this.attributeCompletness(attrData);
            // Unique
            const unique = this.attributeUnique(attrData);
            // If number Mean and Standard Desviation
            //const std = math.std(dataWithoutHeaders);
            //const meand = math.mean(dataWithoutHeaders);
            body = body + `\t\t\t\t\tattribute:  ${datHeaders.replaceAll(' ','_')}  
                        description: \"Describe the attribute\"
                        count: ${unique}
                        // ofType: Categorical
                        // Statistics: \n`;
        });

        body = body + 
`       Statistics:
            Quality Metrics:
                Sparsity: 00
                // Completeness: 100
                // Class Balance ""
    Dependencies:
        Description: ""
    Data Splits: ""\n`

        return body;
    }

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
            // Relation Instances: instanceIdReference
            // Social Issues: SocialIssueIdReference
            // How data is colleted:   // Choose an option from the list
            // When data is collected: ""
            Gather Requirements: 
                Requirement: ""
    LabelingProcesses:
        Labeling process: labelProcesIDReference
        Description: ""
        // Type: // Choose an option from the list
        // Labels:
        //  Label: labelIdReference
        //  Description: ""
        Label Requirements:
            Requirement: "" 
    Preprocesses:
        Preprocess: preprocessId
        Description: ""\n
`

    }

    buildSocialConcernSnippet(data: Array<any>, filepath: string) {
        return `  
Social Concerns:
        Social Issue: issueId
            IssueType: Privacy // Choose one from the list
            // Related Attributes:
            //   attribute: attributeIdReference
            Description: ""
            // Instace belongs to people:
            //  Are there protected groups? Yes
        
        
        `;
    }
    attributeUnique(attrData: Array<any>) {
         let uniques = attrData.filter((v,i,a) => a.indexOf(v) === i);
         return uniques.length;
    }

    attributeCompletness(attrData: Array<any>){
        let validValues = 0;
        attrData.forEach(element => {
            if (element){
                console.log(element)
            }
            if (element === undefined || element === null || element == '' || element == 'NaN') {
            } else {
                validValues = validValues+1;
            }
        });
        if (validValues != 0) return ((validValues/attrData.length) * 100).toFixed(0);
        else return 0
    }
}