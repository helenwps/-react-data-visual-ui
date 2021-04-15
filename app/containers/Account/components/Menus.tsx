import React from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'antd'
import Sidebar from 'components/Sidebar'
import { withRouter } from 'react-router-dom'
import { RouteComponentWithParams } from 'utils/types'
import style from 'app/components/SidebarOption/style.less'
import SidebarOption from 'components/SidebarOption'
const defaultItems = [
  { icons: 'icon-user1', key: '1', text: '个人信息', route: 'profile' },
  { icons: 'icon-xiugaimima', key: '2', text: '修改密码', route: 'resetPassword' },
  { icons: 'icon-organization', key: '3', text: '我的组织', route: 'organizations' },
  { icons: 'icon-organization', key: '4', text: '租户管理', route: 'zuhus' },
  { icons: 'icon-organization', key: '5', text: '用户管理', route: 'userManage' },
  { icons: 'icon-organization', key: '6', text: '角色管理', route: 'roleManage' },
  // {icons: 'icon-group', key: '4', text: '我的团队', route: 'teams'}
]
const menus = [
  {
    menuKey: '1',
    menuName: '个人信息',
    route: `/account/profile`,
    icon: <i className="iconfont">&#xe75b;</i>
  },
  {
    menuKey: '2',
    icons: <i className="iconfont">&#xe75b;</i>,
    text: '租户管理',
    route: '/account/zuhus'
  },
  {
    icon: <i className="iconfont">&#xe75b;</i>,
    menuKey: '3',
    menuName: '修改密码',
    route: '/account/resetPassword'
  },
  {
    icon: <i className="iconfont">&#xe75b;</i>,
    menuKey: '4',
    menuName: '用户管理',
    route: '/account/userManage'
  },
  {
    icon: <i className="iconfont">&#xe75b;</i>,
    menuKey: '5',
    menuName: '角色配置',
    route: '/account/roleManage'
  },
  {
    icon: <i className="iconfont">&#xe75b;</i>,
    menuKey: '6',
    menuName: '我的组织',
    route: '/account/organizations'
  },
]
interface IMenusProps extends RouteComponentWithParams {
  active: string
  loginUser: any
}

export class Menus extends React.PureComponent<IMenusProps, {}> {
  constructor(props) {
    super(props)
  }
  public render() {
    const loginUser = this.props.loginUser
    const { pathname } = this.props.location
    const menuActive = ((menus.find(({ route }) => route == pathname))?.menuKey) || '1'
    // const menus = defaultItems.map((item) => {
    //   if ((item.route == "zuhus" && loginUser.userType != 1 ) &&  loginUser.username != "dinglv") {
    //     // 超级管理员才能看到租户管理  即租户选项不是超级管理员看不到
    //     return null
    //   } else if ((item.route == "userManage" || item.route == "roleManage") && loginUser.userType != 2){
    //     //租户管理员才能看到用户管理和角色管理
    //     return null
    //   } else if(item.route == "organizations" && loginUser.username != "dinglv"){
    //     //参考组织的项目设置  只有我的测试账号能看到
    //     return null
    //   }else {
    //     return 

    //       // <li key={item.route} style={{ fontSize: '16px' }}>
    //       //   <Link to={`/account/${item.route}`}>
    //       //     <i className={`iconfont ${item.icons}`} /> {item.text}
    //       //   </Link>
    //       // </li>

    //   }

    // })
    return (
      <div className="userMenu">
        {/* <ul
          style={{ padding: '16px 16px' }}
          // selectedKeys={[this.props.active, `${this.props.active}s`]}
        >
          {menus}
        </ul> */}
        <Menu className={style['left-menu-root']} selectedKeys={[menuActive]} mode="inline">
          <Menu.Item title="个人信息" key="1">
            <Link to='/account/profile'>
              <i className="iconfont">&#xe75b;</i>
              <span style={{ paddingLeft: 10 }}>个人信息</span>
            </Link>
          </Menu.Item>
          {loginUser.userType == 1 && (<Menu.Item title="租户管理" key="2">
            <Link to='/account/zuhus'>
              <i className="iconfont">&#xe635;</i>
              <span style={{ paddingLeft: 10 }}>租户管理</span>
            </Link>
          </Menu.Item>)}
          <Menu.Item title="修改密码" key="3">
            <Link to='/account/resetPassword'>
              <i className="iconfont">&#xe770;</i>
              <span style={{ paddingLeft: 10 }}>修改密码</span>
            </Link>
          </Menu.Item>
          {loginUser.userType == 2 && <Menu.Item title="用户管理" key="4">
            <Link to='/account/userManage'>
              <i className="iconfont">&#xe644;</i>
              <span style={{ paddingLeft: 10 }}>用户管理</span>
            </Link>
          </Menu.Item>}
          {loginUser.userType == 2 && <Menu.Item title="角色配置" key="5">
            <Link to='/account/roleManage'>
              <i className="iconfont">&#xe7ba;</i>
              <span style={{ paddingLeft: 10 }}>角色配置</span>
            </Link>
          </Menu.Item>}
        </Menu>
        {/* <Sidebar><SidebarOption menuList={menus} /></Sidebar> */}
      </div>
    )
  }
}

export default withRouter(Menus)





