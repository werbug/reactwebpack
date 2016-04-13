import React from 'react';
import Divider from 'material-ui/lib/divider';
import Avatar from 'material-ui/lib/avatar';
import FileFolder from 'material-ui/lib/svg-icons/file/folder';
import RaisedButton from 'material-ui/lib/raised-button';
import FlatButton from 'material-ui/lib/flat-button';
import Dialog from 'material-ui/lib/dialog';
import {Link} from 'react-router';
import TextField from 'material-ui/lib/text-field';

import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';
import CircularProgress from 'material-ui/lib/circular-progress';
import Request from 'superagent';

import './style/main.less';

const styles = {
    projectList: {
        margin: '0 2%'
    },
    botton: {
        margin: 12
    },
    btnArea: {
        display: 'flex',
        justifyContent: 'flex-end'
    },
    theader: {
        textAlign: 'center'
    },
    link: {
        textDecoration: 'none',
        fontSize: '18px'
    },
    tr1: {
        width: 50,
        height: 60
    },
    tr2: {
        
    },
    tr3: {
        width: 300,
        textAlign: 'center'
    }
};

/**
 * @author yinjie
 * @date 20160308
 */
class Main extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false,
            alertOpen: false,
            projectList: [],
            projectName: '',
            editObj: null,
            appId: null,
            doing: false,
            idMsg: '不能为空',
            nameMsg: '不能为空'
        };
    }
    
    componentWillUnmount() {
        this.serverRequest && this.serverRequest.abort();
    }
    
    componentDidMount() {
        let self = this;
        this.serverRequest = Request
            .get('/admin/pregnancy/reactnative/app_list')
            .set('Accept', 'application/json')
            .end((err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    let data = res.body;
                    if (data && data.status === 'success') {
                        let projectList = [];
                        for (let key in data.data) {
                            if (data.data.hasOwnProperty(key)) {
                                projectList.push({
                                    id: key,
                                    name: data.data[key]
                                });
                            }
                        }
                        self.setState({
                            projectList: projectList
                        });
                    } else {
                        self.setState({
                            errmessage: data
                        });
                    }
                }
            });
    }
    
    //关闭弹出框
    dialogClose() {
        this.setState({dialogOpen: false, projectName: '', editObj: null, idMsg: '不能为空', nameMsg: '不能为空'});
    }
    
    //打开弹出框s
    dialogOpen() {
        this.setState({dialogOpen: true});
    }

    //
    setAppId(event) {
        let idValue = event.target.value.trim(),
            idMsg = '不能为空';
        if (idValue === '0') {
            idMsg = '不能为 0';
        } else if(idValue){
            idMsg = '内容通过';
        }
        this.setState({appId: idValue, idMsg: idMsg});
    }
    
    //保存当前输入的项目名称
    setName(event) {
        let nameValue = event.target.value.trim(),
            nameMsg = '不能为空';
        if (nameValue) {
            nameMsg = '内容通过';
        }
        this.setState({projectName: nameValue, nameMsg: nameMsg});
    }
    
    //重命名
    renameItem(value) {
        this.setState({
            editObj: value,
            dialogOpen: true,
            projectName: value.name
        });
    }
    
    //添加项目
    addProject() {
        let self  = this,
            reqData;
        //添加 还是 修改
        if (!this.state.editObj) {
            if (!(this.state.appId && this.state.projectName)) {
                return;
            } else {
                reqData = {
                    name: this.state.projectName,
                    app_id: this.state.appId
                };
            }
            if (!reqData.name || !reqData.app_id || reqData.app_id === '0'){
                return;
            }
        } else {
            if (!this.state.projectName) {
                return;
            } else {
                reqData = {
                    name: this.state.projectName,
                    id: this.state.editObj.id
                };
                if (!reqData.name){
                    return;
                }
            }
        }
        //简单校验
        this.setState({
            dialogOpen: false,
            doing: true
        });
        this.serverRequest = Request
            .get('/admin/pregnancy/reactnative/do_edit_app')
            .query(reqData)
            .set('Accept', 'application/json')
            .end((err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    let data = res.body;
                    if (data.status === 'success') {
                        let editObj = this.state.editObj;
                        if (this.state.editObj) {
                            editObj.name = this.state.projectName;
                        } else {
                            this.state.projectList.push({
                                id: data.data,
                                name: this.state.projectName
                            });
                        }
                    }
                }
                self.setState({
                    projectList: this.state.projectList,
                    projectName: '',
                    editObj: null,
                    appId: null,
                    doing: false
                });
            });
    }
    
     //删除元素
    alertOpen(value) {
        this.setState({
            editObj: value,
            alertOpen: true
        });
    }
    
    //删除项目
    delProject() {
        this.setState({
            alertOpen: false,
            doing: true
        });
        this.serverRequest = Request
            .get('/admin/pregnancy/reactnative/do_delete_app')
            .query({id: this.state.editObj.id})
            .set('Accept', 'application/json')
            .end((err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    this.state.projectList.splice(this.state.projectList.indexOf(this.state.editObj), 1);
                }
                this.setState({
                    projectList: this.state.projectList,
                    doing: false
                });
            });
    }
    
    alertClose() {
        this.setState({
            editObj: null,
            alertOpen: false
        });
    }
    
    //去管理页面
    goManager(value) {
        this.props.history.push({
            pathname: 'project/' + value.id,
            state: {
                projectInfo: value
            }
        });
    }
    
    render() {
        const dialogActions = [
            <FlatButton
                label="确定"
                secondary={true}
                onTouchTap={this.addProject.bind(this)}
            />,
            <FlatButton
                label="取消"
                onTouchTap={this.dialogClose.bind(this)}
            />
        ];
        
        const deleteActions = [
            <FlatButton
                label="确定"
                secondary={true}
                onTouchTap={this.delProject.bind(this)}
            />,
            <FlatButton
                label="取消"
                onTouchTap={this.alertClose.bind(this)}
            />
        ];
        
        return (
            <section style={styles.projectList}>
                <br/>
                <h1>react-native 项目列表</h1>
                <Table selectable={false}>
                    <TableHeader displaySelectAll={false} style={styles.theader}>
                        <TableRow>
                            <TableHeaderColumn style={styles.tr1}></TableHeaderColumn>
                            <TableHeaderColumn style={styles.tr2}>项目ID</TableHeaderColumn>
                            <TableHeaderColumn style={styles.tr2}>项目名称</TableHeaderColumn>
                            <TableHeaderColumn style={styles.tr3}>操作</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false} showRowHover={true}>
                        {this.state.projectList.map ((value, index) => {
                            return (
                                <TableRow key={value.id}>
                                    <TableRowColumn style={styles.tr1}><Avatar icon={<FileFolder />} /></TableRowColumn>
                                    <TableRowColumn style={styles.tr2}>{value.id}</TableRowColumn>
                                    <TableRowColumn style={styles.tr2}><Link to={`project/${value.name}`} style={styles.link}>{value.name}</Link></TableRowColumn>
                                    <TableRowColumn style={styles.tr3}>
                                        <FlatButton
                                            label="管理"
                                            primary={true}
                                            onTouchTap={this.goManager.bind(this, value)}
                                            >
                                        </FlatButton>
                                        <FlatButton
                                            label="重命名"
                                            secondary={true}
                                            onTouchTap={this.renameItem.bind(this, value)}
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
                    <RaisedButton label="添加" onTouchTap={this.dialogOpen.bind(this)} secondary={true} style={styles.botton} />
                </div>
                <Dialog
                    open={this.state.dialogOpen}
                    title="请输入项目名称"
                    actions={dialogActions}
                    onRequestClose={this.handleRequestClose}
                >
                    {(() => {
                        if (!this.state.editObj) {
                            return (
                                <TextField
                                    defaultValue={this.state.appId}
                                    hintText="APPID"
                                    errorText={this.state.idMsg}
                                    floatingLabelText="请输入APPID"
                                    onChange={this.setAppId.bind(this)}
                                />
                            )
                        }
                    })()}
                    <br/>
                    <TextField
                        defaultValue={this.state.projectName}
                        hintText="项目名称"
                        errorText={this.state.nameMsg}
                        floatingLabelText="请输入项目名称"
                        onChange={this.setName.bind(this)}
                    />
                </Dialog>
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

export default Main;