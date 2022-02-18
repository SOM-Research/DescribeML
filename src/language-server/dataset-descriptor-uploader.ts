import { DatasetDescriptorServices } from './dataset-descriptor-module';
import { parse } from 'csv-parse/sync';
import fs from 'fs';



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
        // Get Headers
        const headers: Array<string> = data[0];
        // Get number of rows
        const numberofResults = data.length - 1
        // Can we infer the most probable type?
   
    

        // If number, can we calculate ranges?
        // Can we count the number of empty or NANs values in a attibute column?
        let body:string= `
            Instance:  ${filepath.split("\\").pop()?.split(".")[0]}
            \tdescription \"Instance Description\"
            \ttype raw
            \ttotal number ${numberofResults}
            \twithAttributes:\n`;

        headers.forEach((attr, index) => {
            // Can we calculate attribute completeness?
            let attrData = data.map(function(value,index2) { return value[index]; });
            // Completness
            const completness = this.attributeCompletness(attrData);
            // Unique
            const unique = this.attributeUnique(attrData);
            // If number Mean and Standard Desviation
            // If String word count
            console.log(completness);
            body = body + `\t\t\t\t\tattribute  ${attr.replaceAll(' ','_')} 
                        ofType string  
                        description: \"Describe the attribute with ${unique} unique elements and a completness of ${completness} \"\n`;
        });
        return body;
    }
    attributeUnique(attrData: Array<any>) {
         // delete headers
         attrData.shift();
         let uniques = attrData.filter((v,i,a) => a.indexOf(v) === i);
         return uniques.length;
    }

    attributeCompletness(attrData: Array<any>){
        // delete headers
        attrData.shift();
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
        if (validValues != 0) return (validValues/attrData.length).toFixed(2);
        else return 0
    }
}