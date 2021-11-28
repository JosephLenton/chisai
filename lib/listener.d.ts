export declare type StoreListener = {
    listen: (component: Component) => void;
    forget: (component: Component) => void;
    update: () => void;
};
export declare type Component = {
    forceUpdate(): void;
};
export declare function newStoreListenerFunctions(): StoreListener;
