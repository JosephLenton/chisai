import { Listenable } from './listenable';
import { OmitFirstArg } from './util/types';
export declare function buildStoreFactory<S, C extends Commits<S, C> = {}, A extends Accessors<S, A> = {}>(initialStateBuilder: () => S, commits?: C, accessors?: A): StoreFactory<S, C, A>;
export declare type StoreFactory<S, C extends Commits<S, C>, A extends Accessors<S, A>> = (initialState?: Partial<S>) => Store<S, C, A>;
export declare type Store<S, C extends Commits<S, C>, A extends Accessors<S, A>, St = StoreCommits<S, C> & StoreAccessors<S, A> & StoreCoreFunctions<S>> = StoreCommits<S, C> & StoreAccessors<S, A> & StoreCoreFunctions<S> & Listenable<St>;
export declare type StoreCommits<S, C extends Commits<S, C>> = {
    [K in keyof C]: OmitFirstArg<C[K]>;
};
export declare type StoreAccessors<S, A extends Accessors<S, A>> = {
    [K in keyof A]: OmitFirstArg<A[K]>;
};
export declare type Commits<S, T> = {
    [K in keyof T]: CommitFn<S>;
};
export declare type CommitFn<S> = (state: S, ...args: any) => any | never;
export declare type Accessors<S, T> = {
    [K in keyof T]: AccessorFn<S>;
};
export declare type AccessorFn<S> = (state: S, ...args: any) => any | never;
export declare type StoreCoreFunctions<S> = {
    getState: () => S;
    setState: (override: Partial<S>) => void;
};
