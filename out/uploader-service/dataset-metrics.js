"use strict";
/******************************************************************************
 * Copyright 2022 SOM Research
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatasetMetrics = void 0;
/**
 * Data uploader service main class
*/
class DatasetMetrics {
    attributeUnique(attrData) {
        let uniques = attrData.filter((v, i, a) => a.indexOf(v) === i);
        return uniques.length;
    }
    attributeCompletness(attrData) {
        let validValues = 0;
        attrData.forEach(element => {
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
    attributeCatDist(attrData) {
        let percent = 0;
        let body = "[";
        let uniques = attrData.filter((v, i, a) => a.indexOf(v) === i);
        uniques.forEach((value, idx, array) => {
            percent = (attrData.filter((v) => (v === value)).length / attrData.length) * 100;
            if (percent >= 0.1) {
                body = body + '"' + value + '"' + ":" + (Math.round(percent * 10) / 10) + '%, ';
            }
        });
        body = body.slice(0, -2) + "]";
        if (body.length < 5)
            return false;
        else
            return body;
    }
    isAttributeNumerical(attrData) {
        let isNumber = true;
        attrData.forEach(value => {
            if (isNaN(Number(value)))
                isNumber = false;
        });
        return isNumber;
    }
    attributeMode(arr) {
        const mode = [];
        let max = 0, count = 0;
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (mode[item]) {
                mode[item]++;
            }
            else {
                mode[item] = 1;
            }
            if (count < mode[item]) {
                max = item;
                count = mode[item];
            }
        }
        return max;
    }
    ;
}
exports.DatasetMetrics = DatasetMetrics;
//# sourceMappingURL=dataset-metrics.js.map