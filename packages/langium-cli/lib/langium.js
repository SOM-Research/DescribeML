"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("colors");
const fs_extra_1 = __importDefault(require("fs-extra"));
const commander_1 = require("commander");
const jsonschema_1 = require("jsonschema");
const generate_1 = require("./generate");
const util_1 = require("./generator/util");
const package_1 = require("./package");
const path_1 = __importDefault(require("path"));
const program = new commander_1.Command();
program
    .version(util_1.cliVersion)
    .command('generate')
    .description('Generate code for a Langium grammar')
    .option('-f, --file <file>', 'the configuration file or package.json setting up the generator')
    .option('-w, --watch', 'enables watch mode', false)
    .action((options) => {
    forEachConfig(options, generate_1.generate);
});
program.parse(process.argv);
function forEachConfig(options, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const configs = yield (0, package_1.loadConfigs)(options);
        const validation = (0, jsonschema_1.validate)(configs, util_1.schema, {
            nestedErrors: true
        });
        if (!validation.valid) {
            (0, util_1.log)('error', options, 'Error: Your Langium configuration is invalid.'.red);
            const errors = validation.errors.filter(error => error.path.length > 0);
            errors.forEach(error => {
                (0, util_1.log)('error', options, `--> ${error.stack}`);
            });
            process.exit(1);
        }
        const results = yield Promise.all(configs.map(config => callback(config, options)));
        const allSuccessful = results.every(result => result === 'success');
        if (options.watch) {
            if (allSuccessful) {
                console.log(`${(0, util_1.getTime)()}Langium generator finished ${'successfully'.green.bold} in ${(0, util_1.elapsedTime)()}ms`);
            }
            console.log((0, util_1.getTime)() + 'Langium generator will continue running in watch mode');
            for (const config of configs) {
                for (const language of config.languages) {
                    const grammarPath = path_1.default.resolve(config[package_1.RelativePath], language.grammar);
                    fs_extra_1.default.watchFile(grammarPath, () => __awaiter(this, void 0, void 0, function* () {
                        console.log((0, util_1.getTime)() + 'File change detected. Starting compilation...');
                        (0, util_1.elapsedTime)();
                        if ((yield callback(config, options)) === 'success') {
                            console.log(`${(0, util_1.getTime)()}Langium generator finished ${'successfully'.green.bold} in ${(0, util_1.elapsedTime)()}ms`);
                        }
                    }));
                }
            }
        }
        else if (!allSuccessful) {
            process.exit(1);
        }
        else {
            console.log(`Langium generator finished ${'successfully'.green.bold} in ${(0, util_1.elapsedTime)()}ms`);
        }
    });
}
//# sourceMappingURL=langium.js.map