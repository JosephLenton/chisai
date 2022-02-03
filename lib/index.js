import React, { useState, useEffect, useCallback } from 'react';

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
        const newStore = {
            ...newStoreCoreFunctions(storeState),
        };
        const components = [];
        const update = newUpdateStoreFunction(newStore, components);
        appendListenableFunctions(newStore, components, update);
        appendCommitFunctions(newStore, storeState, commits, update);
        appendAccessorFunctions(newStore, storeState, accessors);
        return newStore;
    };
}
function appendCommitFunctions(newStore, storeState, commits, update) {
    if (!commits) {
        return;
    }
    const commitKeys = Object.keys(commits);
    commitKeys.map(key => {
        newStore[key] = (...args) => {
            const r = commits[key](storeState.getState(), ...args);
            update();
            return r;
        };
    });
}
function appendAccessorFunctions(newStore, storeState, commits) {
    if (!commits) {
        return;
    }
    const commitKeys = Object.keys(commits);
    commitKeys.map(key => {
        newStore[key] = (...args) => {
            return commits[key](storeState.getState(), ...args);
        };
    });
}
function appendListenableFunctions(newStore, components, update) {
    newStore.listen = (component) => {
        for (let i = 0; i < components.length; i++) {
            if (components[i] === component) {
                throw new Error('already listening to component, listen has been called a second time');
            }
        }
        components.push(component);
        component.onListen?.(newStore);
    };
    newStore.forget = (component) => {
        const index = components.indexOf(component);
        if (index === -1) {
            throw new Error('component not found to unlisten');
        }
        components.splice(index, 1);
        component.onForget?.(newStore);
    };
    newStore.update = update;
}
function newUpdateStoreFunction(newStore, components) {
    return () => {
        components.forEach(c => c.onUpdate(newStore));
    };
}
function newStoreCoreFunctions(storeState) {
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
                lastStores: getStores(props, storeNames),
                listener: {
                    onUpdate: () => this.forceUpdate(),
                },
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
                    stateStore?.forget(this.state.listener);
                    propStore?.listen(this.state.listener);
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
                store?.listen(this.state.listener);
            }
        }
        componentWillUnmount() {
            for (const storeName of storeNames) {
                const store = this.props[storeName];
                store?.forget(this.state.listener);
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
    const listener = useComponentListener();
    const [oldStores, setStores] = useState(stores);
    useEffect(() => {
        let hasChange = false;
        for (let i = 0; i < stores.length; i++) {
            const newStore = stores[i];
            const oldStore = oldStores[i];
            if (newStore !== oldStore) {
                oldStore.forget(listener);
                newStore.listen(listener);
                hasChange = true;
            }
        }
        if (hasChange) {
            setStores(stores);
        }
    }, [stores]);
    useEffect(() => {
        stores.forEach(store => {
            store.listen(listener);
        });
        return () => {
            stores.forEach(store => {
                store.forget(listener);
            });
        };
    }, []);
}
function useComponentListener() {
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);
    const [listener] = useState({
        onUpdate: forceUpdate,
    });
    return listener;
}

export { buildStoreFactory, connect, useStore };
//# sourceMappingURL=index.js.map
