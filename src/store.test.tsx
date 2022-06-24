import { newExampleStore } from './store.example'

describe('clone', () => {
  it('should return a new store of the same type', testCloneReturnsStore)
  it('should allow overriding state', testCloneWithOverridedState)
})

async function testCloneReturnsStore() {
  const originalStore = newExampleStore({
    exampleNumber: 456,
  })

  const clonedStore = originalStore.clone()

  expect(clonedStore.getNumber()).toEqual(originalStore.getNumber())
}

async function testCloneWithOverridedState() {
  const originalStore = newExampleStore({
    exampleNumber: 456,
  })

  const clonedStore = originalStore.clone({
    exampleNumber: 123,
  })

  expect(clonedStore.getNumber()).not.toEqual(originalStore.getNumber())
  expect(clonedStore.getNumber()).toEqual(123)
}
