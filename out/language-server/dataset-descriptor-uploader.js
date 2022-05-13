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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatasetUploader = void 0;
const sync_1 = require("csv-parse/sync");
const fs_1 = __importDefault(require("fs"));
/**
 * Generator for HTML that implements Declaration.
*/
class DatasetUploader {
    //private readonly parser: LangiumParser;
    constructor(services) {
        //this.parser = services.parser.LangiumParser;
    }
    uploadDataset(filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileContent = fs_1.default.readFileSync(filepath, { encoding: 'utf-8' });
            const parsed = (0, sync_1.parse)(fileContent);
            const snippet = this.buildSnippet(parsed, filepath);
            return snippet;
        });
    }
    buildSnippet(data, filepath) {
        var _a;
        // Get Headers
        const headers = data[0];
        // Get number of rows
        const numberofResults = data.length - 1;
        // Can we infer the most probable type?
        // If number, can we calculate ranges?
        // Can we count the number of empty or NANs values in a attibute column?
        let body = `
        Instance:  ${(_a = filepath.split("\\").pop()) === null || _a === void 0 ? void 0 : _a.split(".")[0]}
        \tDescription: \"Describe the instance\"
        \tType: Record_Data
        \tNumber of attributes: ${numberofResults}
        \tComposition:\n`;
        headers.forEach((attr, index) => {
            // Can we calculate attribute completeness?
            let attrData = data.map(function (value, index2) { return value[index]; });
            const datHeaders = attrData.shift();
            // Completness
            const completness = this.attributeCompletness(attrData);
            // Unique
            const unique = this.attributeUnique(attrData);
            // If number Mean and Standard Desviation
            //const std = math.std(dataWithoutHeaders);
            //const meand = math.mean(dataWithoutHeaders);
            // If String word count
            console.log(completness);
            body = body + `\t\t\t\t\tattribute:  ${datHeaders.replaceAll(' ', '_')}  
                        description: \"Describe the attribute\"
                        unique: ${unique}
                        completness: ${completness} 
                        // ofType: Categorical
                        // E.D.A. Stuff \n`;
        });
        return body;
    }
    attributeUnique(attrData) {
        let uniques = attrData.filter((v, i, a) => a.indexOf(v) === i);
        return uniques.length;
    }
    attributeCompletness(attrData) {
        let validValues = 0;
        attrData.forEach(element => {
            if (element) {
                console.log(element);
            }
            if (element === undefined || element === null || element == '' || element == 'NaN') {
            }
            else {
                validValues = validValues + 1;
            }
        });
        if (validValues != 0)
            return ((validValues / attrData.length) * 100).toFixed(0);
        else
            return 0;
    }
}
exports.DatasetUploader = DatasetUploader;
//# sourceMappingURL=dataset-descriptor-uploader.js.map