import React from 'react';
import Request from 'superagent';
import Toggle from 'material-ui/lib/toggle';

import RaisedButton from 'material-ui/lib/raised-button';

const styles = {
    toggle: {
        marginBottom: 16
    },
    botton: {
        margin: 12
    }
}

class VersionEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projectId: this.props.params.pid,
            vId: this.props.params.id,
            versionInfo: null,
            is_online: null,
            is_effect: null
        };
    }
    
    componentWillUnmount() {
        this.serverRequest && this.serverRequest.abort();
    }
    
    componentWillMount() {
        if (this.props.location.state) {
            this.setState({
                versionInfo: this.props.location.state.versionInfo.content,
                is_online: !!this.props.location.state.versionInfo.is_online,
                is_effect: !!this.props.location.state.versionInfo.is_effect
            });
        } else {
            this.props.history.push('project/' + this.state.projectId);
        }
    }
    
    componentDidMount() {
    }
    
    toggleOnline(event, isChecked) {
        this.setState({
            is_online: isChecked
        });
    }
    
    toggleValid(value, isChecked) {
        this.setState({
            is_effect: isChecked
        });
    }
    
    editVersion() {
        let self = this;
        this.serverRequest = Request
            .get('/admin/pregnancy/reactnative/do_edit_version')
            .query({
                is_online: this.state.is_online ? 1 : 0,
                is_effect: this.state.is_effect ? 1 : 0,
                id: this.state.vId
            })
            .set('Accept', 'application/json')
            .end((err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    self.back();
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
                {
                    this.state.versionInfo ? 
                        <div style={{marginLeft: 20, overflow: 'auto', fontSize: 16, lineHeight: 1.75}}>
                            <h2>{this.state.projectId} - {this.state.vId}  版本包信息</h2>
                            <div>版本号：{this.state.versionInfo['v']}</div>    
                            <div>APP 最小版本：{this.state.versionInfo['min-v']}</div>    
                            <div>时间：{this.state.versionInfo['date']}</div>    
                            <div>描述：{this.state.versionInfo['des'].join('，')}</div>    
                            <div>iosBundleMd5：{this.state.versionInfo['iosBundleMd5']}</div>    
                            <div>androidBundleMd5：{this.state.versionInfo['androidBundleMd5']}</div>    
                            <div>ios 升级包 Md5：
                                {(() => {
                                    let iosZipMd5 = this.state.versionInfo['iosZipMd5'],
                                        _html = [];
                                    if (iosZipMd5 instanceof Array) {
                                        for (let value of iosZipMd5) {
                                            _html.push(<p style={{marginLeft: 20}} key={value.ver}>{value.ver} : {value.md5}</p>);
                                        }
                                    } else {
                                        for (let key in iosZipMd5) {
                                            if (iosZipMd5.hasOwnProperty(key)) {
                                                _html.push(<p style={{marginLeft: 20}} key={key}>{key} : {iosZipMd5[key]}</p>);
                                            }
                                        }
                                    }
                                    return _html;
                                })()}
                            </div>
                            <div>android 升级包 Md5：
                                {(() => {
                                    let androidZipMd5 = this.state.versionInfo['androidZipMd5'],
                                        _html = [];
                                    //兼容老的数据类型
                                    if (androidZipMd5 instanceof Array) {
                                        for (let value of androidZipMd5) {
                                            _html.push(<p style={{marginLeft: 20}} key={value.ver}>{value.ver} : {value.md5}</p>);
                                        }
                                    } else {
                                        for (let key in androidZipMd5) {
                                            if (androidZipMd5.hasOwnProperty(key)) {
                                                _html.push(<p style={{marginLeft: 20}} key={key}>{key} : {androidZipMd5[key]}</p>);
                                            }
                                        }
                                    }
                                    return _html;
                                })()}
                            </div>
                            <h2>修改配置信息</h2>
                            <div style={{maxWidth: 300}}>
                                <Toggle
                                    label="是否上线"
                                    style={styles.toggle}
                                    toggled={this.state.is_online}
                                    onToggle={this.toggleOnline.bind(this)}
                                />
                                <Toggle
                                    label="是否有效"
                                    style={styles.toggle}
                                    toggled={this.state.is_effect}
                                    onToggle={this.toggleValid.bind(this)}
                                />
                            </div>
                        </div>
                        :
                        <p>正在加载信息</p>
                }
                <br/>
                <div style={styles.btnArea}>
                    <RaisedButton label="返回" onTouchTap={this.back.bind(this)} style={styles.botton} />
                    <RaisedButton label="保存" onTouchTap={this.editVersion.bind(this)} secondary={true} style={styles.botton} />
                </div>
            </section>
        )
    }
}

export default VersionEdit;