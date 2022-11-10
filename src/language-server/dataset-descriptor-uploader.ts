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
                Name "authorName" email XXXX@mail.com
            Funders:
                Name "founderName" type mixed
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
            Attribute number: ${headers.length}
            Attributes:\n`;

        headers.forEach((attr, index) => {
            // Can we calculate attribute completeness?
            let attrData = data.map(function(value,index2) { return value[index]; });
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
                    `\t\t\t\tattribute:  ${datHeaders.replaceAll(' ','_')}  
                        description: \"Describe the attribute\"
                        count: ${unique}
                        ofType: Categorical
                        Statistics: 
                            Mode: "${mode}"
                            Quality Metrics:
                                Completeness: ${completness} \n`;
                } else {
                    body = body + 
                    `\t\t\t\tattribute:  ${datHeaders.replaceAll(' ','_')}  
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
                const mean = Math.round((attrNumerical.reduce((a, b) => a + b) / attrNumerical.length)* 10) / 10;
                const variance= attrData.map(ele=> Math.pow(ele- mean, 2)).reduce((a, b) =>a+b);
                const std = Math.round((Math.sqrt(variance))*10)/10;
                const max = Math.max(...attrNumerical.map(o => o))
                const min = Math.min(...attrNumerical.map(o => o));
                body = body + `\t\t\t\tattribute:  ${datHeaders.replaceAll(' ','_')}  
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
         // How data is collected:   // Choose an option from the list
            Gather Requirements: 
                Requirement: ""
    LabelingProcesses:
        Labeling process: labelProcesIDReference
        Description: ""
     // Type: // Choose an option from the list
     // Labels:
        //  Label: labelIdReference
        //  Description: ""
        //  Mapping: ATTRIBUTE_ID
        Label Requirements:
            Requirement: "" 
    Preprocesses:
        Preprocess: preprocessId
        Description: ""\n
        Type: Others
`

    }

    buildSocialConcernSnippet(data: Array<any>, filepath: string) {
        return `  
Social Concerns:
        Social Issue: issueId
            IssueType: Privacy // Choose one from the list
            Description: ""
            // Related Attributes:
            //   attribute: attributeIdReference
        
        
        `;
    }
    attributeUnique(attrData: Array<any>) {
         let uniques = attrData.filter((v,i,a) => a.indexOf(v) === i);
         return uniques.length;
    }

    attributeCompletness(attrData: Array<any>){
        let validValues = 0;
        attrData.forEach(element => {
            if (element === undefined || element === null || element == '' || element == 'NaN') {
            } else {
                validValues = validValues+1;
            }
        });
        if (validValues != 0) return ((validValues/attrData.length) * 100).toFixed(0);
        else return 0
    }

    attributeCatDist(attrData: Array<any>){
        // index signature
        let percent = 0;
        let body = "[";
        let uniques = attrData.filter((v,i,a) => a.indexOf(v) === i);
        uniques.forEach((value, idx, array) => {
            percent = (attrData.filter((v) => (v === value)).length / attrData.length) * 100;
            if(percent >= 0.1) {
                body = body+'"'+value+'"'+":"+ (Math.round(percent*10)/10) + '%, ';
            }
        });
        body = body.slice(0,-2) + "]";
        if (body.length < 5) return false
        else return body
    }

    isNumber(attrData: Array<any>){
        
        let isNumber = true;
        attrData.forEach(value => { 
            if(isNaN(Number(value))) isNumber = false;
        });
        return isNumber;
        
    }

    mode(arr: Array<any>) {
        const mode = [];
        let max = 0, count = 0;
        for(let i = 0; i < arr.length; i++) {
          const item = arr[i];
          if(mode[item]) {
            mode[item]++;
          } else {
            mode[item] = 1;
          }
          if(count < mode[item]) {
            max = item;
            count = mode[item];
          }
        }
        return max;
      };
    
}