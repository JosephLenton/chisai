import React from 'react';
import { Listenable } from './listenable';
declare type ListenerKeys<T> = {
    [k in keyof T]: T[k] extends Listenable | undefined ? k : never;
}[keyof T];
export declare function connect<P>(storeNames: ListenerKeys<P>[], InnerComponent: new (props: P) => React.Component<P>): new (props: P) => React.Component<P>;
export {};
