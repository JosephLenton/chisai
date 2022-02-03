export type StoreListener<S = unknown> = {
  listen: ( component: Component<S> ) => void
  forget: ( component: Component<S> ) => void
  update: (store: S) => void
}

export type Component<S = unknown> = {
  forceUpdate(store: S):void
}

export function newStoreListenerFunctions<S = unknown>():StoreListener<S> {
  const components : Component<S>[] = []

  return {
    listen: (component : Component<S>) => {
      for (let i = 0; i < components.length; i++) {
        if (components[i] === component) {
          throw new Error('already listening to component, listen has been called a second time')
        }
      }

      components.push(component)
    },

    forget: (component : Component<S>) => {
      const index = components.indexOf(component)
      if ( index === -1 ) {
        throw new Error('component not found to unlisten')
      }

      components.splice(index, 1)
    },

    update: (store: S) => {
      components.forEach(c => c.forceUpdate(store))
    },
  }
}
