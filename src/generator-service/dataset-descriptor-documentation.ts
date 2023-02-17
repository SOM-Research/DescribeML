/******************************************************************************
 * Copyright 2022 SOM Research
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
 import { AstNode, LangiumParser} from 'langium';
import { createDatasetDescriptorServices } from '../language-server/dataset-descriptor-module';
 import { DescriptionDataset, isDescriptionDataset } from '../language-server/generated/ast';
 import { NodeFileSystem } from 'langium/node';


 
 
 export interface Generator {
     // Load the Abstract Syntax Tree of the .descML active file
     generate(Declaration : string | AstNode) : string | undefined;
     // Recieves the parsed AST, generates the HTML, and returns it
     declaration2Html(DescriptionDataset : DescriptionDataset) : string;
 }
 
 /**
  * Generator HTML service main class
  * To generate the HTML we parse the description and we use PUG as a engine teamplate to build the HTML
  */
 export class DocumentationGenerator implements Generator {
 
     private readonly parser: LangiumParser;
 
     constructor() {
       
        let services = createDatasetDescriptorServices(NodeFileSystem);
        this.parser = services.DatasetDescriptor.parser.LangiumParser;
    }
 
     generate(DescriptionDataset : string | AstNode) : string | undefined {
         const astNode = (typeof(DescriptionDataset) == 'string' ? this.parser.parse(DescriptionDataset).value : DescriptionDataset);
         return (isDescriptionDataset(astNode) ? this.declaration2Html(astNode) : undefined);
     }
 
     // Generation of the HTML
     declaration2Html(DescriptionDataset : DescriptionDataset) : string {
         const description = {
             title : DescriptionDataset.elements[0].name,
             metadata : DescriptionDataset.elements[0].generalinfo,
             composition : DescriptionDataset.elements[0].composition,
             provenance : DescriptionDataset.elements[0].provenance,
             socialConcerns : DescriptionDataset.elements[0].socialConcerns,
         }
         let head = `
 <html>
         <head>
             <title>${description.title}</title>
             <meta charset="utf-8"/>`;
         head = this.addSchemaOrg(description, head, description.title)
         head = this.addStyles(head);
         let body = this.buildBody(description);
         head = head + 
     `</head>` 
         const html = head + body 
         return html 
     }
 
     addSchemaOrg(description: any, head: string, title: string) : string {
 
         // Add Authors
         let authors = ""
         description.metadata.authoring.authors[0].authors.forEach(function (author: any) {
 
             authors = authors + 
         `"creator":{
             "@type":"Author",
             "url": "",
             "name":"${author.name}",
             "contactPoint":{
                 "@type":"ContactPoint",
                 "contactType": "email,
                 "email":${author.email}
             }
         },
     `
         })
 
         // Add funders
         let funders = ""
         if (description.metadata.authoring.founding.lenght > 0) {
             description.metadata.authoring.founding[0].funders.forEach(function (funder: any) {                
                     funders = funders + 
                 `"funder":{
                     "@type":"Funder",
                     "name":"${funder.name}",
                     "sameAs":"${funder.type}"
                 },
             `
             })
         }
 
         let areas = ''
         let tags = ''
         description.metadata.desc.tags.tags.forEach(function (tag: any) {
             tags = tags + tag.name + ',' 
         })
         description.metadata.desc.area.areas.forEach(function (area: any) {
             areas = areas + area.name + ',' 
         })

         head = head + `
         <script type="application/ld+json">
         {
         "@context":"https://schema.org/",
         "@type":"Dataset",
         "name":"${title}",
         "description":${description.metadata.desc.descriptionpurpose},
         "url":"",
         "sameAs":"",
         "identifier": [${description.metadata.ident}],
         "keywords":[
             "AREA > ${areas}",
             "TAGS > ${tags}",
         ],
         "license" : ${description.metadata.distribution.licence},
         "hasPart" : [
             {
             "@type": "Dataset",
             "name": ${('instances' in description.composition)? description.composition.instances.instances[0].name:""},
             "description": ${('instances' in description.composition)?description.composition.instances.instances[0].descript:""},
             },
         ],
         "includedInDataCatalog":{
             "@type":"DataCatalog",
             "name":"data.gov"
         },
         "distribution":[
             {
                 "@type":"DataDownload",
                 "encodingFormat":"CSV",
                 "contentUrl":"http://www.ncdc.noaa.gov/stormevents/ftp.jsp"
             },
             {
                 "@type":"DataDownload",
                 "encodingFormat":"XML",
                 "contentUrl":"http://gis.ncdc.noaa.gov/all-records/catalog/search/resource/details.page?id=gov.noaa.ncdc:C00510"
             }
         ],
         "temporalCoverage":"${description.metadata.dates.datesR}/${description.metadata.dates.datesU}",
      `;
 
         head = head + authors + funders + ` 
         }
         </script>`
         return head;
     }
 
     addStyles(head: string) : string {
         return head + `        
     <style>
         table {
         font-family: arial, sans-serif;
         border-collapse: collapse;
         width: 100%;
         }
 
         td, th {
         border: 1px solid #dddddd;
         text-align: left;
         padding: 8px;
         background-color:grey
         }
 
         tr:nth-child(even) {
         background-color: #dddddd;
         }
     </style>`
     }
 
     // The PUG file is located inside the "out" folder. As needs to be released in the executable plugin
     // So, you may need to go to /out/templates/document.pug to customize the template.
     buildBody(description: any) : any {
         const pug = require('pug');
         const path = require('path')
         let sep = path.sep
         let dirname = __dirname;
         // Compile the source code using PUG
         console.log(dirname+sep+'templates'+sep+'document.pug');
         const compiledFunction = pug.compileFile(dirname+sep+'templates'+sep+'document.pug');
         // Compile the source code
         return compiledFunction({
             description: description
           });
     }
 }
 