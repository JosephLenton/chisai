export type StoreListener = {
  listen: ( component: Component ) => void
  forget: ( component: Component ) => void
  update: () => void
}

export type Component = {
  forceUpdate():void
}

export function newStoreListenerFunctions():StoreListener {
  const components : Component[] = []

  return {
    listen: (component : Component) => {
      components.push(component)
    },

    forget: (component : Component) => {
      const index = components.indexOf(component)
      if ( index === -1 ) {
        throw new Error('component not found to unlisten')
      }

      components.splice(index, 1)
    },

    update: () => {
      components.forEach(c => c.forceUpdate())
    },
  }
}
