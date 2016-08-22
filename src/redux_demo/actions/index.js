'use strict';

export const ADD_TODO = 'ADD_TODO';
export const REMOVE_TODO = 'REMOVE_TODO';

export function addTodo(cont) {
    return {
        type: ADD_TODO,
        cont
    }
};

export function removeTodo(cont) {
    return {
        type: REMOVE_TODO,
        cont
    }
};

