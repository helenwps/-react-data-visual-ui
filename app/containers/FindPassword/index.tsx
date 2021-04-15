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

import React, { useMemo, useState, ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { Form } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import {
  GetPassWordType,
  IOperateStates,
  FindPwStep
} from './types'

import GetCaptcha from './GetCaptcha'
import ResetPassword from './ResetPassword'

const styles = require('./index.less')

const FindPassword: React.FC<FormComponentProps> = React.memo(() => {
  const [type, setType] = useState<GetPassWordType>(GetPassWordType.EMAIL)
  const [ticket, setTicket] = useState<string>()
  const [token, setToken] = useState<string>()
  const [step, setStep] = useState<FindPwStep>(FindPwStep.CAPTCHA)
  const operate: IOperateStates = useMemo(
    () => ({
      type,
      ticket,
      token,
      setType,
      setTicket,
      setToken,
      step,
      setStep
    }),
    [type, ticket, token, setType, setTicket, setToken]
  )

  const StepContent: ReactElement = useMemo(() => {
    return step == FindPwStep.CAPTCHA ? (
      <GetCaptcha {...operate} />
    ) : (
        <ResetPassword {...operate} />
      )
  }, [step, operate])
  console.log("findpwd")

  return (
    <div className="register">
      <div className="register-content">
        <div className="register-title">账号安全</div>
        <div className="register-from-content">
          <div >
            {/* <nav className={styles.header}> */}
            {/* <div className={styles.logoPc}>
          <div className={styles.logo}>
            <Link to="/login">
              <img src={require('assets/images/logo.svg')} />
            </Link>
          </div>
        </div>
        <div className={styles.resetPw}>重置密码</div> */}
            {/* </nav> */}
            <div >
              <div >{StepContent}</div>
              
            </div>
          </div>
        </div>
        <div className="footer-copyRight">
          <span>版权所有 ©格创东智科技有限公司 2020 保留一切权利 粤ICP备18113976号-1</span>
        </div>
      </div>
    </div>


  )
})

export default Form.create<FormComponentProps>()(FindPassword)
