import React from 'react'
import { StoreListener } from 'store-listener';
import { Listenable } from './listenable'

type ListenerKeys<T> = { [k in keyof T]: T[k] extends Listenable|undefined ? k : never }[keyof T];

interface InnerState<P> {
  lastStores: Record<ListenerKeys<P>, Listenable|undefined>
  listener: StoreListener
}

export function connect<P>(
    storeNames : ListenerKeys<P>[],
    InnerComponent : new(props: P) => React.Component<P>,
): new(props: P) => React.Component<P> {
  return class extends React.Component<P, InnerState<P>> {
    constructor( props: P ) {
      super( props )

      this.state = {
        lastStores: getStores(props, storeNames),
        listener: {
          onUpdate: () => this.forceUpdate(),
        },
      }
    }

    static getDerivedStateFromProps(props:P, state: InnerState<P>) {
      for (const storeName of storeNames) {
        const propStore = props[storeName] as any as Listenable|undefined
        const stateStore = state.lastStores[storeName]

        if (propStore !== stateStore) {
          return state
        }
      }

      return null
    }

    componentDidUpdate() {
      let hasChange = false

      for (const storeName of storeNames) {
        const propStore = this.props[storeName] as any as Listenable|undefined
        const stateStore = this.state.lastStores[storeName]

        if (propStore !== stateStore) {
          stateStore?.forget(this.state.listener)
          propStore?.listen(this.state.listener)

          hasChange = true
        }
      }

      if (hasChange) {
        this.setState({
          lastStores: getStores(this.props, storeNames)
        })
      }
    }

    componentDidMount() {
      for (const storeName of storeNames) {
        const store = this.props[storeName] as any as Listenable|undefined
        store?.listen(this.state.listener)
      }
    }

    componentWillUnmount() {
      for (const storeName of storeNames) {
        const store = this.props[storeName] as any as Listenable|undefined
        store?.forget(this.state.listener)
      }
    }

    render() {
      return <>
        <InnerComponent {...this.props} />
      </>
    }
  }
}

function getStores<P>(
  props: P,
  storeNames: ListenerKeys<P>[],
): Record<ListenerKeys<P>, Listenable|undefined> {
  const found: Record<ListenerKeys<P>, Listenable|undefined> = {} as any

  for (const storeName of storeNames) {
    found[storeName] = (props[storeName] as any as Listenable|undefined)
  }

  return found
}
