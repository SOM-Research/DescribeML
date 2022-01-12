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
Object.defineProperty(exports, "__esModule", { value: true });
exports.interruptAndCheck = exports.OperationCancelled = exports.setInterruptionPeriod = exports.startCancelableOperation = exports.delayNextTick = void 0;
const vscode_jsonrpc_1 = require("vscode-jsonrpc");
/**
 * Delays the execution of the current code to the next tick of the event loop.
 * Don't call this method directly in a tight loop to prevent too many promises from being created.
 */
function delayNextTick() {
    return new Promise(resolve => {
        setImmediate(resolve);
    });
}
exports.delayNextTick = delayNextTick;
let lastTick = 0;
let globalInterruptionPeriod = 10;
/**
 * Reset the global interruption period and create a cancellation token source.
 */
function startCancelableOperation() {
    lastTick = Date.now();
    return new vscode_jsonrpc_1.CancellationTokenSource();
}
exports.startCancelableOperation = startCancelableOperation;
/**
 * Change the period duration for `interruptAndCheck` to the given number of milliseconds.
 * The default value is 10ms.
 */
function setInterruptionPeriod(period) {
    globalInterruptionPeriod = period;
}
exports.setInterruptionPeriod = setInterruptionPeriod;
/**
 * This symbol may be thrown in an asynchronous context by any Langium service that receives
 * a `CancellationToken`. This means that the promise returned by such a service is rejected with
 * this symbol as rejection reason.
 */
exports.OperationCancelled = Symbol('OperationCancelled');
/**
 * This function does two things:
 *  1. Check the elapsed time since the last call to this function or to `startCancelableOperation`. If the predefined
 *     period (configured with `setInterruptionPeriod`) is exceeded, execution is delayed with `delayNextTick`.
 *  2. If the predefined period is not met yet or execution is resumed after an interruption, the given cancellation
 *     token is checked, and if cancellation is requested, `OperationCanceled` is thrown.
 *
 * All services in Langium that receive a `CancellationToken` may potentially call this function, so the
 * `CancellationToken` must be caught (with an `async` try-catch block or a `catch` callback attached to
 * the promise) to avoid that event being exposed as an error.
 */
function interruptAndCheck(token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (token === vscode_jsonrpc_1.CancellationToken.None) {
            // Early exit in case cancellation was disabled by the caller
            return;
        }
        const current = Date.now();
        if (current - lastTick >= globalInterruptionPeriod) {
            lastTick = current;
            yield delayNextTick();
        }
        if (token.isCancellationRequested) {
            throw exports.OperationCancelled;
        }
    });
}
exports.interruptAndCheck = interruptAndCheck;
//# sourceMappingURL=promise-util.js.map