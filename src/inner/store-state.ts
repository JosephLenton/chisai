export class StoreState<S> {
  private state : S

  constructor(state : S) {
    this.state = state
  }

  getState(): S {
    return this.state
  }

  setState(newState: Partial<S>) {
    this.state = {
      ...this.state,
      ...newState,
    }
  }
}
