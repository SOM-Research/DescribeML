"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const module_1 = require("../language-server/generated/module");
//import { generateAction } from './generator';
const program = new commander_1.Command();
program
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .version(require('../../package.json').version);
program
    .command('generate')
    .argument('<file>', `possible file extensions: ${module_1.DatasetDescriptorLanguageMetaData.fileExtensions.join(', ')}`)
    .option('-d, --destination <dir>', 'destination directory of generating')
    .option('-r, --root <dir>', 'source root folder')
    .description('generates Java classes by Entity description');
//   .action(generateAction);
program.parse(process.argv);
//# sourceMappingURL=cli.js.map