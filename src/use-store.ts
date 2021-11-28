import { useReducer, useEffect, useState } from 'react'
import { StoreListener } from './listener'

export function useStore(stores : StoreListener[]) {
  const forceUpdate = useReducer(() => ({}), {})[1] as () => void
  const [oldStores, setStores] = useState(stores)
  const [comp, _] = useState({
    forceUpdate,
  })

  useEffect(() => {
    let hasChange = false

    for (let i = 0; i < stores.length; i++) {
      const newStore = stores[i]
      const oldStore = oldStores[i]

      if (newStore !== oldStore) {
        oldStore.forget(comp)
        newStore.listen(comp)
        hasChange = true
      }
    }

    if (hasChange) {
      setStores(stores)
    }
  }, [stores])

  useEffect(() => {
    stores.forEach(store => {
      store.listen(comp)
    })

    return () => {
      stores.forEach(store => {
        store.forget(comp)
      })
    }
  }, [])
}
