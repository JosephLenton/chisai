import { useEffect, useState, useCallback } from 'react'
import { StoreListener } from './store-listener'
import { Listenable } from './listenable'

export function useStore(stores : Listenable<any>[]) {
  const listener = useComponentListener()
  const [oldStores, setStores] = useState(stores)

  useEffect(() => {
    let hasChange = false

    for (let i = 0; i < stores.length; i++) {
      const newStore = stores[i]
      const oldStore = oldStores[i]

      if (newStore !== oldStore) {
        oldStore.forget(listener)
        newStore.listen(listener)
        hasChange = true
      }
    }

    if (hasChange) {
      setStores(stores)
    }
  }, [stores])

  useEffect(() => {
    stores.forEach(store => {
      store.listen(listener)
    })

    return () => {
      stores.forEach(store => {
        store.forget(listener)
      })
    }
  }, [])
}

function useComponentListener(): StoreListener {
  const [, updateState] = useState<{}>()
  const forceUpdate = useCallback(() => updateState({}), [])
  const [listener] = useState({
    onUpdate: forceUpdate,
  })

  return listener
}
