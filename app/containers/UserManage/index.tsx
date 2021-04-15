import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import FormType from 'antd/lib/form/Form'
import { Dropdown, Layout, Menu, } from 'antd';
import { createStructuredSelector } from 'reselect'
import { makeSelectLoginUser } from '../App/selectors'
import { compose } from 'redux'
const utilStyles = require('../Profile/profile.less')
import classnames from 'classnames'



import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import {
  GET_DEPARTMENTS,
  ADD_DEPARTMENT,
  EDIT_DEPARTMENT,
  GET_DEPARTMENT_USERS,
  ADD_DEPARTMENT_USER,
  EDIT_DEPARTMENT_USER,
  DELETE_DEPARTMENT,
  GET_ALL_USER,
  GET_ROLES,
  DELETE_DEPARTMENT_USERS
} from "./constants"

import {
  Icon,
  Col,
  message,
  Checkbox,
  Row,
  Input,
  Form,
  Select,
  Tree,
  Button,
  Breadcrumb,
  Divider,
  Table,
  Popconfirm,
  Modal,
  Avatar,
  Typography,
  Tooltip
} from 'antd'


import AddDepartmentForm from "./addDepartmentForm" //添加组织
import AddUserForm from "./AddUserForm" //添加用户
import BatchImportUsers from "./BatchImportUsers" //批量导入用户
import { divide } from 'lodash';


const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;
const FormItem = Form.Item
const { Option } = Select;
const { TreeNode } = Tree;
const { Search } = Input;
const styles = require('./zhuhus.less')

const { Title } = Typography;


//生成数据
const generateData = (tree, key) => {
  if (tree.length) {
    for (let i = 0; i < tree.length; ++i) {
      tree[i].title = tree[i].name
      if (key) {
        tree[i].key = `${key}-${tree[i].id}`
      } else {
        tree[i].key = `${tree[i].id}`
      }
      tree[i].value = `${tree[i].id}`
      if (tree[i].childDeps) {
        tree[i].children = tree[i].childDeps
        generateData(tree[i].childDeps, tree[i].key)
      }
    }
  }
  return tree

};
// generateData(z);
// console.log(gData)

// 生成数组列表  并且修改key为id路径
const generateListWrapper = (data) => {
  const dataList = [];
  const generateList = data => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const { key, title } = node;
      dataList.push({ key, title });
      if (node.children) {
        generateList(node.children);
      }
    }
  };
  generateList(data)
  return dataList
}

// generateList(gData);
// console.log("dataList",dataList)

//获取父亲id
const getParentKey = (key, tree) => {
  let parentKey;
  // console.log("key",key)
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    // console.log("name",node.title)
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  // console.log("parentKey",parentKey)
  return parentKey;
};




export class UserManageClass extends React.PureComponent<any, any> {
  constructor(props) {
    super(props)
    this.state = {
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,

      addDepartmentVisable: false,
      editDepartment: {},//编辑的部门

      //选择用户
      checkedList: [],
      indeterminate: false,  //半选状态
      checkAll: false,

      //添加用户
      addUserVisable: false,
      editUserItem: {},//编辑的用户
      batchImportUsersVisible: false,

      //删除用户
      hideDeleteUser: true
    }
  }

  private selectDepartmentId = -1;  // -1表示没选，其他的表示选了

  private addDepartment;
  private addUser;
  private refHandles = {
    addDepartment: (ref) => this.addDepartment = ref,
    addUser: (ref) => this.addUser = ref,
  }

  componentDidMount = () => {
    this.getDepartments()

    //获取租户的人员
    // /api/v3/users/getUsers
    // {
    //   "tenantId": 2,
    //     "admin":false
    // }
    this.doSelectDepartmentUsers()

    //获取角色

    let orgFormdata = {
      orgId: this.props.loginUser.orgId
    }
    this.props.getRoles(orgFormdata, () => {

    })
  }

  getDepartments = () => {
    const { tenantId } = this.props.loginUser
    console.log(this.props)
    this.props.getDepartments({ id: tenantId }, () => {
      //修改树数据
      this.generateTree()
    })
  }

  generateTree = () => {

  }

  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      // autoExpandParent: false,
    });
  };

  onChange = e => {
    const { value } = e.target;
    let expandedKeys = this.props.departmentsList
      .map(item => {
        if (item.title.indexOf(value) > -1) {
          console.log("getParentKey", getParentKey(item.key, this.props.departments))
          return getParentKey(item.key, this.props.departments);
        }
        return null;
      })
      .filter((item, i, self) => {
        console.log(item, i, self)
        return item && self.indexOf(item) === i   //去重展开的父id
      });

    if (!value) {
      expandedKeys = []
    }
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  };

  //选择一个部门 请求该部门的人员
  SelectDepartment = (selectedKeys, e) => {
    console.log("selectedKeys", selectedKeys, e)
    if (selectedKeys.length) {
      const selectDepartmentIds = selectedKeys[0].split("-")
      const selectDepartmentId = selectDepartmentIds.pop()
      this.selectDepartmentId = selectDepartmentId
      console.log(selectDepartmentId)
      this.doSelectDepartmentUsers()
    }
  }

  doSelectDepartmentUsers = () => {

    //如果没有选择的部门id，就取所有的用户,否则取所有的用户
    if (this.selectDepartmentId == -1) {
      let formdata = {
        "tenantId": this.props.loginUser.tenantId,
        "admin": false
      }
      this.props.getUsers(formdata, () => {

      })
    } else {
      let formdata = { departmentId: this.selectDepartmentId }
      this.props.getDepartmentUsers(formdata)
      this.setState({
        checkedList: [],
        indeterminate: false,
        checkAll: false,
      });
    }
  }


  showAddDepartmentModal = () => {
    this.setState({
      addDepartmentVisable: true,
      editDepartment: {}
    });
  }

  hideAddDepartmentModal = () => {
    this.setState({
      addDepartmentVisable: false,
    });
  }

  doAddDepartment = () => {
    this.addDepartment.props.form.validateFields((err, values) => {
      if (!err) {
        let formdata = {
          ...values,
          createBy: this.props.loginUser.id,
          tenantId: this.props.loginUser.tenantId
        }

        if (!this.state.editDepartment.id) {
          //添加
          this.props.addDepartment(formdata, () => {
            this.getDepartments()
            this.hideAddDepartmentModal()
          })
        } else {
          //编辑
          formdata = { ...formdata, id: this.state.editDepartment.id }
          this.props.editDepartment(formdata, () => {
            this.getDepartments()
            this.hideAddDepartmentModal()
          })
        }

      }
    })
  }

  //编辑部门和新增部门一个modal
  editDepVisible = (item) => {
    this.setState({
      editDepartment: item,
      addDepartmentVisable: true
    })
  }


  //删除部门
  doDeleteDep = (item) => {
    console.log(item)
    const { onDeleteDepartment } = this.props
    Modal.confirm({
      title: '确定要删除吗？',
      content: '删除后，该部门无法恢复。',
      okText: '确认',
      cancelText: '取消',
      icon: <Icon type="info-circle" />,
      onOk: () => {
        onDeleteDepartment({ id: item.id }, () => {
          // onLoadSources(user.id)
          this.getDepartments()
        })
      }
    });
  }

  //生成编辑删除组织的下拉框
  genDropdown = (title, item) => {
    // console.log("title", title, item)
    return (
      <Dropdown
        overlay={
          (<Menu>
            <Menu.Item key="1" onClick={() => this.editDepVisible(item)}>编辑</Menu.Item>

            <Menu.Item key="2" onClick={() => this.doDeleteDep(item)}>
              删除
            </Menu.Item>


          </Menu>)
        }
        trigger={['contextMenu']}
      >
        {title}
      </Dropdown>
    )
  }

  //生成编辑用户的下拉框
  genEditUserDropdown = (item) => {
    // return 555
    return (
      <Dropdown
        overlay={
          (<Menu>
            <Menu.Item key="1" onClick={() => this.editUserVisible(item)}>编辑</Menu.Item>
          </Menu>)
        }
        trigger={['contextMenu']}
      >
        <span className={styles.ellipsis} style={{ width: 55, display: 'inline-block', verticalAlign: 'middle' }}>{item.username}
        </span>
      </Dropdown>
    )
  }

  onCheckChange = (checkedList) => {
    console.log('checked = ', checkedList);
    this.setState({
      checkedList,
      indeterminate: !!checkedList.length && checkedList.length < this.props.departmentUsers.length,
      checkAll: checkedList.length === this.props.departmentUsers.length,
      hideDeleteUser: !(checkedList.length > 0)
    });
  }

  onCheckAllChange = e => {
    this.setState({
      checkedList: e.target.checked ? this.props.departmentUsers.map((item) => item.id) : [],
      indeterminate: false,
      checkAll: e.target.checked,
      hideDeleteUser: !e.target.checked
    });
  };

  showAdduserVisible = () => {
    this.setState({
      addUserVisable: true,
      editUserItem: {}
    })
  }
  hideAdduserVisible = () => {
    this.setState({
      addUserVisable: false
    })
  }

  editUserVisible = (user) => {
    this.setState({
      addUserVisable: true,
      editUserItem: user
    })
  }


  doAddUser = () => {
    this.addUser.props.form.validateFields((err, values) => {
      if (!err) {
        // userType:3是租户创建的普通用户
        let formdata = {
          ...values,
          createBy: this.props.loginUser.id,
          admin: false,
          userType: 3,
          tenantId: this.props.loginUser.tenantId
        }
        if (!this.state.editUserItem.id) {
          this.props.addUser(formdata, () => {
            this.doSelectDepartmentUsers()
            this.cancelModal()
          })
        } else {
          formdata = {
            ...formdata, id: this.state.editUserItem.id,
            active: true
          }
          this.props.editUser(formdata, () => {
            // this.doSelectDepartmentUsers()
            this.cancelModal()
            this.doSelectDepartmentUsers()
          })
        }
      }
    })
  }

  checkSelectUsers = () => {
    if (!this.state.checkedList.length) {
      return message.info('请选择待删除的用户');
    }
  }

  //批量删除用户
  deleteUsers = () => {
    if (!this.state.checkedList.length) {
      return message.info('请选择待删除的用户');
    }
    console.log(this.state.checkedList)
    let formdata = this.state.checkedList
    this.props.deleteUsers(formdata, () => {
      //默认是所有部门的
      this.doSelectDepartmentUsers()
    })

  }

  showBatchImportUsersVisible = () => {
    // if(!this.selectDepartmentId){
    //   return message.info("请选择部门")
    // }
    this.setState({
      batchImportUsersVisible: true
    })
  }

  hideBatchImportUsersVisible = () => {
    this.setState({
      batchImportUsersVisible: false
    })
  }

  private cancelModal = () => {
    this.hideAdduserVisible()
    this.addUser.props.form.resetFields()
  }
  private renderUsers = (list) => {
    const useTag = `<use xlink:href="#icontouxiang" />`
    const svgName = classnames({
      'iconSvg': true,
      [utilStyles.icon]: true
    })
    return (
      <div className={utilStyles.cardWrapper}>
        {list.map((item) =>
          <div key={item.id} className={utilStyles.cardList}>
            <p className={utilStyles.title}>
              <span>{item.name}</span>
              <Checkbox value={item.id} className={utilStyles.checkbox} />
            </p>
            <p className={utilStyles.name}>{item.username}</p>
            <div className={utilStyles.bottom}>
              <svg className={svgName} aria-hidden="true" dangerouslySetInnerHTML={{ __html: useTag }} onClick={() => this.editUserVisible(item)}>
              </svg>
            </div>
          </div>
        )
        }
      </div>
    )
  }
  private batchImportUsers;
  private closeBatchModal = () => {
    this.hideBatchImportUsersVisible()
    this.batchImportUsers.closeModal()
  }
  public render() {
    const { getFieldDecorator, value } = this.props.form
    const { searchValue, expandedKeys, autoExpandParent } = this.state;
    const loop = data => {
      data = data.filter((item) => {
        return item.parentId != -1
      })
      //只要找到的node以及node的父级的key
      let filterNodeKeys = {}
      this.props.departmentsList
        .map(item => {
          if (item.title.indexOf(value) > -1) {
            return getParentKey(item.key, this.props.departments);
          }
          return null;
        })
        .filter((item, i, self) => {
          return item && self.indexOf(item) === i   //去重展开的父id
        });


      return data.map(item => {
        const index = item.title.indexOf(searchValue);
        const beforeStr = item.title.substr(0, index);
        const afterStr = item.title.substr(index + searchValue.length);
        let title =
          index > -1 ? (
            <span>
              {beforeStr}
              <span style={{ color: '#f50' }}>{searchValue}</span>
              {afterStr}
            </span>
          ) : (
              <span>{item.title}</span>
            );
        title = this.genDropdown(title, item)
        // console.log(title)
        if (item.children) {
          return (
            <TreeNode key={item.key} title={title}>
              {loop(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode key={item.key} title={title} />;
      });
    }
    return (
      <div className="userManage">

        <div className={utilStyles.header}>
          用户组织管理
      </div>
        <div className={utilStyles.content}>
          <Layout style={{ backgroundColor: '#fff' }} className={utilStyles.layout}>
            <Sider width={200} className={utilStyles.sider} theme="light">
              <div className={utilStyles.departmentHeader}>
                <span >部门列表</span>
                <i className="iconfont" onClick={this.showAddDepartmentModal}>&#xe7c1;</i>
              </div>


              <Search style={{ marginBottom: 8 }} placeholder="搜索" onChange={this.onChange} />
              <Tree
                onExpand={this.onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onSelect={this.SelectDepartment}
              >
                {loop(this.props.departments)}
              </Tree>


            </Sider>
            <Content className={utilStyles.right}>
              <div className={utilStyles.headerButton}>
                <Button type="primary" onClick={this.showAdduserVisible} size="small">创建用户</Button>
                <Button onClick={this.showBatchImportUsersVisible} size="small">批量导入</Button>
                <Popconfirm
                  title="确认批量删除用户吗?"
                  onConfirm={this.deleteUsers}
                  okText="确认"
                  cancelText="取消"
                  disabled={this.state.hideDeleteUser}
                >
                  <Button onClick={this.checkSelectUsers} size="small">批量删除</Button>
                </Popconfirm>
                <Checkbox
                  indeterminate={this.state.indeterminate}
                  onChange={this.onCheckAllChange}
                  checked={this.state.checkAll}
                >
                  全选
                </Checkbox>

              </div>

              <Checkbox.Group
                style={{ width: '100%' }}
                onChange={this.onCheckChange}
                value={this.state.checkedList}
              >
                {this.renderUsers(this.props.departmentUsers)}

              </Checkbox.Group>
            </Content>
          </Layout>



        </div>





        {/* <Divider className={styles.antDividerHorizontal}></Divider> */}
        {/* <Layout style={{ padding: '24px 0', background: '#fff', maxHeight: '90%' }}> */}

        {/* </Layout> */}
        <Modal
          title={this.state.editDepartment.id ? "编辑部门" : "添加部门"}

          visible={this.state.addDepartmentVisable}
          onCancel={() => this.hideAddDepartmentModal()}
          onOk={this.doAddDepartment}
          width={640}
          maskClosable={false}
        >
          <AddDepartmentForm
            wrappedComponentRef={this.refHandles.addDepartment}
            departments={this.props.departments}
            departmentsList={this.props.departmentsList}
            editDepartment={this.state.editDepartment}
          />
        </Modal>





        <Modal
          title={this.state.editUserItem.id ? "编辑用户" : "创建用户"}
          visible={this.state.addUserVisable}
          onCancel={this.cancelModal}
          onOk={this.doAddUser}
          // width={'80%'}
          maskClosable={false}
          width={640}
        >
          <AddUserForm
            wrappedComponentRef={this.refHandles.addUser}
            departments={this.props.departments}
            editUserItem={this.state.editUserItem}
            roles={this.props.roles}
          />
        </Modal>



        <Modal
          title={"批量导入"}
          visible={this.state.batchImportUsersVisible}
          onCancel={this.closeBatchModal}
          onOk={this.doAddUser}
          footer={[
            <div>
              <Button onClick={this.closeBatchModal}>
                取消
            </Button>
            </div>

          ]}
          maskClosable={false}
          width={400}
        >
          <BatchImportUsers
            doSelectDepartmentUsers={this.doSelectDepartmentUsers}
            hideBatchImportUsersVisible={this.hideBatchImportUsersVisible}
            loginUser={this.props.loginUser}
            ref={(f) => this.batchImportUsers = f}
            onCancel={this.hideBatchImportUsersVisible}
          />
        </Modal>

      </div>
    )
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    getDepartments: (formdata) => dispatch({
      type: GET_DEPARTMENTS,
      payload: {
        formdata
      }
    }),
    addDepartment: (formdata, resolve) => dispatch({
      type: ADD_DEPARTMENT,
      payload: {
        formdata,
        resolve
      }
    }),
    editDepartment: (formdata, resolve) => dispatch({
      type: EDIT_DEPARTMENT,
      payload: {
        formdata,
        resolve
      }
    }),
    onDeleteDepartment: (formdata, resolve) => dispatch({
      type: DELETE_DEPARTMENT,
      payload: {
        formdata,
        resolve
      }
    }),
    getDepartmentUsers: (formdata, resolve) => dispatch({
      type: GET_DEPARTMENT_USERS,
      payload: {
        formdata,
        resolve
      }
    }),
    //获取租户的所有用户
    getUsers: (formdata, resolve) => dispatch({
      type: GET_ALL_USER,
      payload: {
        formdata,
        resolve
      }
    }),
    //获取所有角色
    getRoles: (formdata, resolve) => dispatch({
      type: GET_ROLES,
      payload: {
        formdata,
        resolve
      }
    }),
    addUser: (formdata, resolve) => dispatch({
      type: ADD_DEPARTMENT_USER,
      payload: {
        formdata,
        resolve
      }
    }),
    editUser: (formdata, resolve) => dispatch({
      type: EDIT_DEPARTMENT_USER,
      payload: {
        formdata,
        resolve
      }
    }),
    deleteUsers: (formdata, resolve) => dispatch({
      type: DELETE_DEPARTMENT_USERS,
      payload: {
        formdata,
        resolve
      }
    }),
  }
}

const mapStateToProps = createStructuredSelector({
  loginUser: makeSelectLoginUser(),
  departments: (state) => generateData(state.userManager.departments, ""), //带children的
  departmentsList: (state) => generateListWrapper(state.userManager.departments),  //不带children  平级的
  departmentUsers: (state) => state.userManager.departmentUsers,
  roles: (state) => state.userManager.roles,
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducerZhuhu = injectReducer({ key: 'userManager', reducer })
const withSagaZhuhu = injectSaga({ key: 'userManager', saga })

export const UserManage = compose(
  withReducerZhuhu,
  withSagaZhuhu,
  withConnect
)(Form.create()(UserManageClass))
