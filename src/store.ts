import { Listenable } from './listenable'
import { OmitFirstArg } from './util/types'
import { StoreState } from './inner/store-state'
import { StoreListener } from './store-listener'

export function buildStoreFactory<
    S,
    C extends Commits<S, C> = {},
    A extends Accessors<S, A> = {},
>(
  initialStateBuilder: () => S,
  commits ?: C,
  accessors ?: A,
) : StoreFactory<S, C, A> {
  const storeConstructor = (override = {}) => {
    const state = initialStateBuilder()
    const storeState = new StoreState({
      ...state,
      ...override,
    })

    const newStore = {
      ...newStoreCoreFunctions(storeState, storeConstructor),
    } as Store<S, C, A>

    const components : StoreListener<Store<S, C, A>>[] = []
    const update = newUpdateStoreFunction(newStore, components)
    appendListenableFunctions(newStore, components, update)
    appendCommitFunctions(newStore, storeState, commits, update)
    appendAccessorFunctions(newStore, storeState, accessors)

    return newStore
  }

  return storeConstructor
}

function appendCommitFunctions<
    S,
    C extends Commits<S, C>,
    A extends Accessors<S, A> = {},
    St = Store<S, C, A>,
>(
  newStore: St,
  storeState: StoreState<S>,
  commits: C|undefined,
  update: () => void,
): void {
  if (!commits) {
    return
  }

  const commitKeys = Object.keys(commits) as Array<keyof C>
  commitKeys.map(key => {
    (newStore as any)[key] = (...args: unknown[]) => {
      const r = commits[key as keyof C](storeState.getState(), ...args)
      update()
      return r
    }
  })
}

function appendAccessorFunctions<
    S,
    C extends Commits<S, C>,
    A extends Accessors<S, A>,
    St = Store<S, C, A>,
>(
  newStore: St,
  storeState: StoreState<S>,
  commits: A|undefined,
): void {
  if (!commits) {
    return
  }

  const commitKeys = Object.keys(commits) as Array<keyof A>
  commitKeys.map(key => {
    (newStore as any)[key] = (...args: unknown[]) => {
      return commits[key](storeState.getState(), ...args)
    }
  })
}

function appendListenableFunctions<S = unknown>(
    newStore: S,
    components : StoreListener<S>[],
    update: () => void,
): void {
  (newStore as any).listen = (component : StoreListener<S>) => {
    const hasComponent = components.includes(component)
    if (hasComponent) {
      throw new Error('already listening to component, listen has been called a second time')
    }

    components.push(component)
    component.onListen?.(newStore)
  }

  (newStore as any).forget = (component : StoreListener<S>) => {
    const index = components.indexOf(component)
    if ( index === -1 ) {
      throw new Error('Component not found to unlisten')
    }

    components.splice(index, 1)
    component.onForget?.(newStore)
  }

  (newStore as any).update = update
}

function newUpdateStoreFunction<S = unknown>(
  newStore: S,
  components: StoreListener<S>[],
): () => void {
  return () => {
    components.forEach(c => c.onUpdate(newStore))
  }
}

function newStoreCoreFunctions<
    S,
    C extends Commits<S, C>,
    A extends Accessors<S, A>,
>(
  storeState: StoreState<S>,
  storeConstructor: (override: Partial<S>) => Store<S, C, A>,
): StoreCoreFunctions<S, C, A> {
  return {
    setState: (override: Partial<S>) => {
      storeState.setState(override)
    },
    getState: () => {
      return storeState.getState()
    },
    clone: (override: Partial<S> = {}) => {
      return storeConstructor({
        ...storeState.getState(),
        ...override,
      })
    },
  }
}

export type StoreFactory<
    S,
    C extends Commits<S, C>,
    A extends Accessors<S, A>,
> = (initialState?: Partial<S>) => Store<S, C, A>

export type Store<
    S,
    C extends Commits<S, C>,
    A extends Accessors<S, A>,
> =
  & StoreCommits<S, C>
  & StoreAccessors<S, A>
  & StoreCoreFunctions<S, C, A>
  & Listenable<Store<S, C, A>>

export type StoreCommits<
    S,
    C extends Commits<S, C>,
> = {
  [K in keyof C]: OmitFirstArg<C[K]>
}

export type StoreAccessors<
    S,
    A extends Accessors<S, A>,
> = {
  [K in keyof A]: OmitFirstArg<A[K]>
}

export type Commits<S, T> = {
  [K in keyof T]: CommitFn<S>
}
export type CommitFn<S> = (state: S, ...args: any) => any|never

export type Accessors<S, T> = {
  [K in keyof T]: AccessorFn<S>
}
export type AccessorFn<S> = (state: S, ...args: any) => any|never

export type StoreCoreFunctions<
  S,
  C extends Commits<S, C>,
  A extends Accessors<S, A>,
> = {
  getState: () => S
  setState: (override: Partial<S>) => void
  clone: (override?: Partial<S>) => Store<S, C, A>
}
