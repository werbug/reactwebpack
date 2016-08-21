'use strict';
import React from 'react';
import { connect } from 'react-redux';

import { addTodo } from '../actions';

let AddTodo = (store) => {
    let inputDom;

    return (
        <form onSubmit={ e => {
            e.preventDefault();
            if (!inputDom.value.trim()) {
                return;
            }
            store.dispatch(addTodo(inputDom.value));
            inputDom.value = '';
        }}>
            <input type="text" ref={ node => inputDom = node} />
            <button type="submit">Add Tode</button>
        </form>      
    );
};

AddTodo = connect()(AddTodo);

export default AddTodo;

