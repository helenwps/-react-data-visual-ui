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

import React, { useEffect, useMemo, PropsWithChildren, useState } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import {
  useLocation,
  matchPath,
  useHistory
} from 'react-router-dom'

import {
  hideMenu,
  hideNavigator,
  hideProjectMenu,
  setMenuActive,
  showMenu,
  showNavigator, showProjectMenu
} from 'containers/App/actions'
import { makeSelectCurrentProject } from 'containers/Projects/selectors'
import { Icon, Menu } from 'antd'
import SidebarOption from 'components/SidebarOption'
import { withRouter } from 'react-router-dom'

import Sidebar from 'components/Sidebar'
import { makeSelectMenuIsShow } from 'containers/App/selectors'

import { SidebarPermissions } from './constants'
import { IRouteParams } from 'utils/types'
import useProjectPermission from '../Projects/hooks/projectPermission'
import reducer from 'share/containers/App/reducer.ts'
import saga from 'share/containers/App/sagas'
export interface RouteBase {
  menuName: string,
  route: string,
  icon?: string,
  key?: string,
  menuKey: string,
  parentKey?: string
}

export interface MenuRute {
  icon: React.ReactNode
  route?: string,
  menuKey: string,
  subMenu?: RouteBase[],
  menuName?: string,
  permissionName?: typeof SidebarPermissions[number]
}

import styles from './Main.less'
import { createStructuredSelector } from 'reselect'

const MainSidebar = (props) => {
  const dispatch = useDispatch()
  // const [pathname] = useState(props.location.pathname)
  useEffect(() => {
    // 左侧菜单栏隐藏页面
    const hideLeftMenuMapPageUrl: RegExp[] = [
      /^\/project\/\d+\/choose[\/]*$/,
      /^\/project\/\d+\/widget[\/]*$/,
      /^\/account\//,
      /^\/user\/view[\d\/]*$/,
      /^\/project\/\d+\/display\/\d+\/slide\/\d+[\/]*$/,
      /^\/project\/\d+\/widget\/\d+[\/]*$/,
      /^\/project\/\d+\/vizs\/portal\/\d+[\/]*$/,
      /^\/project\/\d+\/vizs\/portal\/\d+\/dashboard\/\d+[\/]*$/,
      /^\/project\/\d+\/vizs\/portal\/\d+\/dashboard\/\d+\/preview[\/]*$/,
      /^\/project\/\d+\/display\/\d+\/preview\/slide\/\d+[\/]*$/
    ]
    // 顶部导航隐藏页面
    const hideTopNavMapPageUrl: RegExp[] = [
      /^\/project\/\d+\/choose[\/]*$/,
      /^\/project\/\d+\/widget[\/]*$/,
      // /^\/user\/view[\/]*$/,
      /^\/project\/\d+\/display\/\d+\/slide\/\d+[\/]*$/,
      /^\/project\/\d+\/widget\/\d+[\/]*$/,
      /^\/project\/\d+\/vizs\/portal\/\d+[\/]*$/,
      /^\/project\/\d+\/vizs\/portal\/\d+\/dashboard\/\d+[\/]*$/,
      /^\/project\/\d+\/vizs\/portal\/\d+\/dashboard\/\d+\/preview[\/]*$/,
      /^\/project\/\d+\/display\/\d+\/preview\/slide\/\d+[\/]*$/
    ]
    // 顶部菜单隐藏页面
    const hideTopProjectMenuMapPageUrl: RegExp[] = [
      /^\/project\/\d+\/choose[\/]*$/,
      /^\/project\/\d+\/widget[\/]*$/,
      /^\/project\/\d+\/display\/\d+\/slide\/\d+[\/]*$/,
      /^\/project\/\d+\/widget\/\d+[\/]*$/,
      /^\/project\/\d+\/vizs\/portal\/\d+[\/]*$/,
      /^\/project\/\d+\/vizs\/portal\/\d+\/dashboard\/\d+[\/]*$/,
      /^\/project\/\d+\/schedule[\/]*$/,
      /^\/project\/\d+\/schedule\/\d+[\/]*$/,
      /^\/project\/\d+\/vizs\/portal\/\d+\/dashboard\/\d+\/preview[\/]*$/,
      /^\/project\/\d+\/display\/\d+\/preview\/slide\/\d+[\/]*$/
    ]



    const pathname = props.location.pathname
    if (hideLeftMenuMapPageUrl.some(row => row.test(pathname))) {
      dispatch(hideMenu())
    } else {
      dispatch(showMenu())
    }

    if (hideTopNavMapPageUrl.some(row => row.test(pathname))) {
      dispatch(hideNavigator())
    } else {
      dispatch(showNavigator())
    }

    if (hideTopProjectMenuMapPageUrl.some(row => row.test(pathname))) {
      dispatch(hideProjectMenu())
    } else {
      dispatch(showProjectMenu())
    }

    let active = pagePathToActiveIndex[pathname]
    if (!active) {
      // 我的数据源编辑页面
      if (/^\/user\/view\/\d+[\/]*$/.test(pathname)) {
        active = '1'
      }
    }
    if (active) {
      dispatch(setMenuActive(active))
    } else if (pathname.split('/')[1] === 'project') {
      // 以project开头的地址，默认会选中左边第一个菜单
      dispatch(setMenuActive('0-1'))
    }
  }, [props.location.pathname])

  const pagePathToActiveIndex = {
    '/user/project/1': '0-1',
    '/user/project/2': '0-2',
    '/user/views': '1',
    '/user/sources': '2'
  }



  const isShowMenu = useSelector(makeSelectMenuIsShow())


  const sidebar = useMemo(() => {
    const sidebarSource: MenuRute[] = [
      {
        icon: <i className="iconfont">&#xe723;</i>,
        menuName: '我的项目',
        menuKey: '0',
        subMenu: [
          {
            menuKey: '0-1',
            menuName: '我创建的项目',
            route: '/user/project/1'
          },
          {
            menuKey: '0-2',
            menuName: '授权我的项目',
            route: '/user/project/2'
          }
        ],
        permissionName: 'vizPermission'
      },
      {
        menuKey: '1',
        menuName: '我的数据',
        route: `/user/views`,
        icon: <i className="iconfont">&#xe721;</i>
      },
      {
        menuKey: '2',
        menuName: '我的数据源',
        route: `/user/sources`,
        icon: <i className="iconfont">&#xe722;</i>
      }
    ]

    return <Sidebar><SidebarOption menuList={sidebarSource}/></Sidebar>
  }, [])
  // return null
  return (
    <div className={styles.sidebar}>
      {isShowMenu && sidebar}
      <div className={styles.content}>{props.children}</div>
    </div>
  )
}


export default withRouter(MainSidebar)
