import React, {
  FC,
  ChangeEvent,
  FormEvent,
  useImperativeHandle,
  useMemo,
  forwardRef
} from 'react'
import { Form, Row, Col, Input, Tag, Button, Select, AutoComplete } from 'antd'
const TextArea = Input.TextArea
const Option = Select.Option
const FormItem = Form.Item
import styles from '../Login/Login.less'
import { rulesGen } from 'utils/rulesGen'

const RegisterForm = ({
  form,
  telephone,
  loading,
  onChangeTelephone,
  onSignup,
  toLogin
}, ref) => {
  useImperativeHandle(ref, () => ({ form }))
  const { getFieldDecorator } = form
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };
  const tailLayout = {
    wrapperCol: { offset: 0, span: 24 },
  };
  return (
    // <form className={styles.form} onSubmit={onSignupExtra}>
    //   <div className={styles.input}>
    //     <Icon type="user" />
    //     <input
    //       placeholder="手机号"
    //       value={telephone}
    //       onChange={onChangeTelephone}
    //     />
    //   </div>

    //   <button type="submit" className={styles.submit} disabled={loading}>
    //     {(loading) ? <Icon type="loading" /> : ''}
    //     完善信息
    //   </button>
    // </form>
    <div className="register-content">
      <div className="register-title">欢迎注册东智可视化智能平台</div>
      <div className="register-from-content">
        <Form {...formItemLayout} style={{ width: 500, margin: "auto", }}>
          <Row>
            <Col span={24}>
              <FormItem label="用户名">
                {getFieldDecorator('username', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    message: '用户名不能为空'
                  }, {
                    whitespace: true,
                    message: '不能全部为空格'
                  },
                  ...rulesGen.length(1, 10)
                  ]
                })(
                  <Input placeholder="用户名" />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="邮箱">
                {getFieldDecorator('email', {
                  initialValue: undefined,
                  rules: [{
                    required: true,
                    message: '邮箱不能为空'
                  }, {
                    type: 'email',
                    message: '邮箱格式不正确'
                  }]
                })(
                  <Input placeholder="邮箱" />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="密码" >
                {getFieldDecorator('password', {
                  initialValue: undefined,
                  rules: [{
                    required: true,
                    message: '密码不能为空'
                  }, {
                    pattern: /.{6,}/,
                    message: '长度6位以上'
                  }, {
                    whitespace: true,
                    message: '不能全部为空格'
                  }]
                })(
                  <Input.Password type="password" placeholder="密码" />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="管理员手机号码">
                {getFieldDecorator('phone', {
                  initialValue: '',
                  rules: [{
                    required: true,
                    message: '手机号码不能为空'
                  }, {
                    whitespace: true,
                    message: '不能全部为空格'
                  },
                  ...rulesGen.telephone
                  ]
                })(
                  <Input placeholder="手机号" />
                )}
              </FormItem>
            </Col>

            <Col span={24}>
              <FormItem {...tailLayout}>
                <Button onClick={onSignup}  type="primary" block>下一步</Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <div className="register-form-title" >
          <span>已有账号? </span>
          <span className="register-tologin" onClick={toLogin}>立即登录</span>
        </div>
        
      </div>

      <div className="footer-copyRight">
          <span>版权所有 ©格创东智科技有限公司 2020 保留一切权利 粤ICP备18113976号-1</span>
        </div>


    </div>


  )
}

export default Form.create()(forwardRef(RegisterForm))
