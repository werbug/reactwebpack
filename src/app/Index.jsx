import React from 'react';
import AppBar from 'material-ui/lib/app-bar';
import IconButton from 'material-ui/lib/icon-button';

import Project from './Project'; // Our custom react component

import './style/style.less';
//import LeftNav from 'material-ui/lib/left-nav';

class Index extends React.Component {
    
    constructor(props) {
        super(props);
    }
    
    componentWillUnmount () {
        
    }
    
    render() {
        return (
            <div>
                <header>
                    <AppBar
                        title="RN增量包发布-后台管理"
                        showMenuIconButton={false}
                        iconElementLeft={null}
                        iconElementRight={null}
                    />
                </header>
                {this.props.children}
            </div>
        );
    }
}

export default Index;
