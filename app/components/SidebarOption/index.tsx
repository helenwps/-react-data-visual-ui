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
import classnames from 'classnames'
import { Link } from 'react-router-dom'

import style from './style.less'
import { MenuRute, RouteBase } from 'containers/Main/Sidebar'
import { Menu } from 'antd'
import { createStructuredSelector } from 'reselect'
import {
  makeSelectLogged, makeSelectMenuActiveIndex, makeSelectMenuIsShow,
  makeSelectNavigator,
  makeSelectOauth2Enabled
} from 'containers/App/selectors'
import { loadDownloadList, logged, logout } from 'containers/App/actions'
import { connect } from 'react-redux'
import { Main } from 'containers/Main'

interface ISidebarOptionProps {
  menuList: MenuRute[]
}

interface SideBarState {
  openKeys: string[]
}

type MappedStates = ReturnType<typeof mapStateToProps>
type MappedDispatches = ReturnType<typeof mapDispatchToProps>
type ISidebarOptionPropsAll = ISidebarOptionProps & MappedStates & MappedDispatches



const SidebarOption: React.FC<ISidebarOptionPropsAll> = (props) => {
  const { menuList = [], menuActive, isShowMenu } = props
  const [openKeys, setOpenKeys] = useState([])
  useEffect(() => {
    if (menuActive?.split('-').length === 2) {
      setOpenKeys([menuActive?.split('-')[0]])
    }
  },[menuActive])

  const childMenuDom = menuList.map(({icon, route, menuName,menuKey, subMenu = []}, idx) => {
    const subMenuLen = subMenu.length
    if (!menuName) return null
    let subMenuDom, itemMenuDom
    if (subMenuLen) {
      subMenuDom = (
        <Menu.SubMenu key={menuKey} title={
          <span>
          {icon}
            <span style={{paddingLeft: 10}}>{menuName}</span>
        </span>
        }>
          {
            subMenu.map(({menuName, route, key, menuKey}, index) => {
              return (<Menu.Item title={menuName} key={menuKey}><Link to={route}>{menuName}</Link></Menu.Item>)
            })
          }
        </Menu.SubMenu>
      )
    } else {

      itemMenuDom = (<Menu.Item title={menuName} key={idx}>
        <Link to={route}>
        {icon}<span style={{paddingLeft: 10}}>{menuName}</span>
      </Link></Menu.Item>)
    }
    return subMenuLen ? subMenuDom : itemMenuDom
  })

  return (
     <Menu className={style['left-menu-root']} onOpenChange={setOpenKeys} openKeys={openKeys} selectedKeys={[menuActive]} mode="inline">
      {childMenuDom}
    </Menu>
  )

}

const mapStateToProps = createStructuredSelector({
  navigator: makeSelectNavigator(),
  menuActive: makeSelectMenuActiveIndex(),
  isShowMenu: makeSelectMenuIsShow()
})

export function mapDispatchToProps(dispatch) {
  return {
    onLoadDownloadList: () => dispatch(loadDownloadList())
  }
}

// export default connect(mapStateToProps, mapDispatchToProps)(Main)
export default React.memo(connect(mapStateToProps, mapDispatchToProps)(SidebarOption))
