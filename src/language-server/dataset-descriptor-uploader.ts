import { DatasetDescriptorServices } from './dataset-descriptor-module';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

export interface Uploader {
    uploadDataset(filepath: string) :   Promise<string> ;
    buildSnippet(data: Array<any>): string; 
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
       
        const parsed = parse(fileContent);
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
        const snippet = this.buildSnippet(parsed[0]);
        
        return snippet;
    }

    buildSnippet(data: Array<any>) {
        let body:string= `
            Instance:  ${filepath.split("/").pop()}
            \tdescription \"Instance Description\"
            \ttype raw
            \ttotal number 000
            \twithAttributes:\n`;

        
        data.forEach(attr => {
           body = body + '\t\t\t\t\t attribute  '+attr+' ofType  string  description: \"Describe the attribute \"\n';
        });
        return body;
    }
}