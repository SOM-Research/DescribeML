import { AstNode, LangiumParser } from 'langium';
import { DescriptionDataset, isDescriptionDataset } from './generated/ast';
import { DatasetDescriptorServices } from './dataset-descriptor-module';

export interface Generator {
    generate(Declaration : string | AstNode) : string | undefined;
}

/**
 * Generator for HTML that implements Declaration.
 */
export class DocumentationGenerator implements Generator {

    private readonly parser: LangiumParser;

    constructor(services: DatasetDescriptorServices) {
        this.parser = services.parser.LangiumParser;
    }

    generate(DescriptionDataset : string | AstNode) : string | undefined {
        console.log('hola');
        const astNode = (typeof(DescriptionDataset) == 'string' ? this.parser.parse(DescriptionDataset).value : DescriptionDataset);
        return (isDescriptionDataset(astNode) ? this.Declaration2Html(astNode) : undefined);
    }

    Declaration2Html(DescriptionDataset : DescriptionDataset) : string {
        const title = DescriptionDataset.elements[0].name;
        const html = 
`<html>
    <head>
	    <title>${title}</title>
	    <meta charset="utf-8"/>
    </head>
    <body>'''
        <h1> Esta es la documentacion de ${title} </h1>
        <script type="text/javascript">
        function isArray(o) {
            return o.length !== undefined;
        }
        function getInputElement(name) {
            return document.getElementById(name);
        }
        function hasModifier(s, mod) {
            return s.indexOf(mod) >= 0;
        }
        function checkInputEquals(input, prop, value, modifiers) {
            if (typeof input === 'string') {
                input = getInputElement(input);
            }
            var inputValue = input[prop];
            if (hasModifier(modifiers, '_')) {
                inputValue = inputValue.toLowerCase();
            }
            var matches = (inputValue == value);
            if (hasModifier(modifiers, '~')) {
                var regexpObject = new RegExp(value, "");
                matches = regexpObject.test(inputValue);
            }
            return [input, matches];
        }
        function validatedInput(result) {
            var input = result[0];
            if (isArray(input)) {
                for (var i = 0; i < result.length; i++) {
                    validatedInput(result[i]);
                }
                return;
            }
            var valid = true;
            for (var i = 1; i < result.length; i++) {
                if (! result[i]) {
                    valid = false;
                }
            }
            var color = "YellowGreen";
            if (! valid) {
                color = "Red";
            }
            input.style.backgroundColor = color;
        }
        </script>
    </body>
</html>`
        return html;
    }
}
