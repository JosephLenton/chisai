import React, { useReducer, useState, useEffect } from 'react';

function newStoreListenerFunctions() {
    const components = [];
    return {
        listen: (component) => {
            components.push(component);
        },
        forget: (component) => {
            const index = components.indexOf(component);
            if (index === -1) {
                throw new Error('component not found to unlisten');
            }
            components.splice(index, 1);
        },
        update: () => {
            components.forEach(c => c.forceUpdate());
        },
    };
}

class StoreState {
    state;
    constructor(state) {
        this.state = state;
    }
    getState() {
        return this.state;
    }
    setState(newState) {
        this.state = {
            ...this.state,
            ...newState,
        };
    }
}

function buildStoreFactory(initialStateBuilder, commits, accessors) {
    return (override = {}) => {
        const state = initialStateBuilder();
        const storeState = new StoreState({
            ...state,
            ...override,
        });
        const listener = newStoreListenerFunctions();
        return {
            ...buildCommitFunctions(storeState, commits, listener),
            ...buildAccessorFunctions(storeState, accessors),
            ...buildStoreCoreFunctions(storeState),
            ...listener,
        };
    };
}
function buildCommitFunctions(storeState, commits, listener) {
    if (!commits) {
        return {};
    }
    const newStore = {};
    Object.keys(commits).map(key => {
        newStore[key] = (...args) => {
            const r = commits[key](storeState.getState(), ...args);
            listener.update();
            return r;
        };
    });
    return newStore;
}
function buildAccessorFunctions(storeState, commits) {
    if (!commits) {
        return {};
    }
    const newStore = {};
    Object.keys(commits).map(key => {
        newStore[key] = (...args) => {
            return commits[key](storeState.getState(), ...args);
        };
    });
    return newStore;
}
function buildStoreCoreFunctions(storeState) {
    return {
        setState: (override) => {
            storeState.setState(override);
        },
        getState: () => {
            return storeState.getState();
        },
    };
}

function connect(storeNames, InnerComponent) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                lastStores: getStores(props, storeNames)
            };
        }
        static getDerivedStateFromProps(props, state) {
            for (const storeName of storeNames) {
                const propStore = props[storeName];
                const stateStore = state.lastStores[storeName];
                if (propStore !== stateStore) {
                    return state;
                }
            }
            return null;
        }
        componentDidUpdate() {
            let hasChange = false;
            for (const storeName of storeNames) {
                const propStore = this.props[storeName];
                const stateStore = this.state.lastStores[storeName];
                if (propStore !== stateStore) {
                    stateStore?.forget(this);
                    propStore?.listen(this);
                    hasChange = true;
                }
            }
            if (hasChange) {
                this.setState({
                    lastStores: getStores(this.props, storeNames)
                });
            }
        }
        componentDidMount() {
            for (const storeName of storeNames) {
                const store = this.props[storeName];
                store?.listen(this);
            }
        }
        componentWillUnmount() {
            for (const storeName of storeNames) {
                const store = this.props[storeName];
                store?.forget(this);
            }
        }
        render() {
            return React.createElement(React.Fragment, null,
                React.createElement(InnerComponent, { ...this.props }));
        }
    };
}
function getStores(props, storeNames) {
    const found = {};
    for (const storeName of storeNames) {
        found[storeName] = props[storeName];
    }
    return found;
}

function useStore(stores) {
    const forceUpdate = useReducer(() => ({}), {})[1];
    const [oldStores, setStores] = useState(stores);
    const [comp, _] = useState({
        forceUpdate,
    });
    useEffect(() => {
        let hasChange = false;
        for (let i = 0; i < stores.length; i++) {
            const newStore = stores[i];
            const oldStore = oldStores[i];
            if (newStore !== oldStore) {
                oldStore.forget(comp);
                newStore.listen(comp);
                hasChange = true;
            }
        }
        if (hasChange) {
            setStores(stores);
        }
    }, [stores]);
    useEffect(() => {
        stores.forEach(store => {
            store.listen(comp);
        });
        return () => {
            stores.forEach(store => {
                store.forget(comp);
            });
        };
    }, []);
}

export { buildStoreFactory, connect, newStoreListenerFunctions, useStore };
//# sourceMappingURL=index.js.map
