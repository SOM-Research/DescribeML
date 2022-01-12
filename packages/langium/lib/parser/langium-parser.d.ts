/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
import { ILexingError, IRecognitionException, TokenType } from 'chevrotain';
import { AbstractElement, Action } from '../grammar/generated/ast';
import { LangiumServices } from '../services';
import { AstNode } from '../syntax-tree';
export declare type ParseResult<T = AstNode> = {
    value: T;
    parserErrors: IRecognitionException[];
    lexerErrors: ILexingError[];
};
export declare const DatatypeSymbol: unique symbol;
declare type RuleResult = () => any;
export declare class LangiumParser {
    private readonly linker;
    private readonly converter;
    private readonly lexer;
    private readonly nodeBuilder;
    private readonly wrapper;
    private stack;
    private mainRule;
    private assignmentMap;
    private get current();
    constructor(services: LangiumServices, tokens: TokenType[]);
    MAIN_RULE(name: string, type: string | symbol | undefined, implementation: () => unknown): () => unknown;
    DEFINE_RULE(name: string, type: string | symbol | undefined, implementation: () => unknown): () => unknown;
    parse<T extends AstNode = AstNode>(input: string): ParseResult<T>;
    private addHiddenTokens;
    private addHiddenToken;
    private startImplementation;
    alternatives(idx: number, choices: Array<() => void>): void;
    optional(idx: number, callback: () => void): void;
    many(idx: number, callback: () => void): void;
    atLeastOne(idx: number, callback: () => void): void;
    consume(idx: number, tokenType: TokenType, feature: AbstractElement): void;
    unassignedSubrule(idx: number, rule: RuleResult, feature: AbstractElement): void;
    subrule(idx: number, rule: RuleResult, feature: AbstractElement): any;
    action($type: string, action: Action): void;
    /**
     * Initializes array fields of the current object. Array fields are not allowed to be undefined.
     * Therefore, all array fields are initialized with an empty array.
     * @param initialArrayProperties The grammar access element that belongs to the current rule
     */
    initializeElement(initialArrayProperties: string[]): void;
    construct(pop?: boolean): unknown;
    private getAssignment;
    private assign;
    private assignWithoutOverride;
    finalize(): void;
}
export {};
//# sourceMappingURL=langium-parser.d.ts.map