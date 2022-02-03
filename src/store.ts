import { newStoreListenerFunctions, StoreListener } from './listener'
import { OmitFirstArg } from './util/types'
import { StoreState } from './inner/store-state'

export function buildStoreFactory<
    S,
    C extends Commits<S, C> = {},
    A extends Accessors<S, A> = {},
>(
  initialStateBuilder: () => S,
  commits ?: C,
  accessors ?: A,
) : StoreFactory<S, C, A> {
  return (override = {}) => {
    const state = initialStateBuilder()
    const storeState = new StoreState({
      ...state,
      ...override,
    })
    const listener = newStoreListenerFunctions()
    const newStore = {
      ...newStoreCoreFunctions(storeState),
      ...listener,
    } as Store<S, C, A>

    appendCommitFunctions(newStore, storeState, commits, listener)
    appendAccessorFunctions(newStore, storeState, accessors)

    return newStore
  }
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
  listener: StoreListener<St>,
): void {
  if (!commits) {
    return
  }

  const commitKeys = Object.keys(commits) as Array<keyof C>
  commitKeys.map(key => {
    (newStore as any)[key] = (...args: unknown[]) => {
      const r = commits[key as keyof C](storeState.getState(), ...args)
      listener.update(newStore)
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

function newStoreCoreFunctions<S>(
  storeState: StoreState<S>,
): StoreCoreFunctions<S> {
  return {
    setState: (override: Partial<S>) => {
      storeState.setState(override)
    },
    getState: () => {
      return storeState.getState()
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
    St =
      & StoreCommits<S, C>
      & StoreAccessors<S, A>
      & StoreCoreFunctions<S>
> =
  & StoreCommits<S, C>
  & StoreAccessors<S, A>
  & StoreCoreFunctions<S>
  & StoreListener<St>

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

export type StoreCoreFunctions<S> = {
  getState: () => S
  setState: (override: Partial<S>) => void
}
