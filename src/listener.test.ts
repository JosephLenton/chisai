import { ExampleStore, newExampleStore } from './store.example'

describe('listen', () => {
  it('should not call onUpdate immediately when listening to a store', testNoImmediateCallOnListen)
  it(`should call onUpdate when a store's commits are called`, testListenForCommit)
  it('should compile with listener types', testListenerTypesCompile)
  it('should provide store object in onUpdate', testListenWithStoreGiven)

  describe('onListen', () => {
    it('should call onListen when the store is first listened to', testOnListenIsCalled)
    it('should call onListen the once, and not after updates', testOnListenNotCalledAfterUpdate)
  })

  describe('errors', () => {
    it('should raise an error when listening to a store multiple times', testMultipleListensCauseError)
  })
})

describe('forget', () => {
  it('should stop giving updates when a store forgets a listener', testForgetNoUpdate)

  describe('onForget', () => {
    it('should call onForget when the store forgets listener', testOnForgetIsCalled)
    it('should not call onForget after any updates', testOnForgetIsNeverCalledByUpdate)
  })

  describe('errors', () => {
    it('should raise an error when forgetting a listener never seen before', testForgettingUnknownListener)
    it('should raise an error when forgetting a store multiple times', testMultipleForgetsCauseError)
  })
})

async function testNoImmediateCallOnListen() {
  const mockStore = newExampleStore()
  const onCall = jest.fn()

  mockStore.listen({
    onUpdate: onCall,
  })

  expect(onCall).not.toBeCalled()
}

async function testListenForCommit() {
  const mockStore = newExampleStore()
  const onCall = jest.fn()

  mockStore.listen({
    onUpdate: onCall,
  })
  mockStore.setNumber(123)

  expect(onCall).toBeCalled()
}

async function testListenerTypesCompile() {
  const mockStore = newExampleStore()
  const onCall = jest.fn()

  const listener = {
    onUpdate: (store: ExampleStore) => {
      const currentNumber = store.getNumber()
      onCall(currentNumber)
    },
  }

  mockStore.listen(listener)
  mockStore.setNumber(123)

  expect(onCall).toBeCalled()
}

async function testListenWithStoreGiven() {
  const mockStore = newExampleStore()
  const onCall = jest.fn()

  mockStore.listen({
    onUpdate: store => {
      const currentNumber = store.getNumber()
      onCall(currentNumber)
    },
  })

  mockStore.setNumber(123)
  expect(onCall).toHaveBeenCalledWith(123)
}

async function testOnListenIsCalled() {
  const mockStore = newExampleStore()
  const listener = {
    onListen: jest.fn(),
    onUpdate: () => {},
  }

  mockStore.listen(listener)
  expect(listener.onListen).toHaveBeenCalled()
}

async function testOnListenNotCalledAfterUpdate() {
  const mockStore = newExampleStore()
  const listener = {
    onListen: jest.fn(),
    onUpdate: () => {},
  }

  mockStore.listen(listener)
  mockStore.setNumber(123)
  mockStore.setNumber(456)
  expect(listener.onListen).toHaveBeenCalledTimes(1)
}

async function testMultipleListensCauseError() {
  const mockStore = newExampleStore()
  const listener = {
    onUpdate: () => {},
  }

  mockStore.listen(listener)

  expect(() => {
    mockStore.listen(listener)
  }).toThrowError()
}

async function testForgetNoUpdate() {
  const mockStore = newExampleStore()
  const listener = {
    onUpdate: jest.fn(),
  }

  mockStore.listen(listener)
  mockStore.forget(listener)
  mockStore.setNumber(123)

  expect(listener.onUpdate).not.toHaveBeenCalled()
}

async function testOnForgetIsCalled() {
  const mockStore = newExampleStore()
  const listener = {
    onForget: jest.fn(),
    onUpdate: () => {},
  }

  mockStore.listen(listener)
  mockStore.forget(listener)

  expect(listener.onForget).toHaveBeenCalled()
}

async function testOnForgetIsNeverCalledByUpdate() {
  const mockStore = newExampleStore()
  const listener = {
    onForget: jest.fn(),
    onUpdate: () => {},
  }

  mockStore.listen(listener)
  mockStore.setNumber(123)
  mockStore.setNumber(456)

  expect(listener.onForget).not.toBeCalled()
}

async function testForgettingUnknownListener() {
  const mockStore = newExampleStore()
  const listener = {
    onUpdate: () => {},
  }

  expect(() => {
    mockStore.forget(listener)
  }).toThrowError()
}

async function testMultipleForgetsCauseError() {
  const mockStore = newExampleStore()
  const listener = {
    onUpdate: () => {},
  }

  mockStore.listen(listener)
  mockStore.forget(listener)

  expect(() => {
    mockStore.forget(listener)
  }).toThrowError()
}
