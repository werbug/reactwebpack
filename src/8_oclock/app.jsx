import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Router, Route, IndexRoute, hashHistory, createMemoryHistory} from 'react-router';

import Index from './index';
// import GetTicket from './getTicket';
import AwardDetail from './awardDetail';

// import Task from './task';
//附带两个页面的样式
import './style/task_page.less';
import './style/success_page.less';

injectTapEventPlugin();

//这个相当于要由 UI 框架，在此（UI）下进行内容的切换
//browserHistory
//hashHistory
//createMemoryHistory
/**
 * 内存history
 */
// const history = createMemoryHistory(location)

let routes = (
    <Router history={hashHistory}>
        <Route path="/" component={Index}></Route>
        <Route path="/awardDetail" component={AwardDetail}></Route>
    </Router>
);


//
//向页面中渲染
ReactDOM.render(routes, document.getElementById('appbody'));