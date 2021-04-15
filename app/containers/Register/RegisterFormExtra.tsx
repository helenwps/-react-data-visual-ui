/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import React, {
  FC,
  ChangeEvent,
  FormEvent,
  useImperativeHandle,
  useMemo,
  forwardRef,
  
} from 'react'

import { useHistory } from "react-router-dom";
import { Form, Row, Col, Input, Tag, Button, Select, AutoComplete, Checkbox, message } from 'antd'
const TextArea = Input.TextArea
const Option = Select.Option
const FormItem = Form.Item
import styles from '../Login/Login.less'


import { rulesGen } from 'utils/rulesGen'



let checked = false
function onChange(e) {
  console.log(`checked = ${e.target.checked}`);
  checked = e.target.checked
}

const goToDocument = (type) => {
  window.open(`/#/document/${type}?type=${type}`, '_blank');
}

const RegisterForm = (props, ref) => {

  let {
    form,
    industrys,
    telephone,
    loading,
    onChangeTelephone,
    onSignupExtra
  } = props

  const history = useHistory();

  useImperativeHandle(ref, () => ({ form }))
  const { getFieldDecorator } = form
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  };

  const SignupExtra = () => {
    if (!checked) {
      return message.info("请阅读并同意东智可视化平台服务协议和隐私声明")
    }
    onSignupExtra()
  }

  const tailLayout = {
    wrapperCol: { offset: 0, span: 24 },
  };

  console.log(rulesGen.length(1, 50))
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
        <Form {...formItemLayout} style={{ width: 420, margin: "auto" }}>
          <Row>
            <Col span={24}>
              <p className="formExtra-title">为提供更好的产品和服务，请您完善下面基本信息</p>
            </Col>
            <Col span={24}>
              <FormItem label="姓名">
                {getFieldDecorator('nickname', {
                  initialValue: undefined,
                  rules: [{
                    required: true,
                    message: '姓名不能为空'
                  }, {
                    whitespace: true,
                    message: '不能全部为空格'
                  },
                  ...rulesGen.length(1, 10)
                  ]
                })(
                  <Input placeholder="姓名" />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="公司名称">
                {getFieldDecorator('name', {
                  initialValue: undefined,
                  rules: [{
                    required: true,
                    message: '公司名称不能为空'
                  }, {
                    whitespace: true,
                    message: '不能全部为空格'
                  },
                  ...rulesGen.length(1, 40)
                  ]
                })(
                  <Input placeholder="公司名称" />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="行业">
                {getFieldDecorator('industry', {
                  initialValue: undefined,
                  rules: [{
                    required: true,
                    message: '行业不能为空'
                  }, {
                    whitespace: true,
                    message: '不能全部为空格'
                  },

                  ]
                })(
                  <Select style={{ width: '100%' }} placeholder="请选择">
                    {
                      industrys.map((item) => {
                        return (<Option key={item.id} value={`${item.id}`}>{item.value}</Option>)
                      })
                    }
                  </Select>
                )}
              </FormItem>
            </Col>

            <Col span={24}>
              <FormItem label="" {...tailLayout}>
                <Checkbox onChange={onChange}></Checkbox>
                <span style={{ 'marginLeft': '5px' }}>我已阅读并同意 </span>
                <span className="register-tologin" onClick={() => { goToDocument(1) }}>东智可视化平台服务协议 </span>
                <span>和</span>
                <span className="register-tologin" onClick={() => { goToDocument(2) }}> 隐私声明 </span>
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="" {...tailLayout}>
                <Button onClick={SignupExtra} type="primary" block>提交</Button>
              </FormItem>
            </Col>
            <Col span={24}>
              <div className="register-form-title" >
                <span>已有账号? </span>
                <span className="register-tologin" onClick={()=>history.replace("/")}>立即登录</span>
              </div>
            </Col>

          </Row>
        </Form>

        {/* <div className="register-content-footer">
          <div className="register-form-footer">

          </div>

        </div> */}
      </div>
      <div className="footer-copyRight">
        <span>版权所有 ©格创东智科技有限公司 2020 保留一切权利 粤ICP备18113976号-1</span>
      </div>
    </div>

  )
}

export default Form.create()(forwardRef(RegisterForm))
