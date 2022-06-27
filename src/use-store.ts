import { useEffect, useState, useCallback } from 'react'
import { StoreListener } from './store-listener'
import { Listenable } from './listenable'

interface StoreState {
  stores: Listenable<any>[],
}

export function useStore(stores : Listenable<any>[]) {
  const listener = useComponentListener()
  const [storesState] = useState<StoreState>({
    stores,
  })

  useEffect(() => {
    stores.forEach(store => {
      store.listen(listener)
    })

    return () => {
      const stores = storesState.stores

      stores.forEach(store => {
        store.forget(listener)
      })
    }
  }, [])

  useEffect(() => {
    let hasChange = false

    const oldStores = storesState.stores
    let oldStoreCount = oldStores.length
    for (let i = 0; i < stores.length; i++) {
      const newStore = stores[i]

      if (oldStores[i] === newStore || oldStores.includes(newStore)) {
        oldStoreCount--
      } else {
        hasChange = true
        newStore.listen(listener)
      }
    }

    if (oldStoreCount > 0) {
      for (let i = 0; i < oldStores.length && oldStoreCount > 0; i++) {
        const oldStore = oldStores[i]

        if (!stores.includes(oldStore)) {
          hasChange = true
          oldStoreCount--
          oldStore.forget(listener)
        }
      }

      if (oldStoreCount > 0) {
        throw new Error('Left over stores found; expected all stores to be found at this point in code')
      }
    }

    if (hasChange) {
      storesState.stores = stores
    }
  }, [stores])
}

function useComponentListener(): StoreListener {
  const [, updateState] = useState<{}>()
  const forceUpdate = useCallback(() => updateState({}), [])

  const [listener] = useState({
    onUpdate: forceUpdate,
  })

  return listener
}
