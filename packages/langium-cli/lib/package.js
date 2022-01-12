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
exports.loadConfigs = exports.RelativePath = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const util_1 = require("./generator/util");
exports.RelativePath = Symbol('RelativePath');
function loadConfigs(options) {
    return __awaiter(this, void 0, void 0, function* () {
        let filePath;
        if (options.file) {
            filePath = path_1.default.normalize(options.file);
        }
        else {
            let defaultFile = 'langium-config.json';
            if (!fs_extra_1.default.existsSync(defaultFile)) {
                defaultFile = 'package.json';
            }
            filePath = path_1.default.normalize(defaultFile);
        }
        const relativePath = path_1.default.dirname(filePath);
        (0, util_1.log)('log', options, `Reading config from ${filePath.white.bold}`);
        try {
            const obj = yield fs_extra_1.default.readJson(filePath, { encoding: 'utf-8' });
            const config = path_1.default.basename(filePath) === 'package.json' ? obj.langium : obj;
            if (Array.isArray(config)) {
                config.forEach(c => {
                    c[exports.RelativePath] = relativePath;
                });
                return config;
            }
            else {
                config[exports.RelativePath] = relativePath;
            }
            return [config];
        }
        catch (err) {
            (0, util_1.log)('error', options, 'Failed to read config file.'.red, err);
            process.exit(1);
        }
    });
}
exports.loadConfigs = loadConfigs;
//# sourceMappingURL=package.js.map