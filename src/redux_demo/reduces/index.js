'use strict';
import {
    ADD_TODO, REMOVE_TODO
} from '../actions';

const ActionMap = {
    ADD_TODO: function (state, action) {
        return [...state, action.cont];
    },
    REMOVE_TODO: function (state, action) {
        const i = state.indexOf(action.cont);
        if ( i > -1) {
            return [
                ...state.slice(0, i),
                ...state.slice(i + 1)
            ]
        }
        return state;
    }
}

function todos(state = [], action) {
    if (ActionMap[action.type]) {
        return ActionMap[action.type](state, action);
    }
    return state;
}

export default todos;