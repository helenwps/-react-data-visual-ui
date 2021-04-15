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

import React, { useEffect, useState } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { Menu } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { makeSelectCurrentProject } from 'containers/Projects/selectors'
import ProjectNav from "./ProjectNav.less"
import {
  makeSelectProjectMenuActiveIndex,
  makeSelectProjectMenuIsShow
} from 'containers/App/selectors'
import {
  setProjectMenuActive
} from 'containers/App/actions'

export default withRouter((props) => {
  const dispatch = useDispatch()
  const currentProject = useSelector(makeSelectCurrentProject())
  const {id, name} = currentProject
  const {history, location} = props

  const isShowMenu = useSelector(makeSelectProjectMenuIsShow())


  const menuList = [
    {key: 'vizs', name: '仪表盘', path: `/project/${id}/vizs`},
    {key: 'display', name: '数据大屏', path: `/project/${id}/display`},
    {key: 'widgets', name: '图表组件', path: `/project/${id}/widgets`},
    {key: 'schedules', name: '任务', path: `/project/${id}/schedules`},
  ]
  // 路由第三级与key对应，则会选中对应的菜单
  const pathname = location.pathname
  useEffect(() => {

    if (pathname.split('/').length > 3) {
      const key = pathname.split('/')[3]
      if (menuList.findIndex(row => row.key === key) > -1) {
        dispatch(setProjectMenuActive(key))
      }
    }
  }, [pathname])

  const menuActive = useSelector(makeSelectProjectMenuActiveIndex())
  const menuListDom = menuList.map(row => {
    return (
      <Menu.Item key={row.key}>
      <Link to={row.path}>{row.name}</Link>
    </Menu.Item>
    )
  })

  const back = () => {
    history.push('/user/project/1')
  }

  return (
    id &&
    <div className={ProjectNav.projectMainContent}>
      {
        isShowMenu &&
        <div className={ProjectNav.projectHead}>
          <div className={ProjectNav.nav}>
            <div className={ProjectNav.back} onClick={back}>
              <i className="iconfont">&#xe6f7;</i>
              返回我创建的项目
            </div>
            <div className={ProjectNav.title}>{name}</div>
          </div>
          <div className={ProjectNav.menu}>
            <Menu mode="horizontal" selectedKeys={menuActive}>
              {menuListDom}
            </Menu>
          </div>
        </div>
      }
      <div className={ProjectNav.projectBody} style={{height: isShowMenu ? 'calc(100% - 100px)' : '100%'}}>
        {props.children}
      </div>
    </div>
  )
})
