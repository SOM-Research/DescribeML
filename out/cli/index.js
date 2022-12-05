"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAction = void 0;
//import chalk from 'chalk';
const commander_1 = require("commander");
//import { Model } from '../language-server/generated/ast';
const module_1 = require("../language-server/generated/module");
//import { createDatasetDescriptorServices } from '../language-server/dataset-descriptor-module';
//import { extractAstNode } from './cli-util';
//import { generateJavaScript } from './generator';
//import { NodeFileSystem } from 'langium/node';
const generateAction = (fileName, opts) => __awaiter(void 0, void 0, void 0, function* () {
    // const services = createDatasetDescriptorServices(NodeFileSystem).DatasetDescriptor;
    //const model = await extractAstNode<Model>(fileName, services);
    //   const generatedFilePath = generateJavaScript(model, fileName, opts.destination);
    //console.log(chalk.green(`JavaScript code generated successfully: ${generatedFilePath}`));
});
exports.generateAction = generateAction;
function default_1() {
    const program = new commander_1.Command();
    program
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .version(require('../../package.json').version);
    const fileExtensions = module_1.DatasetDescriptorLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('generates JavaScript code that prints "Hello, {name}!" for each greeting in a source file')
        .action(exports.generateAction);
    program.parse(process.argv);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map