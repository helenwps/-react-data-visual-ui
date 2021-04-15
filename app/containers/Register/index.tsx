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

import React, { ChangeEvent, FormEvent } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { createStructuredSelector } from 'reselect'

import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import { message, Button } from 'antd'
import RegisterForm from './RegisterForm'
import RegisterFormExtra from './RegisterFormExtra'
import SendEmailTips from './SendEmailTips'
import { checkNameAction } from '../App/actions'
import { signup, signupExtra, sendMailAgain } from './actions'
import { makeSelectSignupLoading, makeSelectSignupExtraLoading } from './selectors'
import { makeSelectLoginUser } from 'containers/App/selectors'
import { RouteComponentProps } from 'react-router-dom'
import styles from 'containers/Register/register.less'


import {
  GET_INDUSTRY
} from "./constants"

import { setToken } from 'utils/request'

interface IRegisterProps {
  signupLoading: boolean
  signupExtraLoading: boolean
  onSendEmailOnceMore: (email: string, resolve?: (res: any) => any) => any
  onSignup: any
  onSignupExtra: any
  onCheckName: (id: number, name: string, type: string, param?: any, resolve?: (res: any) => any, reject?: (error: any) => any) => any

}

interface IRegisterStates {
  step: string
  username: string
  email: string
  password: string
  password2: string
  telephone: string
}


export class Register extends React.PureComponent<IRegisterProps & RouteComponentProps, IRegisterStates> {
  constructor(props) {
    super(props)
    let step = "first"
    this.formdata = {}
    let UserRegisterTemp = localStorage.getItem("UserRegisterTemp")
    console.log("UserRegisterTemp", UserRegisterTemp)
    if (UserRegisterTemp) {
      UserRegisterTemp = JSON.parse(UserRegisterTemp)
      if (UserRegisterTemp.userType == 2 && !UserRegisterTemp.tenantId) {
        message.info("请完善租户信息！")
        step = 'second'
        this.formdata = UserRegisterTemp
        localStorage.removeItem("UserRegisterTemp")
        localStorage.removeItem('TOKEN')
        localStorage.removeItem('TOKEN_EXPIRE')

        localStorage.setItem("idRegisterTemp", UserRegisterTemp.id)
      }
    }


    this.state = {
      step: step,
      username: '',
      email: '',
      password: '',
      password2: '',
      telephone: ''
    }
    // this.state.step = "second"
    // this.state.step = "third"



  }

  componentDidMount = () => {
    this.props.getIndustrys()
  }


  private changeUsername = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      username: e.target.value.trim()
    })
  }

  private changeEmail = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      email: e.target.value.trim()
    })
  }

  private changePassword = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      password: e.target.value.trim()
    })
  }

  private changePassword2 = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      password2: e.target.value.trim()
    })
  }

  private ChangeTelephone = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      telephone: e.target.value.trim()
    })
  }



  private signUp = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { onSignup } = this.props

    this.registerForm.form.validateFields((err, values) => {
      if (!err) {
        // const { username, email, password} = values
        this.formdata = { ...values }

        let formdata = { ...values }
        onSignup(formdata, (resPayload) => {
          localStorage.setItem("idRegisterTemp", resPayload.split(",")[1])
          localStorage.setItem("UserRegisterToken", resPayload.split(",")[0])

          // setToken(resPayload.split(",")[0])
          this.setState({
            step: 'second'
          })
        })
      }
    })
    // console.log()
    // const { username, email, password, password2 } = this.state
    // const emailRep = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/
    // if (username && password && email && password2) {
    //   if (!emailRep.test(email)) {
    //     message.error('无效的邮箱地址')
    //     return
    //   }
    //   if (password.length < 6 || password.length > 20) {
    //     message.error('密码长度为6-20位')
    //     return
    //   }
    //   if (password !== password2) {
    //     message.error('两次输入的密码不一致')
    //     return
    //   }


    // }
  }

  //第二步补充额外信息
  private signUpExtra = () => {

    // {
    //   "createBy": 0,  被谁创建的
    //   "createUserNum": 10,   能创建的用户数
    //   "industry": 0,   行业
    //   "name": "string",   公司名
    //   "phone": "string",   手机号
    //   "tenantType": 2,   租户类型  注册创建的
    //   "userId": 0, 谁创建的
    //   "validityEndTime": "2020-11-30T01:50:14.491Z",  有效期
    //   "validityStartTime": "2020-11-30T01:50:14.491Z"   当天开始加15天
    // }
    this.registerFormExtra.form.validateFields((err, values) => {
      if (!err) {
        const { onSignupExtra } = this.props
        const { telephone } = this.state
        let validityStartTime = new Date()
        let validityEndTime = new Date(+validityStartTime + 3600 * 1000 * 24 * 15)

        let formdata = {
          ...values,
          createBy: this.formdata.id || localStorage.getItem("idRegisterTemp"),   //this.formdata.id是从登录跳过来的
          createUserNum: 10,
          tenantType: 2,
          userId: this.formdata.id || localStorage.getItem("idRegisterTemp"),
          validityEndTime,
          validityStartTime,
        }
        onSignupExtra(formdata, () => {
          this.setState({
            step: 'third'
          })
          // localStorage.removeItem("TOKEN")
        })
      }
    })
  }

  private goBack = () => {
    this.setState({
      step: 'second'
    })
  }

  private toLogin = () => {
    const { history } = this.props
    history.replace('/login')
  }

  private sendEmailOnceMore = () => {
    const { onSendEmailOnceMore } = this.props
    const { email } = this.formdata
    onSendEmailOnceMore(email, (res) => {
      message.success(res)
    })
  }

  public render() {
    console.log(this.props)
    console.log("this.state", this.state)
    console.log("registerFormExtra", this.registerFormExtra)
    console.log("props", this.props)

    const { step, email } = this.state
    const { onCheckName, signupLoading, signupExtraLoading } = this.props
    const firstStep = (
      <div className="register">
        <Helmet title="Register" />

        <RegisterForm
          username={this.state.username}
          email={this.state.email}
          password={this.state.password}
          password2={this.state.password2}
          loading={signupLoading}
          onChangeUsername={this.changeUsername}
          onChangeEmail={this.changeEmail}
          onChangePassword={this.changePassword}
          onChangePassword2={this.changePassword2}
          onCheckName={onCheckName}
          onSignup={this.signUp}
          toLogin={this.toLogin}
          wrappedComponentRef={(ref) => {
            this.registerForm = ref
          }}
        />

      </div>
    )


    const secondStep = (
      <div className="register">
        <RegisterFormExtra
          telephone={this.state.telephone}
          loading={signupExtraLoading}
          onChangeTelephone={this.ChangeTelephone}
          onSignupExtra={this.signUpExtra}
          industrys={this.props.industrys}
          wrappedComponentRef={(ref) => {
            this.registerFormExtra = ref
          }}
        />
      </div>
    )

    const thirdStep = (


      <div className="register">
        <div className="register-success">
          <div className="result-icon">
            <i className="iconfont">&#xe6f2;</i>
          </div>
          <span className="result-title">注册成功</span>
          <div className="result-subtitle">
            请登录注册邮箱，点击激活链接进行激活
                    <br />
            <Button type="primary" className="back-index" onClick={() => { this.props.history.replace("/") }}
              style={{marginTop:20,backgroundColor: '#1740DC'}}
            >返回首页</Button>
          </div>
          <div className="result-extra">

          </div>
          <div className={styles.window}></div>


          {/* <div className={styles.window}>
            <Helmet title="Register" />
            <SendEmailTips
              email={this.formdata.email}
              goBack={this.goBack}
              sendEmailOnceMore={this.sendEmailOnceMore}
            />
          </div> */}
        </div>

      </div>

    )


      switch (step) {
        case 'first':
          return firstStep;
        case 'second':
          return secondStep;
        case 'third':
          return thirdStep;
      }

    


    // return step === 'first' ? firstStep : secondStep
  }
}




const mapStateToProps = createStructuredSelector({
  loginUser: makeSelectLoginUser(),
  signupLoading: makeSelectSignupLoading(),
  signupExtraLoading: makeSelectSignupExtraLoading(),
  industrys: (state) => state.register.industrys,
})

export function mapDispatchToProps(dispatch) {
  return {
    onSignup: (formdata, resolve) => dispatch(signup(formdata, resolve)),
    onSignupExtra: (formdata, resolve) => dispatch(signupExtra(formdata, resolve)),
    onCheckName: (id, name, type, params, resolve, reject) => dispatch(checkNameAction(id, name, type, params, resolve, reject)),
    onSendEmailOnceMore: (email, resolve) => dispatch(sendMailAgain(email, resolve)),
    getIndustrys: () => dispatch({
      type: GET_INDUSTRY,
      payload: {

      }
    }),
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'register', reducer })
const withSaga = injectSaga({ key: 'register', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(Register)



