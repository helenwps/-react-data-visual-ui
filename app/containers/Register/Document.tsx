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

import React from 'react'
import Privace from './doc/privace'
import Service from './doc/service'
import "./Document.less"

class MyDocument extends React.Component {



  render() {

    let content = null;
    let titleText = "";
    if (this.props.match.params.type == 1) {
      content = <Service></Service>
      titleText = "《东智云服务协议》"
    } else {
      content = <Privace></Privace>
      titleText = "《东智云隐私声明》"
    }

    console.log()
    return (
      <div className="register main-con">
        <div className="register-header">
          <div className="loginHeader">
            {/* <img src="@img/login/logo.svg" @click="logoClick" class="header-logo" alt="logo"> */}
            <p onClick={() => this.props.history.replace("/")}>
              <i className="iconfont" style={{}}>&#xe64d;</i>
              <span style={{ lineHeight: '56px' }}>东智可视化智能平台</span>
            </p>
          </div>
        </div>
        <div className="register-content">
          <div className="register-title"> {titleText} </div>
          <div className="register-from-content">
            {content}
          </div>
        </div>
        <div className="register-footer">
          <div className="footer-copyRight">
            <span>版权所有 ©格创东智科技有限公司 2020 保留一切权利 粤ICP备18113976号-1</span>
          </div>
        </div>
      </div>
    )

    return
  }
}
export default MyDocument