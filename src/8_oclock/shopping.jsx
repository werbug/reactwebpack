import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Request from 'superagent';

import TimeListener from './lib/TimeListener';
import './style/shopping.less';

class Shopping extends React.Component {
    
    constructor(props) {
        super(props);
        this.timeListener = new TimeListener(this.props.time_list);
        this.state = {
            isShow: this.timeListener.getState() == 1 ? true : false,
            data_list: []
        };
    }
    
    componentWillMount() {
        if (this.state.isShow) {
            this._getListData();
        }
    }
    
    componentDidMount() {
        this.timeListener.listener({
            toStartFn: () => {
                this._getListData();
            },
            toEndFn: () => {
                this.setState({
                    isShow: false
                });
            }
        })
    }
    
    componentWillUnmount() {
        this.serverRequest && this.serverRequest.abort();
        this.timeListener.stopListener();
        clearInterval(this.carouselIndex);
    }
    
    /*
     * 格式化数据，加上唯一不变的 KEY，以供ReactCSSTransitionGroup动画使用
     */
    _formatListData(data_list) {
        return data_list.map((value, index) => {
            value.key = index;
            return value;
        });
    }
    
    /*
     * ajax 调取远程数据
     */
    _getListData() {
        this.serverRequest = Request
            .get('/lama/night_market_activity/get_shopping')
            .query({act_id: this.props.act_id})
            .set('Accept', 'application/json')
            .end((err, res) => {
                if (err) {
                    console.log(err);
                    return;
                }
                const data = res.body || JSON.parse(res.text);
                if (data.status === 'success') {
                    let data_list = this._formatListData(data.data);
                    this.setState({
                        data_list: data_list,
                        isShow: true
                    });
                    if (this.state.data_list && this.state.data_list.length > 3) {
                        this.carouselIndex = setInterval(this._initCarousel.bind(this), 2000);
                    }
                } else {
                    console.log(data.message);
                }
            })
    }
    
    /*
     * 开始轮播
     * 每两秒种轮播一下
     * 借用react-addons-css-transition-group的添加和删除自动处理动画
     * 第一步，将第一个元素删除掉
     * react-addons-css-transition-group 的动画时长500ms
     * 隔一秒后将删掉的元素加到最后面
     * 
     * 二秒后再次开始第一步
     */
    _initCarousel() {
        let moveItem = this.state.data_list.splice(0, 1);
        this.setState({data_list: this.state.data_list});
        return setTimeout(() => {
            this.state.data_list.push(moveItem[0]);
            this.setState({data_list: this.state.data_list});
        }, 1000)
    }
    
    render() {
        return (
            this.state.isShow ? 
            <section className="list-view" style={{marginTop: 38}}>
                <h2 className="text1">&nbsp;</h2>
                <ul className="list shopping">
                    <ReactCSSTransitionGroup transitionName="example" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
                    {(() => {
                        if (this.state.data_list && this.state.data_list.length > 0) {
                            return this.state.data_list.map((value, index) => {
                                return (
                                    <li key={'shopping_' + value.key}>
                                        <p>{value.user_name}</p>
                                        <p className="no-shrink">正在抢　　　{value.award_name}</p>
                                    </li>
                                );
                            })
                        } else {
                            return (
                                <li style={{textAlign: 'center'}}><p onTouchTap={this._getListData.bind(this)} style={{flex: 1, width: '100%'}} className="hl">还没有人抢到幸运码哦，点击刷新...</p></li>  
                            );
                        }
                    })()}
                    </ReactCSSTransitionGroup>
                </ul>
            </section>
            : 
            null
        );
    }
}

export default Shopping;