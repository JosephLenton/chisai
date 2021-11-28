export declare class StoreState<S> {
    private state;
    constructor(state: S);
    getState(): S;
    setState(newState: Partial<S>): void;
}
