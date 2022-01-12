/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/
/**
 * A `Module<I>` is a description of possibly grouped service factories.
 *
 * Given a type I = { group: { service: A } },
 * Module<I> := { group: { service: (injector: I) => A } }
 *
 * Making `I` available during the creation of `I` allows us to create cyclic
 * dependencies.
 */
export declare type Module<I, T = I> = {
    [K in keyof T]: Module<I, T[K]> | ((injector: I) => T[K]);
};
/**
 * Given a set of modules, the inject function returns a lazily evaluted injector
 * that injects dependencies into the requested service when it is requested the
 * first time. Subsequent requests will return the same service.
 *
 * In the case of cyclic dependencies, an Error will be thrown. This can be fixed
 * by injecting a provider `() => T` instead of a `T`.
 *
 * Please note that the arguments may be objects or arrays. However, the result will
 * be an object. Using it with for..of will have no effect.
 *
 * @param module1 first Module
 * @param module2 (optional) second Module
 * @param module3 (optional) third Module
 * @param module4 (optional) fourth Module
 * @returns a new object of type I
 */
export declare function inject<I1, I2, I3, I4, I extends I1 & I2 & I3 & I4>(module1: Module<I, I1>, module2?: Module<I, I2>, module3?: Module<I, I3>, module4?: Module<I, I4>): I;
//# sourceMappingURL=dependency-injection.d.ts.map