import { newExampleStore } from './store.example'

describe('listen', () => {
  it('listening to a store should not be immediately called', testNoImmediateCallOnListen)
  it('listening to a store should update when a commit is called', testListenForCommit)
  it('listening to a store should give you the store with access to it', testListenWithStoreGiven)

  describe('onListen', () => {
    it('should call onListen when the store is first listened to', testOnListenIsCalled)
    it('should call onListen the once, and not after updates', testOnListenNotCalledAfterUpdate)
  })

  describe('errors', () => {
    it('listening to a store multiple times should raise an error', testMultipleListensCauseError)
  })
})

describe('forget', () => {
  it('forgetting a store should stop it receiving updates', testForgetNoUpdate)

  describe('onForget', () => {
    it('should call onForget when the store forgets listener', testOnForgetIsCalled)
    it('should not call onForget after any updates', testOnForgetIsNeverCalledByUpdate)
  })

  describe('errors', () => {
    it('forgetting a listener never seen before should raise an error', testForgettingUnknownListener)
    it('forgetting a store multiple times should raise an error', testMultipleForgetsCauseError)
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
