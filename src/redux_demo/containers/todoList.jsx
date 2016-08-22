'use strict';

import React, {PropTypes} from 'react';
import { connect } from 'react-redux';

import {removeTodo} from '../actions';

let TodoList = ({todos, onTodoClick}) => (
    <ul>
        {
            todos.map((todo) => (
                <li key={todo} onClick={() => onTodoClick(todo)}>
                    {todo}
                </li>
            ))
        }
    </ul>
);

TodoList.PropTypes = {
    todos: PropTypes.array.isRequired
};

const mapStateToProps = (state) => {
    return {
        todos: state
    }
};


const mapDispatchToProps = (dispatch) => {
    return {
        onTodoClick: (id) => {
            dispatch(removeTodo(id));
        }
    }
}

TodoList = connect(
    mapStateToProps,
    mapDispatchToProps
)(TodoList);

export default TodoList;
