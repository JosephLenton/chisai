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

    return {
      ...buildCommitFunctions(storeState, commits, listener),
      ...buildAccessorFunctions(storeState, accessors),
      ...buildStoreCoreFunctions(storeState),
      ...listener,
    }
  }
}

function buildCommitFunctions<
    S,
    C extends Commits<S, C>
>(
  storeState: StoreState<S>,
  commits: C|undefined,
  listener: StoreListener,
): StoreCommits<S, C> {
  if (!commits) {
    return {} as StoreCommits<S, C>
  }

  const newStore : any = {}

  Object.keys(commits).map(key => {
    newStore[key] = (...args: unknown[]) => {
      const r = commits[key as keyof C](storeState.getState(), ...args)
      listener.update()
      return r
    }
  })

  return newStore
}

function buildAccessorFunctions<
    S,
    A extends Accessors<S, A>
>(
  storeState: StoreState<S>,
  commits: A|undefined,
): StoreAccessors<S, A> {
  if (!commits) {
    return {} as StoreAccessors<S, A>
  }

  const newStore : any = {}

  Object.keys(commits).map(key => {
    newStore[key] = (...args: unknown[]) => {
      return commits[key as keyof A](storeState.getState(), ...args)
    }
  })

  return newStore
}

function buildStoreCoreFunctions<S>(
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
> =
  & StoreCommits<S, C>
  & StoreAccessors<S, A>
  & StoreCoreFunctions<S>
  & StoreListener

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
