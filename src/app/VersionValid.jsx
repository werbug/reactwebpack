import React from 'react';

import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';

import FlatButton from 'material-ui/lib/flat-button';
import RaisedButton from 'material-ui/lib/raised-button';

import Request from 'superagent';

const styles = {
    btnArea: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    botton: {
        margin: 12
    }
};

class VersionValid extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projectId: this.props.params.pid,
            versionInfo: this.props.location.state.versionInfo,
            vId: this.props.params.id,
            packsInfo: null
        }
    }
    
    componentWillUnmount() {
        this.serverRequest.abort();
    }
    
    componentDidMount() {
        let self = this;
        this.serverRequest = Request
            .get('/admin/pregnancy/reactnative/packge_testing_list')
            .query({id: this.state.vId})
            .set('Accept', 'application/json')
            .end((err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    let resData = res.body;
                    if (resData.status === 'success') {
                        self.setState({
                            packsInfo: resData.data.upload_file || {}
                        })
                    }
                }
            });
    }
    
    //测试单个线上包
    validate(url, index) {
        let packsInfo = this.state.packsInfo;
        packsInfo.list[index].status = 1;
        this.setState({
            packsInfo: packsInfo
        });
    }
    
    //测试结果处理
    _validHandle(result, status) {
        for(let platform of ['android', 'ios']) {
            let packs = this.state.packsInfo[platform + '_file'],
                packsResult = result && result[platform];
            packs.map((value, index) => {
                if (status) {
                    value.status = status;
                } else {
                    //packsResult 有可能是null 
                    value.status = ((!packsResult || packsResult[value.title] === '0') ? 'success' : 'faild');
                }
                return value;
            });
        }
        this.setState({
            packsInfo: this.state.packsInfo
        });
    }
    
    //测试全部
    validateAll() {
        let validData = {
            id: this.state.vId,
            content: this.state.versionInfo.content,
            upload_file: this.state.packsInfo
        }
        this._validHandle(null, 'doing');
        this.serverRequest = Request
            .post('/admin/pregnancy/reactnative/do_packge_testing_ajax')
            .send({content: JSON.stringify(validData)})
            .set('Accept', 'application/json')
            .end((err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    let resData = res.body;
                    if (resData.status === 'success') {
                        this._validHandle(resData.data);
                    }
                }
            });
    }
    
    //返回
    back() {
        this.props.history.goBack();
    }
    
    render() {
        
        return (
            <section>
                <br/>
                <h1>{this.state.projectId} - {this.state.vId} 线上包列表</h1>
                {
                    this.state.packsInfo
                    ?
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderColumn>升级包</TableHeaderColumn>
                                    <TableHeaderColumn>平台</TableHeaderColumn>
                                    <TableHeaderColumn>线上URL</TableHeaderColumn>
                                    <TableHeaderColumn>状态</TableHeaderColumn>
                                    <TableHeaderColumn>失败原因</TableHeaderColumn>
                                    <TableHeaderColumn>操作</TableHeaderColumn>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {['android', 'ios'].map((name, index) => {
                                    return this.state.packsInfo[name + '_file']
                                    ? 
                                    this.state.packsInfo[name + '_file'].map((value, index) => {
                                        return (
                                            <TableRow>
                                                <TableRowColumn>{value.title}</TableRowColumn>
                                                <TableRowColumn>{name}</TableRowColumn>
                                                <TableRowColumn>{value.url}</TableRowColumn>
                                                <TableRowColumn>
                                                {(() => {
                                                    switch (value.status) {
                                                        case 'doing': return "检测中";
                                                        case 'faild': return "失败";
                                                        case 'success': return "成功";
                                                        default: return "未测试";
                                                    }    
                                                })()}
                                                </TableRowColumn>
                                                <TableRowColumn>{value.message}</TableRowColumn>
                                                <TableRowColumn>
                                                    <FlatButton 
                                                        label="测试"
                                                        secondary={true}
                                                        onTouchTap={this.validate.bind(this, value)}
                                                    />
                                                </TableRowColumn>
                                            </TableRow>
                                        );
                                    }) : null;
                                })}
                            </TableBody>
                        </Table>
                    :
                        <div>正在加载。。。</div>
                }
                <br/>
                <div style={styles.btnArea}>
                    <RaisedButton label="返回" onTouchTap={this.back.bind(this)} style={styles.botton} />
                    <span>{this.state.message}</span>
                    <RaisedButton label="全部测试" onTouchTap={this.validateAll.bind(this)} primary={true} style={styles.botton} />
                </div>
            </section>
        )
    }
}

export default VersionValid;