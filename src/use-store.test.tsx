import React from 'react'
import { render, act } from '@testing-library/react'
import { useStore } from './use-store'
import { newExampleStore } from './store.example'

it('should only register the component once', testRegisterComponentOnce)
it('should force rerender after a store update', testStoreUpdate)
it('should rerender after multiple store updates', testMultipleStoreUpdates)

async function testRegisterComponentOnce() {
  const mockStore = newExampleStore({
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
  const mockStore = newExampleStore()

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
  const mockStore = newExampleStore()

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
