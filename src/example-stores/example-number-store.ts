import { buildStoreFactory } from '../store'

export interface ExampleNumberState {
  exampleNumber: number,
}

export function newExampleNumberState(override: Partial<ExampleNumberState> = {}): ExampleNumberState {
  return {
    exampleNumber: 0,
    ...override,
  }
}

const commits = {
  setNumber(state: ExampleNumberState, newNumber: number) {
    state.exampleNumber = newNumber
  },
}

const getters = {
  getNumber(state: ExampleNumberState) {
    return state.exampleNumber
  }
}

export type ExampleNumberStore = ReturnType<typeof newExampleNumberStore>

export const newExampleNumberStore = buildStoreFactory(
  newExampleNumberState,
  commits,
  getters,
)
