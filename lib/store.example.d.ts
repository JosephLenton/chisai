export interface ExampleState {
    exampleNumber: number;
}
export declare function newExampleState(override?: Partial<ExampleState>): ExampleState;
export declare type ExampleStore = ReturnType<typeof newExampleStore>;
export declare const newExampleStore: import("./store").StoreFactory<ExampleState, {
    setNumber(state: ExampleState, newNumber: number): void;
}, {
    getNumber(state: ExampleState): number;
}>;
