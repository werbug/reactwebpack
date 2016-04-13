import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Router, Route, IndexRoute, hashHistory} from 'react-router';

import Main from './Main'; // Our custom react component
import Index from './Index'; // Our custom react component
import Project from './Project'; // Our custom react component
import VersionAdd from './VersionAdd'; // Our custom react component
import VersionEdit from './VersionEdit'; // Our custom react component
import VersionValid from './VersionValid'; // Our custom react component

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

// Render the main app react component into the app div.
// For more details see: https://facebook.github.io/react/docs/top-level-api.html#react.render
/*
    <Route path="users" component={Users}>
        <Route path="/user/:userId" component={User}/>
    </Route>
    <Route path="*" component={NoMatch} />
 */
//        //这个相当于要由 UI 框架，在此（UI）下进行内容的切换
//browserHistory
//hashHistory
//createMemoryHistory
let routes = (
    <Router history={hashHistory}>
        <Route path="/" component={Index}>
            <IndexRoute component={Main} />
            <Route path="main" component={Main} />
            <Route path="project/:pid" component={Project} />
            <Route path="project/:pid/add" component={VersionAdd} />
            <Route path="project/:pid/edit/:id" component={VersionEdit} />
            <Route path="project/:pid/valid/:id" component={VersionValid} />
        </Route>
    </Router>
);

//向页面中渲染
ReactDOM.render(routes, document.getElementById('app'));
