import React from 'react';
import Request from 'superagent';
import Modal from 'react-modal';

import Activite from './activite';
import Shopping from './shopping';
import PrizeList from './prizeList';
import TimeListener from './lib/TimeListener';

import './style/normal.css';
import './style/mask.less';
import './style/layout.less';

const NIGHT_MARKET_LOCALSTORAGE_NAME = 'bbt_night_market_data';

class Index extends React.Component {
    
    constructor(props) {
        super(props);
        /**
         * 测试用数据，不用管
         */
        const now_time = Math.floor(new Date().getTime() / 1000), 
            time_list = window.STATE_DATA.time_list;
            // time_list = {
            //     end_time : now_time + 40,
            //     start_time : now_time + 10,
            //     time_now : now_time
            // };
        
        
        //初始化时间监控
        this.timeListener = new TimeListener(time_list);
        //========
        this.state = {
            activity_info: window.STATE_DATA.activity_info,
            task_info: window.STATE_DATA.task_info,
            time_list: time_list,
            award_info: window.STATE_DATA.award_info,
            code_num: window.STATE_DATA.code_num,
            has_next_task: false,
            next_task_url: '',
            timeState: this.timeListener.getState(),
            countDownTips: '',
            showAlert: false,                //显示弹出框
            alertMsg: null,
        }
        
    }
    
    componentWillMount() {
        document.documentElement.style.fontSize = 20 * (document.body.clientWidth / 375) + 'px';
        if (!window.bui.webSite.isLogin) {
            console.log('window.bui 是未登录状态！');
        }
    }
    
    componentDidMount() {
        // const timeState = this.timeListener.getState();
        // let countDownTips = '';
        // switch (timeState) {
        //     case 1 : {
        //         countDownTips = '活动已经开始';
        //         break;
        //     }
        //     case 2 : {
        //         countDownTips = '活动已经结束，请明天再来';
        //         break;
        //     }
        //     default : break;
        // }
        // this.setState({
        //     countDownTips: countDownTips
        // });
        this.timeListener.listener({
            timingFn: () => {
                if (this.timeListener._remainingTime > -1) {
                    const timeStr = this._formatRemainingTime(this.timeListener._remainingTime);
                    this.setState({
                        countDownTips: '距离活动开始还有　' + timeStr
                    });
                } else {
                    if (this.timeListener.getState() === 1) {
                        this.setState({
                            countDownTips: '活动已经开始'
                        });
                    } else if (this.timeListener.getState() === 2) {
                        const timeStr = this._formatRemainingTime(this.timeListener._remainingTime + 24 * 3600 * 1000);
                        this.setState({
                            countDownTips: '距离活动开始还有　' + timeStr
                        });
                    }
                }
            },
            toStartFn: () => {
                this.setState({
                    timeState: 1
                });
            },
            toEndFn: () => {
                this.setState({
                    timeState: 2
                });
            },
            toFreshFn: () => {
                this.setState({
                    timeState: 0
                });
                window.location.reload();
            }
         });
        
        setTimeout(() => {
            let next_task_url = '/lama/night_market_activity/user_task?'
                + 'login_string=' + (window.USER_INFO ? window.USER_INFO.loginString : '')
                + '&act_id=' + this.state.task_info.next_act_id
                + '&task_id=' + this.state.task_info.next_task_id;
            let hasNextTask = (this.state.task_info.is_show && this.state.task_info.next_act_id && this.state.task_info.next_task_id);
            this.setState({
                next_task_url: next_task_url,
                has_next_task: hasNextTask
            });
        }, 300);
    }
    
    /*
     * 
     */
    componentWillUnmount() {
        this.serverRequest && this.serverRequest.abort();
        this.timeListener.stopListener();
    }
    
    /**
     * 将剩余的时间戮改成时分秒
     */
    _formatRemainingTime(remainTime) {
        //确定是24小时内的时间
        remainTime = remainTime % (3600 * 24 * 1000);
        let hours = Math.floor(remainTime / (3600 * 1000)),
            minutes = Math.floor((remainTime % (3600 * 1000) / (60 * 1000))),
            second = Math.floor((remainTime % (60 * 1000) / (1000)));
        const arr = [hours, minutes, second].map((value) => {
            return ((value + 100) + '').substr(1);
        });
        return arr[0] + ':' + arr[1] + ':' + arr[2];
    }
    
    
    /**
     * 去下一场活动的任务页
     */
    _gotoNextTask() {
        this.serverRequest = Request
            .get('/lama/night_market_activity/task_performance')
            .query({task_id: this.state.task_info.next_task_id, login_string: window.USER_INFO ? window.USER_INFO.loginString : ''})
            .set('Accept', 'application/json')
            .end((err, res) => {
                if (err) {
                    this.setState({
                        showAlert: true,
                        alertMsg: '网络错误，请重试'
                    });
                    console.log(err);
                } else {
                    let data = res.body || JSON.parse(res.text);
                    if (data.status === 'success') {
                        window.location.href = this.state.next_task_url;
                    } else {
                        this.setState({
                            showAlert: true,
                            alertMsg: '更新任务状态失败<br/>请重试'
                        });
                    }
                }
            });
    }
    
    /**
     * 关闭并初始化 ALERT
     */
    _closeAlert() {
        this.setState({
            showAlert: false,
            alertMsg: null
        });
    }
    
    render() {
        let mainBgStyle = {
            backgroundImage: "url(" + this.state.activity_info.back_pic_end + ")"
        };
        
        
        const actBgStyle = {
            backgroundImage: "url(" + this.state.activity_info.back_pic_start + ")"
        };
        
        return (
            <div>
                <div id="main" className="body">
                    <div className="wrapper" style={mainBgStyle}>
                        {/* 活动开始的前景 */}
                        {
                            this.state.timeState === 1 ? 
                            <div className="act-bg" style={actBgStyle}>
                                <span className="bling-1"><b className="shine"></b></span>
                                <span className="bling-2"><b className="shine"></b></span>
                                <span className="bling-3"><b className="shine"></b></span>
                            </div>
                            : 
                            ''
                        }
                        {/* 活动主题区域 */}
                        <Activite 
                            activity_info={this.state.activity_info}
                            task_info={this.state.task_info}
                            award_info={this.state.award_info}
                            code_num={this.state.code_num}
                            time_list={this.state.time_list}
                            _history={this.props.history}
                            />
                        {/* 一起逛街的辣妈 */}
                        <Shopping
                            act_id={this.state.activity_info.act_id}
                            time_list={this.state.time_list}
                            />
                        {/* 奖品用户列表 */}
                        <PrizeList
                            act_id={this.state.activity_info.act_id}
                            getDefaultData={true}
                            time_list={this.state.time_list}
                           />
                        {/* 底部 */}
                        <footer className="footer">
                            <p><b className="icon-c"></b>2016 宝宝树 m.babytree.com</p>
                        </footer>
                    </div>
                </div>
                {
                    this.state.timeState !== 1 ? <p className="remain-time">{this.state.countDownTips}</p> : null
                }
                {
                    (this.state.has_next_task && this.state.timeState !== 1) ? 
                    <p className="next-act"><span className="text">下一期夜市门票预售中...</span><button type="button" onClick={this._gotoNextTask.bind(this)}>抢先领取 >></button></p>
                    : 
                    null
                }
                {this.props.children}
                <Modal
                    isOpen={this.state.showAlert}
                    shouldCloseOnOverlayClick={false}
                    className="dialog"
                    overlayClassName="body mask"
                    >
                        <section className="alert">
                            <div className="msg" dangerouslySetInnerHTML={{__html: this.state.alertMsg}}></div>
                            <p className="btn-area" onTouchTap={this._closeAlert.bind(this)}>好</p>
                        </section>
                </Modal>
            </div>
            
        );
    }

}

export default Index;