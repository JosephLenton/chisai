import { StoreListener } from "./store-listener"

export type Listenable<S = unknown> = {
  listen: (component: StoreListener<S>) => void
  forget: (component: StoreListener<S>) => void
  update: () => void
}
