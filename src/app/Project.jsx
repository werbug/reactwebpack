import React from 'react';

import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';
import Dialog from 'material-ui/lib/dialog';
import CircularProgress from 'material-ui/lib/circular-progress';
import FlatButton from 'material-ui/lib/flat-button';

import RaisedButton from 'material-ui/lib/raised-button';

import Request from 'superagent';

const styles = {
    wraper: {
        margin: '0 10px'
    },
    btnArea: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    botton: {
        margin: 12
    },
    certer: {
        textAlign: 'center'
    },
    tr0: {
        width: 40
    },
    tr1: {
        width: 60
    },
    tr2: {
        width: 60
    },
    tr3: {
        width: 50
    },
    tr4: {
        width: 50,
        textAlign: 'center'
    },
    tr5: {
        width: 300,
        textAlign: 'center'
    }
};

class Project extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            projectId: this.props.params.pid,
            projectInfo: null,
            editVersion: null,
            versionList: [],
            alertOpen: false, 
            doing: false
        };
    }
    
    componentWillUnmount() {
        this.serverRequest && this.serverRequest.abort();
    }
    
    componentWillMount() {
        if (this.props.location.state) {
            this.setState({
                projectInfo: this.props.location.state.projectInfo
            });
        } else {
            this.props.history.replace('/');
        }
    }
    
    componentDidMount() {
        let self = this;
        this.serverRequest = Request
            .get('/admin/pregnancy/reactnative/bundle_version_list')
            .query({app_id: this.state.projectId})
            .set('Accept', 'application/json')
            .end((err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    self.setState({
                        versionList: res.body.data
                    });
                }
            });
    }
    
    //添加新的版本
    addVersion() {
        this.props.history.push("project/" + this.state.projectId + '/add');
    }
    
    //修改配置项
    editVersion(value) {
        this.props.history.push({
            pathname: "project/" + this.state.projectId + '/edit/' + value.id,
            state: {versionInfo: value}
        });
    }
    
    //测试线上包
    validVersion(value) {
        this.props.history.push({
            pathname: 'project/' + this.state.projectId + '/valid/' + value.id,
            state: {
                versionInfo: value
            }
        });
    }
    
    //删除版本包
    delVersion() {
        let self = this;
        this.setState({
            alertOpen: false,
            doing: true
        });
        this.serverRequest = Request
            .get('/admin/pregnancy/reactnative/do_dele_version')
            .query({id: self.state.editVersion.id})
            .set('Accept', 'application/json')
            .end((err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    self.state.versionList.splice(self.state.versionList.indexOf(self.state.editVersion), 1);
                }
                self.setState({
                    versionList: self.state.versionList,
                    doing: false
                });
            });
    }
    
    alertClose() {
        this.setState({
            editVersion: null,
            alertOpen: false
        });
    }
    
    alertOpen(value) {
        this.setState({
            editVersion: value,
            alertOpen: true
        });
    }
    
    //返回
    back() {
        this.props.history.goBack();
    }
    
    render() {
        
        const deleteActions = [
            <FlatButton
                label="确定"
                secondary={true}
                onTouchTap={this.delVersion.bind(this)}
            />,
            <FlatButton
                label="取消"
                onTouchTap={this.alertClose.bind(this)}
            />
        ];
        
        return (
            <section style={styles.wraper}>
                <br/>
                <h1>{this.state.projectInfo.name} 的版本列表</h1>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderColumn style={styles.tr0}>ID</TableHeaderColumn>
                            <TableHeaderColumn style={styles.tr1}>版本号</TableHeaderColumn>
                            <TableHeaderColumn style={styles.tr2}>APP 最低版本</TableHeaderColumn>
                            <TableHeaderColumn style={styles.tr3}>是否线上</TableHeaderColumn>
                            <TableHeaderColumn style={styles.tr4}>是否有效</TableHeaderColumn>
                            <TableHeaderColumn style={styles.tr5}>操作</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody showRowHover={true}>
                        {this.state.versionList.map((value, index) => {
                            return (
                                <TableRow key={value.id}>
                                    <TableRowColumn style={styles.tr0}>{value.id}</TableRowColumn>
                                    <TableRowColumn style={styles.tr1}>{value.bundle_v}</TableRowColumn>
                                    <TableRowColumn style={styles.tr2}>{value.app_min_v}</TableRowColumn>
                                    <TableRowColumn style={styles.tr3}>{value.is_online ? '是' : '否'}</TableRowColumn>
                                    <TableRowColumn style={styles.tr4}>{value.is_effect ? '是' : '否'}</TableRowColumn>
                                    <TableRowColumn style={styles.tr5}>
                                        <FlatButton
                                            label="测试升级包"
                                            primary={true}
                                            onTouchTap={this.validVersion.bind(this, value)}
                                        />
                                        <FlatButton
                                            label="修改配置项"
                                            secondary={true}
                                            onTouchTap={this.editVersion.bind(this, value)}
                                        />
                                        <FlatButton
                                            label="删除"
                                            onTouchTap={this.alertOpen.bind(this, value)}
                                        />
                                    </TableRowColumn>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
                <br/>
                <div style={styles.btnArea}>
                    <RaisedButton label="返回" onTouchTap={this.back.bind(this)} style={styles.botton} />
                    <RaisedButton label="发布新版本" onTouchTap={this.addVersion.bind(this)} secondary={true} style={styles.botton} />
                </div>
                <Dialog
                    open={this.state.alertOpen}
                    title="确认要删除吗?"
                    modal={true}
                    actions={deleteActions}
                >
                </Dialog>
                <Dialog open={this.state.doing} modal={true} style={{width: 202, left: '50%', marginLeft: -101}}>
                    <CircularProgress size={1.5} />
                </Dialog>
            </section>
        );
    }
}

export default Project;