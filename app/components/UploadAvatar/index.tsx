import React from 'react'
import Avatar from '../Avatar'
import { Upload, message as Message, Button } from 'antd'
const styles = require('./UploadAvatar.less')
import api from 'utils/api'
import { setToken, getToken } from 'utils/request'

interface IUploadAvatar {
  id?: number
  callback?: (path: string) => any
}
interface IUploadAvatarProps {
  type: string
  path: string
  xhrParams: IUploadAvatar
}
interface IUploadAvatarState {
  currentPath: string
}

export class UploadAvatar extends React.PureComponent<IUploadAvatarProps, IUploadAvatarState> {
  constructor(props) {
    super(props)
    this.state = {
      currentPath: '' || props.path
    }
  }
  private getBase64 = (img, callback) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result))
    reader.readAsDataURL(img)
  }
  private beforeUpload = (file) => {
    const re = /image\/(png|jpg|jpeg|gif)/
    const isJPG = re.test(file.type)
    if (!isJPG) {
      Message.error('只能上传图片!')
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      Message.error('图片大小不超过5MB!')
    }
    return !!(isJPG && isLt5M)
  }
  private handleChange = (info) => {
    const { xhrParams } = this.props
    if (info.file.status === 'done') {
      this.getBase64(info.file.originFileObj, (path) => {
        this.setState({ currentPath: path })
      })
      const response = info.file.response
      if (response && response.header && response.header.code >= 200) {
        const avatar = response.payload.avatar
        const token = response.header.token
        if (xhrParams && typeof xhrParams.callback === 'function') {
          xhrParams.callback(avatar)
        }
        setToken(token)
      }
    }
  }
  public componentWillReceiveProps(nextProps) {
    const { path } = nextProps
    if (path && path.length) {
      this.setState({
        currentPath: path
      })
    }
  }
  public render() {
    const { type, xhrParams } = this.props
    const { currentPath } = this.state
    const TOKEN = { Authorization: getToken() }
    const avatar = currentPath
      ? currentPath.indexOf('data:') >= 0
        ? currentPath
        : `${currentPath}`
      : ''
    let action = ''
    if (type === 'profile') {
      if (xhrParams && xhrParams.id) {
        action = `${api.user}/${xhrParams.id}/avatar`
      }
    } else if (type === 'organization') {
      if (xhrParams && xhrParams.id) {
        action = `${api.organizations}/${xhrParams.id}/avatar`
      }
    } else if (type === 'team') {
      if (xhrParams && xhrParams.id) {
        action = `${api.teams}/${xhrParams.id}/avatar`
      }
    }

    console.log("avatar", avatar)

    return (
      <div className={styles.avatar}>
        <div className={styles.uploadAvatar}>
          {/* <div className={styles.uploadTitle}>上传新头像</div> */}
          <Upload
            name="file"
            showUploadList={false}
            headers={TOKEN}
            action={action}
            beforeUpload={this.beforeUpload}
            onChange={this.handleChange}
          >
            {/* <Button size="large">选择图片</Button> */}
            <div className={styles.uploadInner}>
              {/* <Avatar path={avatar} size="large" enlarge={true} hideContent={false} /> */}
              {avatar && <img src={avatar} />
                ||
                (<div><img src={require('app/assets/images/sculpture.svg')} style={{opacity: '0.6'}} />
                  <div className={styles.bottom}>
                    <span>上传头像</span>
                  </div></div>)}
            </div>
          </Upload>
          {/* <p className={styles.uploadDesc}>图片大小不超过5MB</p> */}
        </div>
      </div>
    )
  }
}

export default UploadAvatar

