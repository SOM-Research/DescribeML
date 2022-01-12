"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./completion/completion-provider"), exports);
__exportStar(require("./completion/follow-element-computation"), exports);
__exportStar(require("./completion/rule-interpreter"), exports);
__exportStar(require("./code-action"), exports);
__exportStar(require("./document-highlighter"), exports);
__exportStar(require("./document-symbol-provider"), exports);
__exportStar(require("./folding-range-provider"), exports);
__exportStar(require("./goto"), exports);
__exportStar(require("./hover-provider"), exports);
__exportStar(require("./language-server"), exports);
__exportStar(require("./reference-finder"), exports);
__exportStar(require("./rename-refactoring"), exports);
//# sourceMappingURL=index.js.map