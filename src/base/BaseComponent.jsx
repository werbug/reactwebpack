import React from 'react';

class BaseComponent extends React.Component {
    
    constructor(props, context) {
        super(props, context);
    }
    
    goBack() {
        this.props.history.goBack();
    }
    
}