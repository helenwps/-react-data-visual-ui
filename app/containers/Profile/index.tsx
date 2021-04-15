import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Icon, Col, message, Row, Input, Form, Button, Breadcrumb } from 'antd'
const FormItem = Form.Item
const styles = require('./profile.less')
import Box from 'components/Box'
import UploadAvatar from 'components/UploadAvatar'
import { createStructuredSelector } from 'reselect'
import { makeSelectLoginUser } from '../App/selectors'
import { compose } from 'redux'
import { updateProfile, checkNameUniqueAction, uploadAvatarSuccess } from '../App/actions'
const utilStyles = require('assets/less/util.less')
import request from 'utils/request'

import {rulesGen} from 'utils/rulesGen'

interface IProfileProps {
  form: any
  type: string
  loginUser: any
  profileForm: any,
  onUploadAvatarSuccess: (path: string) => any,
  onUpdateProfile: any
  onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export class Profile extends React.PureComponent<IProfileProps, any> {
  state = {
    user: {} as any
  }
  private checkNameUnique = (rule, value = '', callback) => {
    const { onCheckUniqueName, loginUser: {id} } = this.props
    const data = {
      username: value,
      id
    }
    onCheckUniqueName('user', data,
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }
  private submit = () => {
    const { onUpdateProfile, loginUser: {id} } = this.props
    this.props.form.validateFields((err, values) => {
      if(!err){
        const values = this.props.form.getFieldsValue()
        const {name, email,phone,workNum, department} = values
        onUpdateProfile(id, name,email,phone,workNum, department, (data) => {
          message.success(data.header && "保存成功")
        })
      }
    })
    
  }
  public async componentDidMount () {
    const { id } = this.props.loginUser
    const {payload} = await request({
      url: `/api/v3/users/profile/${id}`,
      method: 'GET'
    })
    this.setState({user: payload})
  }
  public uploadAvatarSuccessCallback = (path) => {
    const { onUploadAvatarSuccess, loginUser } = this.props
    const newLoginUser = {...loginUser,  ...{avatar: path}}
    if (onUploadAvatarSuccess) {
      onUploadAvatarSuccess(path)
    }
    localStorage.setItem('loginUser', JSON.stringify(newLoginUser))
  }
  public render () {
    const {getFieldDecorator} = this.props.form
    const { id, avatar } = this.props.loginUser
    const { name, email,phone,workNum, department } = this.state.user
    const commonFormItemStyle = {
      labelCol: { span: 4 },
      wrapperCol: { span: 12 }
    }
    return (
      // <Box>
      //   <Box.Header>
      //     <Box.Title>
      //       <Breadcrumb className={utilStyles.breadcrumb}>
      //         <Breadcrumb.Item>
      //           <Link to="/account/profile">
      //             <Icon type="bars" />个人信息
      //           </Link>
      //         </Breadcrumb.Item>
      //       </Breadcrumb>
      //     </Box.Title>
      //   </Box.Header>
      //   <Box.Body>
      <div>
        <div className={styles.header}>
          个人信息
        </div>
        <div className={styles.container}>
            <div className={styles.uploadWrapper}>
            </div>
            <div >
              <Form
                // className={styles.formView}
                {...commonFormItemStyle}
                labelAlign="left"
              >
                <Row>
                  <Col>
                    <Form.Item label="头像">
                      <UploadAvatar type="profile" xhrParams={{id, callback: this.uploadAvatarSuccessCallback}} path={avatar} />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item
                      className={styles.hide}
                      
                    >
                      {getFieldDecorator('id', {
                      
                      })(
                        <Input />
                      )}
                    </Form.Item>
                    <Form.Item
                      label="姓名"
                    >
                      {getFieldDecorator('name', {
                        initialValue: name || undefined,
                        rules: [{ required: true,message:"姓名必填" }, ]
                        // rules: [{ required: true,message:"姓名必填" }, {validator: this.checkNameUnique}]
                      })(
                        <Input placeholder="姓名"/>
                      )}
                    </Form.Item>
                  </Col>
                  <Col>
                    <FormItem
                      label="邮箱"
                    >
                      {getFieldDecorator('email', {
                        initialValue: email || undefined,
                        rules:[
                          ...rulesGen.required,
                          ...rulesGen.email,
                        ]
                      })(
                        <Input placeholder="邮箱"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col>
                    <FormItem
                      label="手机号码"
                    >
                      {getFieldDecorator('phone', {
                        initialValue: phone || undefined,
                        rules:[
                          ...rulesGen.required,
                          ...rulesGen.telephone,
                        ]
                      })(
                        <Input placeholder="手机号码"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col>
                    <FormItem
                      label="工号"
                    >
                      {getFieldDecorator('workNum', {
                        initialValue: workNum || undefined
                      })(
                        <Input disabled/>
                      )}
                    </FormItem>
                  </Col>
                  <Col>
                    <FormItem
                      label="部门"
                    >
                      {getFieldDecorator('department', {
                        initialValue: department || undefined
                      })(
                        <Input disabled/>
                      )}
                    </FormItem>
                  </Col>
                  <Col>
                    <Button  type="primary" onClick={this.submit}>保存</Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
      </div>
          
      //   </Box.Body>
      // </Box>
    )
  }
}

export function mapDispatchToProps (dispatch) {
  return {
    onUpdateProfile: (id, name,email,phone,workNum, department, resolve) => dispatch(updateProfile(id, name,email,phone,workNum,  department, resolve)),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject)),
    onUploadAvatarSuccess: (path) => dispatch(uploadAvatarSuccess(path))
  }
}

const mapStateToProps = createStructuredSelector({
  loginUser: makeSelectLoginUser()
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default compose(
  withConnect
)(Form.create()(Profile))
