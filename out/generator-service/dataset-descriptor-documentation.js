"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationGenerator = void 0;
const dataset_descriptor_module_1 = require("../language-server/dataset-descriptor-module");
const ast_1 = require("../language-server/generated/ast");
const node_1 = require("langium/node");
/**
 * Generator HTML service main class
 * To generate the HTML we parse the description and we use PUG as a engine teamplate to build the HTML
 */
class DocumentationGenerator {
    constructor() {
        let services = (0, dataset_descriptor_module_1.createDatasetDescriptorServices)(node_1.NodeFileSystem);
        this.parser = services.DatasetDescriptor.parser.LangiumParser;
    }
    generate(DescriptionDataset) {
        const astNode = (typeof (DescriptionDataset) == 'string' ? this.parser.parse(DescriptionDataset).value : DescriptionDataset);
        return ((0, ast_1.isDescriptionDataset)(astNode) ? this.declaration2Html(astNode) : undefined);
    }
    // Generation of the HTML
    declaration2Html(DescriptionDataset) {
        const description = {
            title: DescriptionDataset.elements[0].name,
            metadata: DescriptionDataset.elements[0].generalinfo,
            composition: DescriptionDataset.elements[0].composition,
            provenance: DescriptionDataset.elements[0].provenance,
            socialConcerns: DescriptionDataset.elements[0].socialConcerns,
        };
        let head = `
 <html>
         <head>
             <title>${description.title}</title>
             <meta charset="utf-8"/>`;
        head = this.addSchemaOrg(description, head, description.title);
        head = this.addStyles(head);
        let body = this.buildBody(description);
        head = head +
            `</head>`;
        const html = head + body;
        return html;
    }
    addSchemaOrg(description, head, title) {
        // Add Authors
        let authors = "";
        description.metadata.authoring.authors[0].authors.forEach(function (author) {
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
     `;
        });
        // Add funders
        let funders = "";
        if (description.metadata.authoring.founding.lenght > 0) {
            description.metadata.authoring.founding[0].funders.forEach(function (funder) {
                funders = funders +
                    `"funder":{
                     "@type":"Funder",
                     "name":"${funder.name}",
                     "sameAs":"${funder.type}"
                 },
             `;
            });
        }
        let areas = '';
        let tags = '';
        description.metadata.desc.tags.tags.forEach(function (tag) {
            tags = tags + tag.name + ',';
        });
        description.metadata.desc.area.areas.forEach(function (area) {
            areas = areas + area.name + ',';
        });
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
             "name": ${description.composition.instances[0].instances[0].name},
             "description": ${description.composition.instances[0].instances[0].descript},
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
         </script>`;
        return head;
    }
    addStyles(head) {
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
     </style>`;
    }
    // The PUG file is located inside the "out" folder. As needs to be released in the executable plugin
    // So, you may need to go to /out/templates/document.pug to customize the template.
    buildBody(description) {
        const pug = require('pug');
        const path = require('path');
        let sep = path.sep;
        let dirname = __dirname;
        // Compile the source code using PUG
        console.log(dirname + sep + 'templates' + sep + 'document.pug');
        const compiledFunction = pug.compileFile(dirname + sep + 'templates' + sep + 'document.pug');
        // Compile the source code
        return compiledFunction({
            description: description
        });
    }
}
exports.DocumentationGenerator = DocumentationGenerator;
//# sourceMappingURL=dataset-descriptor-documentation.js.map