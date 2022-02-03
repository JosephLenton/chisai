import { newExampleStore } from './store.example'

describe('listen', () => {
  it('listening to a store should not be immediately called', testNoImmediateCallOnListen)
  it('listening to a store should update when a commit is called', testListenForCommit)
  it('listening to a store should give you the store with access to it', testListenWithStoreGiven)

  describe('errors', () => {
    it('listening to a store multiple times should raise an error', testMultipleListensCauseError)
  })
})

describe('forget', () => {
  it('forgetting a store should stop it receiving updates', testForgetNoUpdate)

  describe('errors', () => {
    it('forgetting a listener never seen before should raise an error', testForgettingUnknownListener)
    it('forgetting a store multiple times should raise an error', testMultipleForgetsCauseError)
  })
})

async function testNoImmediateCallOnListen() {
  const mockStore = newExampleStore()
  const onCall = jest.fn()

  mockStore.listen({
    forceUpdate: onCall,
  })

  expect(onCall).not.toBeCalled()
}

async function testListenForCommit() {
  const mockStore = newExampleStore()
  const onCall = jest.fn()

  mockStore.listen({
    forceUpdate: onCall,
  })

  mockStore.setNumber(123)
  expect(onCall).toBeCalled()
}

async function testListenWithStoreGiven() {
  const mockStore = newExampleStore()
  const onCall = jest.fn()

  mockStore.listen({
    forceUpdate: store => {
      const currentNumber = store.getNumber()
      onCall(currentNumber)
    },
  })

  mockStore.setNumber(123)
  expect(onCall).toHaveBeenCalledWith(123)
}

async function testMultipleListensCauseError() {
  const mockStore = newExampleStore()
  const listener = {
    forceUpdate: () => {},
  }

  mockStore.listen(listener)

  expect(() => {
    mockStore.listen(listener)
  }).toThrowError()
}

async function testForgetNoUpdate() {
  const mockStore = newExampleStore()
  const listener = {
    forceUpdate: jest.fn(),
  }

  mockStore.listen(listener)
  mockStore.forget(listener)

  mockStore.setNumber(123)
  expect(listener.forceUpdate).not.toHaveBeenCalled()
}

async function testForgettingUnknownListener() {
  const mockStore = newExampleStore()
  const listener = {
    forceUpdate: () => {},
  }

  expect(() => {
    mockStore.forget(listener)
  }).toThrowError()
}

async function testMultipleForgetsCauseError() {
  const mockStore = newExampleStore()
  const listener = {
    forceUpdate: () => {},
  }

  mockStore.listen(listener)
  mockStore.forget(listener)

  expect(() => {
    mockStore.forget(listener)
  }).toThrowError()
}
