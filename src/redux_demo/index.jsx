'use strict';

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux';

import reduce from './reduces';
import App from './containers';

let store = createStore(reduce);

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('app')
);