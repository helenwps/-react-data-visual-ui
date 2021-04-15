import React from 'react'

import { Upload, message as Message, Button, message } from 'antd'

import api from 'utils/api'
import { setToken, getToken } from 'utils/request'
import styles from './zhuhus.less'

export class UploadUsers extends React.PureComponent<any, any> {
  constructor(props) {
    super(props)
    this.state = {
      fileList: []
    }
  }
  private getBase64 = (img, callback) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result))
    reader.readAsDataURL(img)
  }
  private beforeUpload = (file) => {
    const re = /excel|xls|sheet/
    const isExcel = re.test(file.type)

    if (!isExcel) {
      Message.error('文档格式错误，请上传excel格式文档')
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      Message.error('文件大小小于5M')
    }
    // return false
    return !!(isExcel && isLt5M)
  }
  private closeModal = () => this.setState({fileList: []})
  private handleChange = (info) => {
    const response = info.file.response
    this.setState({fileList: info.fileList})
    if (info.file.status === 'done') {
      this.setState({ fileList: info.fileList })
      if (response && response.header) {
        if (response.header.code == 200) {
          const avatar = response.payload.avatar
          const token = response.header.token
          //获取一个部门的用户
          this.props.doSelectDepartmentUsers()
          //隐藏导入用户模态框
          // this.props.hideBatchImportUsersVisible()
          message.success(response.header.msg)
          this.setState({fileList: []})
          this.props.onCancel()
          // setToken(token)
        } else {
          message.error(response.header.msg)
        }

      }
    } else if (info.file.status === 'error') {
      message.error(response.header.msg)
      this.setState({fileList: []})
    }
  }

  public render() {
    let { userId, depId } = this.props
    const { currentPath, fileList } = this.state
    const TOKEN = { Authorization: getToken() }
    userId = this.props.loginUser.id
    depId = 3

    let type = 'batchImportUsers'
    let fileType = "excel"
    let action = ''
    if (type === 'batchImportUsers') {
      // depId  部门id
      // type  文件类型
      action = `${api.user}/upload/${userId}/${depId}/${fileType}`
    }



    let downloadUrl = 'http://data-visual-ui-front.data-visual.10.74.20.167.nip.io/ext/uploadUsers.xlsx'

    return (
      <div className={styles.batch}>

        <div>
          <Button className={styles.uploadDemo} icon="downlaod" type="primary" onClick={() => { window.open(downloadUrl, "blank") }}>下载excel模板</Button>
          <Upload
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .csv"
            showUploadList={true}
            headers={TOKEN}
            action={action}
            beforeUpload={this.beforeUpload}
            onChange={this.handleChange}
            fileList={fileList}
            data={{ userId, depId, type: fileType }}
          >
            <Button size="large">
              <i className="iconfont">&#xe70f;</i>
              &nbsp;
              点击上传
            </Button>
          </Upload>
          <p className={styles.note}>支持excel格式，不超过5M</p>
        </div>
      </div>
    )
  }
}

export default UploadUsers

