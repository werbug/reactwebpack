import React from 'react';
import Request from 'superagent';

import DateUtil from './lib/DateUtil';
import TimeListener from './lib/TimeListener';

class PrizeList extends React.Component {
    
    constructor(props) {
        super(props);
        this.timeListener = new TimeListener(this.props.time_list);
        
        this.state = {
            scrollTop: 0,
            tips: '拉到底部加载更多...',
            listData: [],
            timeState: this.timeListener.getState()
        };
        this.loading = 0;
        this.dateFlag = 0;             //最后的奖品列表日期
    }
    
    componentWillMount() {
        
    }
    
    componentDidMount() {
        //如果需要得到初始列表值，则默认调用一次_getPrizeList
        if (this.props.getDefaultData) {
            this._getPrizeList();
        }
        //
        const scrollDom = document.getElementById('main'),
            listDom = document.getElementById('prize_list');
        scrollDom.addEventListener('scroll', () => {
            this.setState({
                scrollTop: scrollDom.scrollTop
            });
            if (scrollDom.clientHeight + scrollDom.scrollTop > (scrollDom.scrollHeight - 5)) {
                this._getPrizeList();
            }
        }, false);
        //启动活动结束时的监控
        this.timeListener.listener({
            toEndFn: () => {
                //将时间和调用结果状态初始化
                this.dateFlag = 0;
                this.loading = 0;
                //获奖用户列表置空
                this.setState({
                    listData: []
                });
                //再次调用
                this._getPrizeList((data_list) => {
                    scrollDom.scrollTop = listDom.offsetTop - 20;
                });
            }
        });
    }
    
    componentWillUnmount() {
        this.serverRequest && this.serverRequest.abort();
        this.timeListener.stopListener();
    }
    
    //将奖品数据进行条例 UI 的格式化
    _prizeDataFormat(dataList) {
        let resultData = [];
        for (let key in dataList) {
            if (dataList.hasOwnProperty(key)) {
                let timestamp = key,
                    list = dataList[key],
                    prizeObj = {};
                for (let item of list) {
                    if (!prizeObj[item.award_name]) {
                        prizeObj[item.award_name] = {
                            award_pic: item.award_back_pic,
                            list: []
                        }
                    }
                    prizeObj[item.award_name].list.push({
                        avtural: item.avtural,
                        user_name: item.user_name,
                        code_num: item.code_num
                    })
                }
                for (let k in prizeObj) {
                    if (prizeObj.hasOwnProperty(k)) {
                        let prize = prizeObj[k];
                        resultData.push({
                            ts: timestamp,
                            date: DateUtil.format(new Date(timestamp * 1000), '%Y-%m-%d'),
                            award_pic: prize.award_pic,
                            award_name: k,
                            list: prize.list
                        })
                    }
                }
            }
        }
        //排序
        resultData.sort((a, b) => {
            let flag = 0;
            if (parseInt(a.ts, 10) > parseInt(b.ts, 10)) {
                flag = -1;
            } else if (parseInt(a.ts, 10) < parseInt(b.ts, 10)) {
                flag = 1;
            } else [
                flag = 0
            ]
            return flag;
        });
        return resultData;
    }
    
    /*
     * 获取中奖用户的信息
     */
    _getPrizeList(callback) {
        if (this.loading) {
            return;
        }
        this.loading = 1;
        this.setState({
            tips: '正在加载更多...'
        });
        let queryData = {
            act_id: this.props.act_id,
            date_ts: this.dateFlag ? parseInt(this.dateFlag, 10) - 3600 * 24 : ''
        };
        this.serverRequest = Request
            .get('/lama/night_market_activity/get_lucky_user_list')
            .query(queryData)
            .set('Accept', 'application/json')
            .end((err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    let data = res.body || JSON.parse(res.text);
                    if (data.status === 'success') {
                        let _listData = this._prizeDataFormat(data.data);
                        if (_listData.length > 0) {
                            this.dateFlag = _listData[_listData.length -1].ts;
                            Array.prototype.push.apply(this.state.listData, _listData);
                            this.setState({
                                listData: this.state.listData,
                                tips: '下拉加载更多'
                            });
                            this.loading = 0;
                            (typeof callback === 'function') && callback(_listData);
                        } else {
                            this.setState({
                                tips: '没有更多数据了',
                            });
                        }
                    } else {
                        this.setState({
                            tips: '获取数据失败，请重试'
                        });
                        this.loading = 0;
                    }
                }
                
            });
    }
    
    /*
     * 图片加载出错后加载默认图片
     * http://img01.babytreeimg.com/img/common/100x100.gif
     */
    _onImgError(item) {
        item.avtural = 'http://pic05.babytreeimg.com/foto3/common_photo/original/2016/0420/9cf4e14e11779935.png';
        this.setState({
            listData: this.state.listData
        });
    }
    
    /*
     * 渲染方法
     */
    render() {
        return (
            (this.state.listData && this.state.listData.length > 0) ?
            <section id="prize_list" className="list-view" style={{marginTop: 28}}>
                <h2 className="text2">&nbsp;</h2>
                {
                    this.state.listData.map((value, index) => {
                        return (
                            <section key={'prize' + index}>
                                <div className="prize cf">
                                    <div className="pic">
                                        <img src={value.award_pic}/>
                                    </div>
                                    <div className="info">
                                        <p>获奖日期：<span className="font-color1">{value.date}</span></p>
                                        <p>奖品名称：{value.award_name}</p>
                                        <p>获奖用户：</p>
                                    </div>
                                    <ul className="list with-pic">
                                    {
                                        value.list.map((v, i) => {
                                            return (
                                                <li key={value.ts + '_' + i} >
                                                    <p className="name"><img className="avatar" src={v.avtural} onError={this._onImgError.bind(this, v)}/>{v.user_name}</p>
                                                    <p className="no-shrink">获奖码：{v.code_num}</p>
                                                </li>
                                            );
                                        })
                                    }
                                    </ul>
                                </div>
                                {index !== (this.state.listData.length - 1) ? <hr/> : ''}
                            </section>
                        );
                    })
                }
                <div className="more">{this.state.tips}</div>
            </section>
            :
            null
        );
    }
    
}

export default PrizeList;