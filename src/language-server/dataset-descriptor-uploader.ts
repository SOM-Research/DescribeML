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
        let headers: Array<string> = data[0];
        // Get number of rows
        let numberofResults = data.length - 1
        // Can we infer the most probable type?
        // Can we calculate attribute completeness?
        // If number, can we calculate ranges?
        // Can we count the number of empty or NANs values in a attibute column?
        let body:string= `
            Instance:  ${filepath.split("\\").pop()?.split(".")[0]}
            \tdescription \"Instance Description\"
            \ttype raw
            \ttotal number ${numberofResults}
            \twithAttributes:\n`;

        headers.forEach(attr => {
           body = body + `\t\t\t\t\tattribute  ${attr.replaceAll(' ','_')} 
                        ofType string  
                        description: \"Describe the attribute \"\n`;
        });
        return body;
    }
}