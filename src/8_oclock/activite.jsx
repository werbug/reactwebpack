import React from 'react';
import ClassNames from 'classnames';
import Request from 'superagent';
import Modal from 'react-modal';

import DateUtil from './lib/DateUtil';
import TimeListener from './lib/TimeListener';
import LocalStorageCommon from './lib/LocalStorageCommon';

const dateFromatStr = '%m月%d日',
      timeFormatStr = '%H-%M-%S';

class Activite extends React.Component {
    
    constructor(props) {
        super(props);
        //初始化时间监控
        this.timeListener = new TimeListener(this.props.time_list);
        //奖品数据的重新组装
        let award_data = this._awardDataFormat(this.props.award_info, this.props.code_num);
        this.state = {
            activity_info: this.props.activity_info,
            task_info: this.props.task_info,
            time_list: this.props.time_list,
            award_data: award_data,
            date_value: {
                start_date: DateUtil.format(new Date(this.props.activity_info.start_date * 1000), dateFromatStr),
                end_date: DateUtil.format(new Date(this.props.activity_info.end_date * 1000), dateFromatStr)
            },
            showRules: false,               //显示活动规则
            showGetTicket: false,           //显示获取门票
            showAlert: false,                //显示弹出框
            alertMsg: null,
            timeState: this.timeListener.getState()                //0-这一天开始活动前 1-活动进行时间 2-活动结束后到这一天结束前
        };
    }
    
    componentWillMount() {
        //格式化活动规则
        if (typeof this.state.activity_info.act_rule === 'string') {
            this.state.activity_info.act_rule = this._rulesDataFormat(this.state.activity_info.act_rule);
            this.setState({
                activity_info: this.state.activity_info
            });
        }
        setTimeout(() => {
            //
            try {
                const userId = window.USER_INFO.encUserId,
                    taskId = this.state.task_info.task_id;
                //第一次领取门票
                if (this.state.task_info.user_task_status && !LocalStorageCommon.hasGetTicket(userId, taskId)) {
                    this.setState({
                        showGetTicket: true
                    });
                }
            } catch (err) {
                console.log(err);
            }
        }, 300);
    }
    
    componentDidMount() {
        //启动监控
        this._timeControl();
        this.timeListener.listener({
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
            }
        });
    }
    
    componentWillUnmount() {
        this.serverRequest && this.serverRequest.abort();
        clearInterval(this.taskIndex);
        this.timeListener.stopListener();
    }
    
    /*
     * 格式化活动规则
     * 按<br>分段
     */
    _rulesDataFormat(content) {
        let rules = [];
        if (content && typeof content === 'string') {
            rules = content.split('<br>');
        }
        return rules;
    }
    
    /*
     * 奖品数据的重新组装
     */
    _awardDataFormat(award_info, code_num) {
        let codeObj = {};
        if (code_num) {
            for(let item of code_num) {
                if (item.award_id) {
                    codeObj[item.award_id + ''] = {
                        num_type: item['num_type'],
                        user_num: item['user_num']
                    }
                }
            }
        }
        if (award_info) {
            for (let award of award_info) {
                if (award.award_id && codeObj[award.award_id]) {
                    let code = codeObj[award.award_id];
                    award['num_type'] = code.num_type;
                    award['user_num'] = code.user_num;
                }
            }
            return award_info;
        } else {
            return [];
        }
    }
    
    /**
     * 获取任务状态的方法
     */
    _getTaskState() {
        
    }
    
    /*
     * 定时监控方法
     */
    _timeControl() {
        /*
         * 当状态没有完成时
         * 每5分钟刷一次任务是否完成的接口
         */
        if (this.state.task_info.user_task_status) {
            return;
        }
        const getTaskResault = function(){
            this.serverRequest = Request
                .get('/lama/night_market_activity/task_performance')
                .query({task_id: this.state.task_info.task_id, login_string: window.USER_INFO ? window.USER_INFO.loginString : ''})
                .set('Accept', 'application/json')
                .end((err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        let data = res.body || JSON.parse(res.text);
                        if (data.status === 'success') {
                            //如果任务完成
                            if (data.data.status) {
                                clearInterval(this.taskIndex);
                                this.state.task_info.user_task_status = 1;
                                this.setState({
                                    task_info: this.state.task_info
                                });
                                try {
                                    this.setState({
                                        showGetTicket: true
                                    });
                                } catch (err) {
                                    console.log(err);
                                }
                            }
                        }
                    }
                });
        }
        setTimeout(getTaskResault.bind(this), 1000);
        //3分钟刷一次任务状态
        // this.taskIndex = setInterval(getTaskResault.bind(this), 3 * 60 * 1000);
    }

    /*
     * 获取幸运码
     */
    _getAwardCode(award, num_type) {
        
        const award_id = award.award_id,
            user_num = award.user_num;
            //this.state.timeState !== 1
        if (user_num) {
            this.setState({
                alertMsg: '只能领取一次幸运码哦！',
                showAlert: true
            });
            return;
        } else if (this.state.timeState !== 1) {
            this.setState({
                alertMsg: '夜市没开市<br/>记得20:00来领取哦！',
                showAlert: true
            });
            return;
        }
        const queryData = {
            login_string: window.USER_INFO.loginString,
            act_id: this.state.activity_info.act_id, 
            award_id: award_id,
            num_type: num_type
        };
        this.serverRequest = Request
            .get('/lama/night_market_activity/get_num')
            .query(queryData)
            .set('Accept', 'application/json')
            .end((err, res) => {
                if (err) {
                    console.log(err);
                    this.setState({
                        alertMsg: '网络错误，请重试',
                        showAlert: true
                    });
                } else {
                    const data = res.body || JSON.parse(res.text);
                    if (data.status === 'success') {
                        if (data.data.is_use) {
                            this.setState({
                                alertMsg: '已经领取过号码',
                                showAlert: true
                            });
                            return;
                        }
                        if (data.data.status !== 1) {
                            this.setState({
                                alertMsg: '请求错误',
                                showAlert: true
                            });
                            return;
                        }
                        award.user_num = data.data.user_num;
                        this.setState({
                            award_data: this.state.award_data
                        })
                    }
                }
            });
    }
    
    /**
     * 奖品样左右滑动的手工处理
     * 
     */
    _domsetTouchStart() {
    }
    
    _domsetTouchMove(event) {
    }
    
    /**
     * 查看活动规则
     */
    _openDialog() {
        this.setState({
            showRules: true
        });
    }
    
    //关闭弹出框
    _closeDialog() {
        this.setState({
            showRules: false
        });
    }
    
    /**
     * 去下一场活动的任务页
     */
    _gotoTaskPage() {
        this.serverRequest = Request
            .get('/lama/night_market_activity/task_performance')
            .query({task_id: this.state.task_info.task_id, login_string: window.USER_INFO ? window.USER_INFO.loginString : ''})
            .set('Accept', 'application/json')
            .end((err, res) => {
                if (err) {
                    this.setState({
                        alertMsg: '网络错误，请重试',
                        showAlert: true
                    });
                    console.log(err);
                } else {
                    let data = res.body || JSON.parse(res.text);
                    if (data.status === 'success') {
                        /*
                        * 拼接本次任务面的链接
                        * act_id=19&task_id=6
                        */
                        const query  = window.location.search;
                        let task_url = '/lama/night_market_activity/user_task'
                            + query
                            + '&act_id=' + this.props.activity_info.act_id
                            + '&task_id=' + this.props.task_info.task_id;
                        window.location.href = task_url;
                    } else {
                        this.setState({
                            alertMsg: '更新任务状态失败<br/>请重试',
                            showAlert: true
                        });
                    }
                }
            });
    }
    
    /**
     * 跳转到奖品详情页
     */
    _awardDetail(award) {
        this.props._history.push({
            pathname: "/awardDetail",
            state: {img_url: award.award_big_pic, name: award.award_name}
        })
    }
    
    /**
     * 获取门票，实际上后台已经有门票了，这个地方只是象征性的点击一下
     * 再把用户领过的任务存一下
     */
    _getTicket() {
        this.setState({
            showGetTicket: false
        });
        LocalStorageCommon.saveGetTicket(window.USER_INFO.encUserId, this.state.task_info.task_id);
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
        let ticketClass = ClassNames({
            ticket: true, 
            has: this.state.task_info.user_task_status
        });
        
        let domsetClass = ClassNames({
            domset: true, 
            center: this.state.award_data && this.state.award_data.length === 1
        });
        
        return (
            <div className="activite">
                {/* 活动正式内容 */}
                <section className="activite-main">
                    <div className="title">
                        <p className="l1">{this.state.activity_info.desc_one}&nbsp;<span className="hl" onTouchTap={this._openDialog.bind(this)}>详细规则 >>></span></p>
                        <p className="l2">{this.state.activity_info.desc_two}</p>
                    </div>
                    <div className={ticketClass}>
                        <h2 className="title1">&nbsp;</h2>
                        <h3 className="title2">&nbsp;</h3>
                        <p className="desc">领取本期门票<span className={this.state.task_info.user_task_status ? '' : 'hl'} onTouchTap={this._openDialog.bind(this)}>需要完成的任务:</span></p>
                        <p className="button" onTouchTap={this._gotoTaskPage.bind(this)}><span>{this.state.task_info.task_button || '完成任务'}</span></p>
                    </div>
                </section>
                {/* 奖品栏 */}
                <section className="gift">
                    <div className={domsetClass} style={{zIndex: !this.state.task_info.user_task_status ? -1 : 1}}>
                    {
                        this.state.award_data.map((value, index) => {
                            let numClass = ClassNames({
                                num: true,
                                avail: (this.state.timeState === 1 && !value.user_num)
                            });
                            return (
                                <dl className="item" key={value.award_id}>
                                    <dt className="pic" onTouchTap={this._awardDetail.bind(this, value)}>
                                        <div className="image">
                                            <img src={value.award_back_pic}/>
                                        </div>
                                        <p className="name">{value.award_name}</p>
                                        <b className={numClass}>{'' + 0 + (index + 1)}</b>
                                        <b className="count">{value.award_num}</b>
                                    </dt>
                                    <dd className="btn">
                                        <button type="button"
                                            className={(this.state.timeState === 1 && !value.user_num) ? 'btn2' : 'btn1'}
                                            onClick={this._getAwardCode.bind(this, value, (index + 1))}
                                            >领取幸运码</button>
                                    </dd>
                                    <dd className="code">幸运码：{value.user_num || '还没领取哦'}</dd>
                                </dl>
                            )
                        })
                    }
                    </div>
                    {
                        !this.state.task_info.user_task_status
                        ?
                        <div className="no-ticket">
                            <p>没门票<br/>可不能进夜市哦</p>
                        </div>
                        : 
                        ''
                    }
                </section>
                {/* 任务规则 */}
                <Modal
                    isOpen={this.state.showRules}
                    shouldCloseOnOverlayClick={true}
                    className="dialog"
                    overlayClassName="body mask"
                    >
                    
                        <b className="btn-close" onTouchTap={this._closeDialog.bind(this)}></b>
                        <section className="tip">
                            <h2>活动规则</h2>
                            {
                                this.state.activity_info.act_rule.map((value, index) => {
                                    return <p key={index}>{value}</p>
                                })
                            }
                        </section>
                </Modal>
                {/* 获取门票 */}
                
                
                <Modal
                    isOpen={this.state.showGetTicket}
                    shouldCloseOnOverlayClick={false}
                    className="dialog"
                    overlayClassName="body mask"
                    >
                        <section className="cont">
                            <div className="ticket"></div>
                        </section>
                        <section className="btn-area">
                            <button type="button" onClick={this._getTicket.bind(this)}>马上领取</button>
                        </section>
                </Modal>
                <Modal
                    isOpen={this.state.showAlert}
                    shouldCloseOnOverlayClick={false}
                    className="dialog"
                    overlayClassName="body mask"
                    >
                        <section className="alert">
                            <div className="msg" dangerouslySetInnerHTML={{__html: this.state.alertMsg}}></div>
                            <p className="btn-area" onClick={this._closeAlert.bind(this)}>好</p>
                        </section>
                </Modal>
            </div>
        );
    }
    
}

export default Activite;