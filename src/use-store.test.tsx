import React from 'react'
import { render, act } from '@testing-library/react'
import { useStore } from './use-store'
import { ExampleNumberStore, newExampleNumberStore, newExampleParentStore } from './example-stores'

it('should only register the component once', testRegisterComponentOnce)
it('should force rerender after a store update', testStoreUpdate)
it('should rerender after multiple store updates', testMultipleStoreUpdates)
it('should be fine when same store is repeatedly passed in', testSameStore)
it('should allow switching store when different stores passed in', testSwitchingStore)
it('should allow unmounting', testUnmountingStore)

async function testRegisterComponentOnce() {
  const mockStore = newExampleNumberStore({
    exampleNumber: 456,
  })

  const ExampleComponent : React.FunctionComponent = () => {
    useStore([mockStore])
    return <div>{mockStore.getNumber()}</div>
  }

  const component = render(<ExampleComponent />)
  component.rerender(<ExampleComponent />)

  expect(component.getByText("456")).toBeInTheDocument()
}

async function testStoreUpdate() {
  const mockStore = newExampleNumberStore()

  const ExampleComponent : React.FunctionComponent = () => {
    useStore([mockStore])
    return <div>{mockStore.getNumber()}</div>
  }

  const component = render(<ExampleComponent />)

  expect(component.getByText("0")).toBeInTheDocument()

  await act(() => mockStore.setNumber(123))
  expect(component.getByText("123")).toBeInTheDocument()
}

async function testMultipleStoreUpdates() {
  const mockStore = newExampleNumberStore()

  const ExampleComponent : React.FunctionComponent = () => {
    useStore([mockStore])
    return <div>{mockStore.getNumber()}</div>
  }

  const component = render(<ExampleComponent />)

  await act(() => mockStore.setNumber(123))
  expect(component.getByText("123")).toBeInTheDocument()

  await act(() => mockStore.setNumber(666))
  expect(component.getByText("666")).toBeInTheDocument()

  await act(() => mockStore.setNumber(999))
  expect(component.getByText("999")).toBeInTheDocument()
}

async function testSameStore() {
  const childStore = newExampleNumberStore({
    exampleNumber: 123,
  })

  const parentStore = newExampleParentStore({
    childStore,
  })

  const ExampleNumberComponent : React.FunctionComponent<{store: ExampleNumberStore}> = props => {
    useStore([props.store])
    return <div>{props.store.getNumber()}</div>
  }

  const ExampleParentStoreComponent : React.FunctionComponent = () => {
    useStore([parentStore])
    return <ExampleNumberComponent store={parentStore.getNumberStore()} />
  }

  const component = render(<ExampleParentStoreComponent />)

  expect(component.getByText("123")).toBeInTheDocument()
  await act(() => parentStore.setNumberStore(childStore))
  expect(component.getByText("123")).toBeInTheDocument()
}

async function testSwitchingStore() {
  const initialNumberStore = newExampleNumberStore({
    exampleNumber: 123,
  })

  const parentStore = newExampleParentStore({
    childStore: initialNumberStore,
  })

  const ExampleParentStoreComponent : React.FunctionComponent = () => {
    useStore([parentStore])
    return <ExampleNumberComponent store={parentStore.getNumberStore()} />
  }

  const ExampleNumberComponent : React.FunctionComponent<{store: ExampleNumberStore}> = props => {
    useStore([props.store])
    return <div>{props.store.getNumber()}</div>
  }

  const component = render(<ExampleParentStoreComponent />)

  expect(component.getByText("123")).toBeInTheDocument()
  await act(() => parentStore.setNumberStore(newExampleNumberStore({
    exampleNumber: 666,
  })))
  expect(component.getByText("666")).toBeInTheDocument()

  await act(() => parentStore.setNumberStore(newExampleNumberStore({
    exampleNumber: 999,
  })))
  expect(component.getByText("999")).toBeInTheDocument()

  await act(() => parentStore.setNumberStore(initialNumberStore))
  expect(component.getByText("123")).toBeInTheDocument()
}

async function testUnmountingStore() {
  const parentStore = newExampleParentStore({
    childStore: newExampleNumberStore({
      exampleNumber: 123,
    }),
  })

  const ExampleParentStoreComponent : React.FunctionComponent = () => {
    useStore([parentStore])
    return <ExampleNumberComponent store={parentStore.getNumberStore()} />
  }

  const ExampleNumberComponent : React.FunctionComponent<{store: ExampleNumberStore}> = props => {
    useStore([props.store])
    return <div>{props.store.getNumber()}</div>
  }

  const component = render(<ExampleParentStoreComponent />)
  expect(component.getByText("123")).toBeInTheDocument()

  component.unmount() // This is the real test
}
