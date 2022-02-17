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
        //let results:Array<any> = [];
        //let headers:Array<string> = [];

        const fileContent = fs.readFileSync(filepath, { encoding: 'utf-8' });
       
        let parsed: Array<any> = parse(fileContent) as Array<any>;
        console.log(parsed);
        /*fs.createReadStream(filepath)
            .on('error', (error) => {
                console.log('error');
            })
            .pipe(csvParser())
            .on('headers', (header) => {
                headers.push(header)
             })
            .on('data', (data) => results.push(data))
            .on('end', () => {
                console.log(results);
            });
        */
  
        const snippet = this.buildSnippet(parsed, filepath);
        
        return snippet;
    }

    buildSnippet(data: Array<any>, filepath: string) {

        let headers: Array<string> = data[0];
        let numberofResults = data.length - 1
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