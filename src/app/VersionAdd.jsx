'use strict';
import React from 'react';

import Dropzone from 'react-dropzone';
import RaisedButton from 'material-ui/lib/raised-button';
import Toggle from 'material-ui/lib/toggle';
import Request from 'superagent';

const styles = {
    textarea: {
        maxWidth: 1024,
        width: '80%'
    },
    dropzone: {
        float: 'left'
    },
    dzTip: {
        fontSize: '18px',
        margin: '50px 20px 0',
        lineHeight: 2,
        textAlign: 'center'
    },
    fileInfo: {
        marginLeft: 220,
        fontSize: 14,
        lineHeight: 2
    },
    uploadBtn: {
        marginTop: 20
    },
    fieldset: {
        marginBottom: 40,
        paddingBottom: 20,
        fontSize: 14,
        lineHeight: 2
    },
    toggle: {
        marginBottom: 16
    },
    uploadTip: {
        marginLeft: 20
    }
};

class VersionAdd extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            projectId: this.props.params.pid,
            iosFile: null,
            androidFile: null,
            updateJson: null,
            isValid: false,
            isOnline: false,
            file_content: null              //上传成功文件的信息
        }
    }
    
    componentWillUnmount() {
        this.serverRequest && this.serverRequest.abort();
    }
    
    //即时updatejson信息
    updateJson(event) {
        let json = event.target.value.replace(/\n/g, "");
        json = json.replace(/\s/g, "");
        try {
            json = JSON.parse(json);
            ['iosZipMd5', 'androidZipMd5'].map((prop) => {
                let tempArr = [];
                for(let key in json[prop]) {
                    if (json[prop].hasOwnProperty(key)) {
                        tempArr.push({
                            ver: key,
                            md5: json[prop][key]
                        })
                    }
                }
                json[prop] = tempArr;
            });
        } catch (err) {
            json = null
        }
        this.setState({
            updateJson: json
        })
    }
    
    //文件大小计递归计算
    format_size(size) {
        let mArr = ['B', 'KB', 'MB', 'GB', 'TB'],
            i;
        size = parseInt(size, 10);
        for (i = 0; size > 1000 && i < mArr.length; i = i + 1) {
            size = size / 1000;
        }
        return (i ? size.toFixed(2) : size) + mArr[i];
    }
    
    //时间转换
    dateFormat(date, fstr, utc) {
        utc = utc ? 'getUTC' : 'get';
        return fstr.replace(/%[YmdHMS]/g, function (m) {
            switch (m) {
                case '%Y':
                    return date[utc + 'FullYear'](); // no leading zeros required
                case '%m':
                    m = 1 + date[utc + 'Month']();
                    break;
                case '%d':
                    m = date[utc + 'Date']();
                    break;
                case '%H':
                    m = date[utc + 'Hours']();
                    break;
                case '%M':
                    m = date[utc + 'Minutes']();
                    break;
                case '%S':
                    m = date[utc + 'Seconds']();
                    break;
                default:
                    return m.slice(1); // unknown code, remove %
            }
            // add leading zero if required
            return ('0' + m).slice(-2);
        });
    }
    
    /*
     * 选择 IOS 文件
     */
    dzDropForIos(files) {
        let iosFile = (files && files.length > 0) ? files : [];
        for(let i = 0; i < iosFile.length; i++) {
            iosFile[i].fixedSize = this.format_size(iosFile[i].size);
            iosFile[i].lastModifiedDateStr = this.dateFormat(iosFile[i].lastModifiedDate, '%Y-%m-%d %H:%M:%S');
        }
        this.setState({
            iosFile: iosFile
        });
    }
    
    /*
     * 选择 ANDROID 文件
     */
    dzDropForAndroid(files) {
        
        let androidFile = (files && files.length > 0) ? files : [];
        for(let i = 0; i < androidFile.length; i++) {
            androidFile[i].fixedSize = this.format_size(androidFile[i].size);
            androidFile[i].lastModifiedDateStr = this.dateFormat(androidFile[i].lastModifiedDate, '%Y-%m-%d %H:%M:%S');
        }
        this.setState({
            androidFile: androidFile
        });
    }
    
    //上传提示信息控制
    _uploadMsg(type, msg) {
        if (type === 'ios') {
            this.setState({
                iosMsg: msg
            });
        } else {
            this.setState({
                androidMsg: msg
            });
        }
    }
    
    //选择上件的校验
    _checkUploadFile(type) {
        let flag = true;
        const uploadFile = this.state.updateJson[type + 'ZipMd5'],
            chooseFile = this.state[type + 'File'];
        for (const verFile of uploadFile) {
            let ver = verFile.ver,
                hasFlag = false;
            for (const zipFile of chooseFile) {
                if (ver === zipFile.name) {
                    hasFlag = true;
                    break;
                }
            }
            if (!hasFlag) {
                flag = false
                break;
            }
        }
        return flag;
    }
    
    //上传文件
    upload(type) {
        let self = this;
        //进行上传文件的校验
        if (!this._checkUploadFile(type)) {
            this._uploadMsg(type, '缺少所需的文件，请重新选取！');
            return;
        }
        //formData + XMLHttpRequest 异步文件上传
        //组装数据
        let fd = new FormData();
        for (let file of this.state[type + 'File']) {
            fd.append(type + '_file[]', file);
        }
        fd.append('content', JSON.stringify(this.state.updateJson));
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '//' + window.upload_server + '/useradmin/upload_file.php');
        xhr.addEventListener('load', (e) => {
            let data = JSON.parse(e.target.responseText);
            if (data && data.status === 'success') {
                self._uploadMsg(type, '上传成功');
                //将上传结果列表写进 file_content
                for(let key in data.upload_list) {
                    if (data.upload_list.hasOwnProperty(key)) {
                        if (!self.state.file_content) {
                            self.state.file_content = {};
                        }
                        self.state.file_content[key] = data.upload_list[key];
                    }
                }
                self.setState({
                    file_content: self.state.file_content
                });
            } else {
                self._uploadMsg(type, '上传失败 ' + (data && data.status));
            }
        }, false);
        xhr.upload.addEventListener('progress', (e) => {
            self._uploadMsg(type, Math.round(e.loaded * 100 / e.total) + '%');
        }, false);
        xhr.addEventListener('error', () => {
            self._uploadMsg(type, '上传失败：网络问题');
        }, false);
        xhr.send(fd);
        
    }
    
    //提交信息
    submitInfo() {
        let postData,
            self = this;
        try {
            postData = {
                app_id: this.state.projectId,
                content: JSON.stringify(this.state.updateJson),
                is_online: this.state.isOnline ? 1 : 0,
                is_effect: this.state.isValid ? 1 : 0, 
                file_content: JSON.stringify(this.state.file_content)
            }
        } catch (err) {
            postData = null;
            this.setState({
                message: '新建版本所需的信息不全或非法，请重新检查'
            }); 
        }
        //上传文件信息 file_content 是否齐全
        if (!this.state.file_content || !this.state.file_content.ios_file || !this.state.file_content.android_file) {
            this.setState({
                message: '上传的升级包不足，请检查重新上传!'
            });
            return;
        }
        //提交信息
        if (postData) {
            this.serverRequest = Request
                .post('/admin/pregnancy/reactnative/do_edit_version')
                .send(postData)
                .type('form')           //将参数转化成urlencoded
                //set('Content-Tyep', 'application/x-www-form-urlencoded')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    if (err) {
                        console.log(err);
                        self.setState({
                            message: '网络请求错误'
                        });
                    } else {
                        let resData = res.body;
                        if (resData.status === 'success') {
                            self.setState({
                                message: '添加成功'
                            });
                            self.goback();
                        } else {
                            self.setState({
                                message: '添加失败' + resData.message
                            });
                        }
                    }
                });
        }
    }
    
    toggleOnline(event, isChecked) {
        this.setState({
            isOnline: isChecked
        });
    }
    
    toggleValid(value, isChecked) {
        this.setState({
            isValid: isChecked
        })
    }
    
    goback() {
        this.props.history.goBack();
    }
    
    render() {
        return (
            <section>
                <h2>请在以下编辑框中填入 update.json (由react-native 打包自动生成)</h2>
                <div>
                    <textarea style={styles.textarea} rows='20' onChange={this.updateJson.bind(this)}></textarea>
                </div>
                {
                    this.state.updateJson ?
                        <div>
                            <h2>请上传 IOS 升级包</h2>
                            <div style={{overflow: 'hidden'}}>
                                <div style={styles.dropzone}>
                                    <Dropzone onDrop={this.dzDropForIos.bind(this)} multiple={true}>
                                        <div style={styles.dzTip}>点击或将要上传的文件拖拽到此</div>
                                    </Dropzone>
                                </div>
                                <div style={styles.fileInfo}>
                                    <p style={{fontWeight: 'bold'}}>请选择 iosZipMd5 对应所需的 zip 文件</p>
                                    {this.state.iosFile ? 
                                        <div>
                                        {this.state.iosFile.map((value, index) => {
                                            return (
                                                <p>文件名: {value.name} ({value.lastModifiedDateStr}) [{value.fixedSize}]</p>    
                                            );     
                                        })}
                                            <div style={styles.uploadBtn}><RaisedButton label="上传" primary={true} onTouchTap={this.upload.bind(this, 'ios')}/><span style={styles.uploadTip}>{this.state.iosMsg}</span></div>
                                        </div>
                                        : null
                                    }
                                </div>
                            </div>
                            <h2>请上传 Android 升级包</h2>
                            <div style={{overflow: 'hidden'}}>
                                <form id="androidFrom" action="" encType="multipart/form-data" method="post" style={styles.dropzone}>
                                    <Dropzone onDrop={this.dzDropForAndroid.bind(this)} multiple={true}>
                                        <div style={styles.dzTip}>点击或将要上传的文件拖拽到此</div>
                                    </Dropzone>
                                </form>
                                <div style={styles.fileInfo}>
                                    <p style={{fontWeight: 'bold'}}>请选择 androidZipMd5 对应所需的 zip 文件</p>
                                    {this.state.androidFile ? 
                                        <div>
                                        {this.state.androidFile.map((value, index) => {
                                            return (
                                                <p>文件名: {value.name} ({value.lastModifiedDateStr}) [{value.fixedSize}]</p>    
                                            );     
                                        })}
                                            <div style={styles.uploadBtn}><RaisedButton label="上传" primary={true} onTouchTap={this.upload.bind(this, 'android')}/><span style={styles.uploadTip}>{this.state.androidMsg}</span></div>
                                        </div>
                                        : null
                                    }
                                </div>
                            </div>
                        </div>
                        :
                        <div style={{color: 'red'}}>填入 JSON 内容不合法</div>
                }
                <br/>
                {this.state.updateJson ?
                    <fieldset style={styles.fieldset}>
                        <legend><h2>升级包详细信息</h2></legend>
                        <div style={{marginLeft: 20, overflow: 'auto'}}>
                            <h3>基本信息</h3>
                            <div>版本号：{this.state.updateJson.v}</div>    
                            <div>APP 最小版本：{this.state.updateJson['min-v']}</div>    
                            <div>时间：{this.state.updateJson['date']}</div>    
                            <div>描述：{this.state.updateJson['des'].join('，')}</div>    
                            <div>iosBundleMd5：{this.state.updateJson['iosBundleMd5']}</div>    
                            <div>androidBundleMd5：{this.state.updateJson['androidBundleMd5']}</div>    
                            <div>ios 升级包 Md5：
                                {this.state.updateJson['iosZipMd5'].map((value, index) => {
                                    return (
                                        <p style={{marginLeft: 20}} key={index}>{value.ver} : {value.md5}</p>
                                    )
                                })}
                            </div>
                            <div>android 升级包 Md5：
                                {this.state.updateJson['androidZipMd5'].map((value, index) => {
                                    return (
                                        <p style={{marginLeft: 20}} key={index}>{value.ver} : {value.md5}</p>
                                    )
                                })}
                            </div>
                            <div>ios 升级包 URL：
                                {
                                (this.state.file_content && this.state.file_content['ios_file']) ? 
                                    this.state.file_content['ios_file'].map((value, index) => {
                                        return (
                                            <p style={{marginLeft: 20}} key={index}>{value.title} : {value.url}</p>
                                        )
                                    }) : ''
                                }
                            </div>
                            <div>android 升级包 URL：
                                {
                                (this.state.file_content && this.state.file_content['android_file']) ? 
                                    this.state.file_content['android_file'].map((value, index) => {
                                        return (
                                            <p style={{marginLeft: 20}} key={index}>{value.title} : {value.url}</p>
                                        )
                                    }) : ''
                                }
                            </div>
                        </div>
                        <div style={{marginLeft: 20, maxWidth: 300}}>
                            <h3>配置项</h3>
                            <Toggle
                                label="是否上线"
                                defaultToggled={false}
                                style={styles.toggle}
                                onToggle={this.toggleOnline.bind(this)}
                            />
                            <Toggle
                                label="是否有效"
                                defaultToggled={false}
                                style={styles.toggle}
                                onToggle={this.toggleValid.bind(this)}
                            />
                        </div>
                        <div>
                            <RaisedButton label="提交" secondary={true} onTouchTap={this.submitInfo.bind(this)}/>
                            <span style={{color: 'red', marginLeft: 20}}>{this.state.message}</span>
                        </div>
                    </fieldset>
                    : ''
                }
                <div style={{paddingBottom: 40}}>
                    <RaisedButton label="返回" onTouchTap={this.goback.bind(this)}/>
                </div>
            </section>
        );
    }
}

export default VersionAdd;