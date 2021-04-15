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
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { RouteComponentProps } from 'react-router-dom'

import LoginForm from './LoginForm'

import { compose } from 'redux'

import { login, logged } from '../App/actions'
import {
  makeSelectLoginLoading,
  makeSelectOauth2Enabled
} from '../App/selectors'
import checkLogin from 'utils/checkLogin'
import { setToken } from 'utils/request'
import { statistic } from 'utils/statistic/statistic.dv'
import ExternalLogin from '../ExternalLogin'
import lottie from 'lottie-web';
import animationJson from 'assets/images/loginPng/login.json';


const styles = require('./Login.less')

type MappedStates = ReturnType<typeof mapStateToProps>
type MappedDispatches = ReturnType<typeof mapDispatchToProps>
type ILoginProps = MappedStates & MappedDispatches

interface ILoginStates {
  username: string
  password: string
}

export class Login extends React.PureComponent<
  ILoginProps & RouteComponentProps,
  ILoginStates
  > {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: ''
    }
  }
  private loginForm:any
  public componentWillMount() {
    this.checkNormalLogin()
  }

  public componentDidMount(){
    console.log(this.refs.loginContent)
    lottie.loadAnimation({
      container: this.refs.loginContent,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: animationJson,
      assetsPath: '/assets/images/loginPng/'
    });
  }

  private checkNormalLogin = () => {
    if (checkLogin()) {
      const token = localStorage.getItem('TOKEN')
      const loginUser = localStorage.getItem('loginUser')
      setToken(token)
      this.props.onLogged(JSON.parse(loginUser))
      this.props.history.replace('/')
    }
  }

  private findPassword = () => {
    const { history } = this.props
    history.push('/findPassword')
  }

  private changeUsername = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      username: e.target.value.trim()
    })
  }

  private changePassword = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      password: e.target.value
    })
  }

  private toSignUp = () => {
    const { history } = this.props
    history.replace('/register')
  }

  private doLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    this.loginForm.form.validateFields((err, values) => {
      if (!err) {
        const { onLogin, history } = this.props
        const { username, password } = values
        onLogin(username, password, (loginUser) => {
          if (loginUser.userType == 2 && !loginUser.tenantId) {
            return history.replace('/register')
          }
          history.replace('/')
          statistic.whenSendTerminal()
          statistic.setOperations(
            {
              create_time: statistic.getCurrentDateTime()
            },
            (data) => {
              const loginRecord = {
                ...data,
                action: 'login'
              }
              statistic.sendOperation(loginRecord)
            }
          )
        })
      }
    })
    // const { onLogin, history } = this.props
    // const { username, password } = this.state

    // if (username && password) {

    // }
  }

  public render() {
    const { loginLoading, oauth2Enabled } = this.props
    const { username, password } = this.state
    return (
      <div ref="loginContent" className="login-content">
        <Helmet title="Login" />

        <div className="loginFrom">
          <div className="headCon">
            <div className="text1">欢迎登录东智可视化智能平台</div>
            <div className="text2">简单高效DIY，成就新一代“工业极客”</div>
          </div>
          <div className="loginFrom-content">
            {/*<el-tabs v-model="loginType"
               @keydown.enter.native="loginFun('single')">
        <el-tab-pane label="账号登录" name="account">
          <accountFrom ref="accountFrom" />
        </el-tab-pane>
        <el-tab-pane label="手机登录" name="phone">
          <phoneFrom @sendImageCode='sendImageCode' ref="phoneFrom" />
        </el-tab-pane>
      </el-tabs>

      <!--登录-->
      <el-button
              class="submit-button"
              type="primary"
              size='large'
              style="height: 40px;"
              :loading="loading"
              block
              @click="loginFun('single')">登录</el-button>

      <!--注册-->
      <span class="loginFrom-setting">
        <span @click="goToRegister">立即注册</span>
      </span>*/}

            <LoginForm
              username={username}
              password={password}
              loading={loginLoading}
              onChangeUsername={this.changeUsername}
              onChangePassword={this.changePassword}
              onLogin={this.doLogin}
              wrappedComponentRef={(ref) => {
                this.loginForm = ref
              }}
            />
            <p style={{display:'flex',justifyContent:"flex-end",color:"#040C2C"}}>
              <a
                href="javascript:;"
                // className={styles.register}
                onClick={this.toSignUp}
              >
                立即注册
          </a>
          {/* <span style={{display:'inline-block',borderLeft:"2px solid",margin:"0 5px"}}></span>  */}
          <span > | </span>
              <a
                href="javascript:;"
                // className={styles.forgetPassword}
                onClick={this.findPassword}
              >
                忘记密码
          </a>
            </p>
            {oauth2Enabled && <ExternalLogin />}
          </div>
        </div>

        <div className="login-footer">
        <div className="footer-copyRight">
          <span>版权所有 ©格创东智科技有限公司 2020 保留一切权利 粤ICP备18113976号-1</span>
        </div>
      </div>

      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  loginLoading: makeSelectLoginLoading(),
  oauth2Enabled: makeSelectOauth2Enabled()
})

export function mapDispatchToProps(dispatch) {
  return {
    onLogin: (username: string, password: string, resolve: (loginUser) => void) =>
      dispatch(login(username, password, resolve)),
    onLogged: (user) => dispatch(logged(user))
  }
}

const withConnect = connect<{}, {}, ILoginProps>(
  mapStateToProps,
  mapDispatchToProps
)

export default compose(withConnect)(Login)
