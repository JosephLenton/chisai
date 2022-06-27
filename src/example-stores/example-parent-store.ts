import { buildStoreFactory } from '../store'
import { ExampleNumberStore, newExampleNumberStore } from './example-number-store'

export interface ExampleParentState {
  childStore: ExampleNumberStore
}

export function newExampleParentState(override: Partial<ExampleParentState> = {}): ExampleParentState {
  return {
    childStore: newExampleNumberStore(),
    ...override,
  }
}

const commits = {
  setNumberStore(state: ExampleParentState, child: ExampleNumberStore) {
    state.childStore = child
  },
}

const getters = {
  getNumberStore(state: ExampleParentState) {
    return state.childStore
  }
}

export type ExampleParentStore = ReturnType<typeof newExampleParentStore>

export const newExampleParentStore = buildStoreFactory(
  newExampleParentState,
  commits,
  getters,
)
