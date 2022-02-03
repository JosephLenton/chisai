import { buildStoreFactory } from './store'

export interface ExampleState {
  exampleNumber: number,
}

export function newExampleState(override: Partial<ExampleState> = {}): ExampleState {
  return {
    exampleNumber: 0,
    ...override,
  }
}

const commits = {
  setNumber(state: ExampleState, newNumber: number) {
    state.exampleNumber = newNumber
  },
}

const getters = {
  getNumber(state: ExampleState) {
    return state.exampleNumber
  }
}

export type ExampleStore = ReturnType<typeof newExampleStore>

export const newExampleStore = buildStoreFactory(
  newExampleState,
  commits,
  getters,
)
