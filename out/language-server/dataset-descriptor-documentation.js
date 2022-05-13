"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationGenerator = void 0;
const ast_1 = require("./generated/ast");
/**
 * Generator for HTML that implements Declaration.
 */
class DocumentationGenerator {
    constructor(services) {
        this.parser = services.parser.LangiumParser;
    }
    generate(DescriptionDataset) {
        console.log('hola');
        const astNode = (typeof (DescriptionDataset) == 'string' ? this.parser.parse(DescriptionDataset).value : DescriptionDataset);
        return ((0, ast_1.isDescriptionDataset)(astNode) ? this.Declaration2Html(astNode) : undefined);
    }
    Declaration2Html(DescriptionDataset) {
        const title = DescriptionDataset.elements[0].name;
        const metadata = DescriptionDataset.elements[0].generalinfo;
        const html = `<html>
    <head>
	    <title>${title}</title>
	    <meta charset="utf-8"/>
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
        </style>
    </head>
    <body>'''
        <h1> Documentation of ${title} </h1>
        <br>
        <div> 
            <h2> Who created the dataset? </h2>
            <table>
                <tr>
                <th>Name</th>
                <th>email</th>
                </tr>
                <tr>
                <td>${DescriptionDataset.elements[0].generalinfo.authoring.authors[0].authors[0].name}</td>
                <td>${DescriptionDataset.elements[0].generalinfo.authoring.authors[0].authors[0].email}</td>
                </tr>
                <tr>
                <td>${DescriptionDataset.elements[0].generalinfo.authoring.authors[0].authors[1].name}</td>
                <td>${DescriptionDataset.elements[0].generalinfo.authoring.authors[0].authors[1].email}</td>
                </tr>
            </table>
        </div>
        <div>
            <h2> For what prupose was the dataset created?</h2>
            <p> ${metadata.descriptionpurpose}</p>
        </div>
        <div>
            <h2> Was there any specific tasks?</h2>
            <p> ${metadata.descriptionTasks}</p>
        </div>
        <div>
            <h2> Was there a specific gap that needed to be filled?d?</h2>
            <p> ${metadata.descriptionGaps}</p>
        </div>

       
    </body>
</html>`;
        return html;
    }
}
exports.DocumentationGenerator = DocumentationGenerator;
//# sourceMappingURL=dataset-descriptor-documentation.js.map