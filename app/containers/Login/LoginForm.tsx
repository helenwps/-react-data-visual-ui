import React, {
  FC,
  ChangeEvent,
  FormEvent,
  useImperativeHandle,
  useMemo,
  forwardRef
} from 'react'
import { Form, Row, Col, Input, Tag, Button, Select, AutoComplete, Tabs } from 'antd'
const TextArea = Input.TextArea
const Option = Select.Option
const FormItem = Form.Item
import styles from '../Login/Login.less'
const { TabPane } = Tabs;

function callback(key) {
  console.log(key);
}

const RegisterForm = ({
  form,
  telephone,
  loading,
  onChangeTelephone,
  onLogin
}, ref) => {
  useImperativeHandle(ref, () => ({ form }))
  const { getFieldDecorator } = form
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 24 },
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


    <Form {...formItemLayout} >

      <Tabs defaultActiveKey="1" onChange={callback}>
        <TabPane tab="账号登录" key="1">
          <Row>
            <Col span={24}>
              <FormItem >
                {getFieldDecorator('username', {
                  initialValue: undefined,
                  rules: [{
                    required: true,
                    message: '邮箱不能为空'
                  }, {
                    type: 'email',
                    message: '邮箱格式不正确'
                  }]
                })(
                  <Input placeholder="邮箱" style={{width:'100%'}}/>
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem>
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
                  <Input type="password" placeholder="密码" />
                )}
              </FormItem>
            </Col>
          </Row>
        </TabPane>
        {/*<TabPane tab="手机登录" key="2">*/}
        {/*  Content of Tab Pane 2*/}
        {/*  </TabPane>*/}

      </Tabs>



      <Row>
        <Col span={24}>
          <FormItem {...tailLayout}>
            <Button onClick={onLogin} type="primary" block className="loginBtn">登录</Button>
          </FormItem>
        </Col>
      </Row>
    </Form>
  )
}

export default Form.create()(forwardRef(RegisterForm))
