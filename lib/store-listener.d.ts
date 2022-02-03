export declare type StoreListener<S = unknown> = {
    onListen?: (store: S) => void;
    onUpdate(store: S): void;
    onForget?: (store: S) => void;
};
