"use strict";
/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLangiumParser = void 0;
const ast_1 = require("../grammar/generated/ast");
const grammar_util_1 = require("../grammar/grammar-util");
const ast_util_1 = require("../utils/ast-util");
const stream_1 = require("../utils/stream");
const langium_parser_1 = require("./langium-parser");
function createLangiumParser(services) {
    const grammar = services.Grammar;
    const tokens = new Map();
    const buildTokens = services.parser.TokenBuilder.buildTokens(grammar, { caseInsensitive: services.LanguageMetaData.caseInsensitive });
    buildTokens.forEach(e => {
        tokens.set(e.name, e);
    });
    const rules = new Map();
    const parser = new langium_parser_1.LangiumParser(services, buildTokens);
    const parserContext = {
        parser,
        tokens,
        rules
    };
    buildParserRules(parserContext, grammar);
    parser.finalize();
    return parser;
}
exports.createLangiumParser = createLangiumParser;
function getRule(ctx, name) {
    const rule = ctx.rules.get(name);
    if (!rule)
        throw new Error(`Rule "${name}" not found."`);
    return rule;
}
function getToken(ctx, name) {
    const token = ctx.tokens.get(name);
    if (!token)
        throw new Error(`Token "${name}" not found."`);
    return token;
}
function buildParserRules(parserContext, grammar) {
    for (const rule of (0, stream_1.stream)(grammar.rules).filter(ast_1.isParserRule)) {
        const ctx = Object.assign(Object.assign({}, parserContext), { consume: 1, optional: 1, subrule: 1, many: 1, or: 1 });
        const method = (rule.entry ? ctx.parser.MAIN_RULE : ctx.parser.DEFINE_RULE).bind(ctx.parser);
        const type = rule.fragment ? undefined : (0, grammar_util_1.isDataTypeRule)(rule) ? langium_parser_1.DatatypeSymbol : (0, grammar_util_1.getTypeName)(rule);
        ctx.rules.set(rule.name, method(rule.name, type, buildRuleContent(ctx, rule)));
    }
}
function buildRuleContent(ctx, rule) {
    const method = buildElement(ctx, rule.alternatives);
    const arrays = [];
    (0, ast_util_1.streamAllContents)(rule.alternatives).forEach(e => {
        const item = e.node;
        if ((0, ast_1.isAssignment)(item) && (0, grammar_util_1.isArrayOperator)(item.operator)) {
            arrays.push(item.feature);
        }
    });
    return () => {
        ctx.parser.initializeElement(arrays);
        method();
        return ctx.parser.construct();
    };
}
function buildElement(ctx, element) {
    let method;
    if ((0, ast_1.isKeyword)(element)) {
        method = buildKeyword(ctx, element);
    }
    else if ((0, ast_1.isAction)(element)) {
        method = buildAction(ctx, element);
    }
    else if ((0, ast_1.isAssignment)(element)) {
        method = buildElement(ctx, element.terminal);
    }
    else if ((0, ast_1.isCrossReference)(element)) {
        method = buildCrossReference(ctx, element);
    }
    else if ((0, ast_1.isRuleCall)(element)) {
        method = buildRuleCall(ctx, element);
    }
    else if ((0, ast_1.isAlternatives)(element)) {
        method = buildAlternatives(ctx, element);
    }
    else if ((0, ast_1.isUnorderedGroup)(element)) {
        method = buildUnorderedGroup(ctx, element);
    }
    else if ((0, ast_1.isGroup)(element)) {
        method = buildGroup(ctx, element);
    }
    else {
        throw new Error();
    }
    return wrap(ctx, method, element.cardinality);
}
function buildRuleCall(ctx, ruleCall) {
    const rule = ruleCall.rule.ref;
    if ((0, ast_1.isParserRule)(rule)) {
        const idx = ctx.subrule++;
        if ((0, ast_util_1.hasContainerOfType)(ruleCall, ast_1.isAssignment) || (0, grammar_util_1.isDataTypeRule)(rule)) {
            return () => ctx.parser.subrule(idx, getRule(ctx, rule.name), ruleCall);
        }
        else {
            return () => ctx.parser.unassignedSubrule(idx, getRule(ctx, rule.name), ruleCall);
        }
    }
    else if ((0, ast_1.isTerminalRule)(rule)) {
        const idx = ctx.consume++;
        const method = getToken(ctx, rule.name);
        return () => ctx.parser.consume(idx, method, ruleCall);
    }
    else {
        throw new Error();
    }
}
function buildAlternatives(ctx, alternatives) {
    if (alternatives.elements.length === 1) {
        return buildElement(ctx, alternatives.elements[0]);
    }
    else {
        const methods = [];
        for (const element of alternatives.elements) {
            methods.push(buildElement(ctx, element));
        }
        const idx = ctx.or++;
        return () => ctx.parser.alternatives(idx, methods);
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildUnorderedGroup(ctx, group) {
    throw new Error('Unordered groups are not supported (yet)');
}
function buildGroup(ctx, group) {
    const methods = [];
    for (const element of group.elements) {
        methods.push(buildElement(ctx, element));
    }
    return () => methods.forEach(e => e());
}
function buildAction(ctx, action) {
    return () => ctx.parser.action(action.type, action);
}
function buildCrossReference(ctx, crossRef) {
    const terminal = crossRef.terminal;
    if (!terminal) {
        const idx = ctx.consume++;
        const idToken = getToken(ctx, 'ID');
        return () => ctx.parser.consume(idx, idToken, crossRef);
    }
    else if ((0, ast_1.isRuleCall)(terminal) && (0, ast_1.isParserRule)(terminal.rule.ref)) {
        const idx = ctx.subrule++;
        const name = terminal.rule.ref.name;
        return () => ctx.parser.subrule(idx, getRule(ctx, name), crossRef);
    }
    else if ((0, ast_1.isRuleCall)(terminal) && (0, ast_1.isTerminalRule)(terminal.rule.ref)) {
        const idx = ctx.consume++;
        const terminalRule = getToken(ctx, terminal.rule.ref.name);
        return () => ctx.parser.consume(idx, terminalRule, crossRef);
    }
    else {
        throw new Error();
    }
}
function buildKeyword(ctx, keyword) {
    const idx = ctx.consume++;
    const token = ctx.tokens.get(keyword.value);
    if (!token) {
        throw new Error();
    }
    return () => ctx.parser.consume(idx, token, keyword);
}
function wrap(ctx, method, cardinality) {
    if (!cardinality) {
        return method;
    }
    else if (cardinality === '*') {
        const idx = ctx.many++;
        return () => ctx.parser.many(idx, method);
    }
    else if (cardinality === '+') {
        const idx = ctx.many++;
        return () => ctx.parser.atLeastOne(idx, method);
    }
    else if (cardinality === '?') {
        const idx = ctx.optional++;
        return () => ctx.parser.optional(idx, method);
    }
    else {
        throw new Error();
    }
}
//# sourceMappingURL=langium-parser-builder.js.map