import { StoreListener } from "./store-listener";
export declare type Listenable<S = unknown> = {
    listen: (component: StoreListener<S>) => void;
    forget: (component: StoreListener<S>) => void;
    update: () => void;
};
