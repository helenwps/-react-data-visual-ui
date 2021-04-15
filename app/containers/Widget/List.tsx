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

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { RouteComponentWithParams } from 'utils/types'

import { makeSelectWidgets, makeSelectLoading, makeSelectWidgetsList } from './selectors'
import { makeSelectCurrentProject } from 'containers/Projects/selectors'
import { checkNameUniqueAction } from 'containers/App/actions'
import { WidgetActions } from './actions'
import Helmet from 'react-helmet'
import { Link } from 'react-router-dom'
import {
  Row,
  Col,
  Breadcrumb,
  Icon,
  Button,
  Table,
  Tooltip,
  Popconfirm,
  Card,
  Menu,
  Dropdown,
  Pagination,
  Modal
} from 'antd'
import { ButtonProps } from 'antd/lib/button'
import { ColumnProps, SorterResult } from 'antd/lib/table'
import Container, { ContainerTitle, ContainerBody } from 'components/Container'
import Box from 'components/Box'
import SearchFilterDropdown from 'app/components/SearchFilterDropdown'
import CopyModal from './components/CopyModal'

import utilStyles from 'assets/less/util.less'
import styles from './Widget.less'
import classnames from 'classnames'
import { useTablePagination } from 'utils/hooks'
import ModulePermission from 'containers/Account/components/checkModulePermission'
import { initializePermission } from 'containers/Account/components/checkUtilPermission'
import { IWidgetBase } from './types'
import appReducer from 'app/containers/App/reducer'
import appSaga from 'app/containers/App/sagas'
import useTooltip from 'app/components/Tooltip.tsx'
import injectReducer, { useInjectReducer } from 'utils/injectReducer'
import injectSaga, { useInjectSaga } from 'utils/injectSaga'
import {
  makeSelectLoginUser,
} from 'containers/App/selectors'
import { withRouter } from "react-router-dom";
import { image } from 'html2canvas/dist/types/css/types/image'
const mapStateToProps = createStructuredSelector({
  widgets: makeSelectWidgetsList(),
  loading: makeSelectLoading(),
  currentProject: makeSelectCurrentProject(),
  loginUser: makeSelectLoginUser()
})

export const columns: Array<ColumnProps<IWidgetBase>> = [
  {
    title: '图表组件名称',
    dataIndex: 'name',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    sorter: (a, b) => (a.createTime > b.createTime ? 1 : -1)
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    sorter: (a, b) => (a.updateTime > b.updateTime ? 1 : -1)
  },
  {
    title: '描述',
    dataIndex: 'description'
  }
]
const AddButton = (props) => {
  return (
    <Button {...props} className={styles.createButton}>
      <i className="iconfont" style={{marginRight: '6px'}}>&#xe712;</i>
      新建图表组件
    </Button>
  )
}
const DeleteButton = (props) => {
  return (
    <Button {...props}>删除</Button>
  )
}
export const useChangeView = (props) => {
  const [currentButton, setChange] = useState(1)
  const classNames = (type) => classnames({
    [styles.selected]: currentButton == type,
    [styles.headerButton]: true
  })
  const changeView = (type) => () => {
    setChange(type)
    props(type)
  }
  return (
    [<div className={styles.changeView}>
      <button className={classNames(1)} onClick={changeView(1)}>
        <i className="iconfont">&#xe71c;</i>
      </button>
      <button className={classNames(2)} onClick={changeView(2)}>
        <i className="iconfont">&#xe71e;</i>
      </button>
    </div>, setChange]
  )
}

export class TextOverflow extends React.Component<any, any> {
  constructor (props) {
    super(props)
    this.state = {
      showTooltip: false
    }
  }
  private contentRef

  public componentDidMount () {
    const ele = this.contentRef
    this.setState({
      showTooltip: ele.offsetWidth < ele.scrollWidth
    })
  }
  render () {
    const {showTooltip} = this.state
    const {text} = this.props
    return (
      <div ref={(f) => this.contentRef = f} style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
        {showTooltip &&
        <Tooltip placement="top" title={text}>
          <span>{text}</span>
        </Tooltip> ||
        <span>{text}</span>
        }
      </div>
    )
  }

}
const CardList = (props) => {
  const { filterWidgets: list, openCopyModal, toWorkbench, onDeleteWidget, icon } = props
  const confirmDelete = (id) => {
    Modal.confirm({
      title: '确定要删除吗？',
      content: '删除后，该数据无法恢复。',
      okText: '确认',
      cancelText: '取消',
      icon: <Icon type="info-circle" />,
      onOk:  ()=> {
        console.log(id)
        onDeleteWidget(id)()
      }
    });
  }
  const menu = (record) => (
    <Menu>
      <Menu.Item key="1" onClick={openCopyModal(record)}>复制</Menu.Item>
      <Menu.Item key="2" onClick={toWorkbench(record.id)}>修改</Menu.Item>
      <Menu.Item key="4" onClick={() => confirmDelete(record.id)}>删除</Menu.Item>
    </Menu>
  )
  return (
    <div>
      <div className={styles['flex-wrapper']}>
        {list.map(x => {
          const { name, description, createTime, updateTime } = x
          return (
            <Card className={styles['content-card']} key={x.id} data-v-widget>
              <p className={styles['inner-img']}>
                {
                  icon  || <img src={require('assets/images/folder.png')} />
                }
              </p>
              <div className={styles['inner-name']}>
                <TextOverflow text={name} />
              </div>
              <p className={styles.description}>{description}</p>
              <p className={styles['inner-time']}>
                <Tooltip title={createTime}>
                  创建时间
           </Tooltip>
                {updateTime && <Tooltip title={updateTime}> | 更新时间</Tooltip>}
              </p>
              <p className={styles['inner-footer']}>
                <Dropdown
                  overlay={menu(x)}
                  trigger={['click']}
                  overlayClassName='inner-dropdown'
                  placement="bottomRight"
                >
                  <i className="iconfont" style={{ cursor: 'pointer' }}>&#xe6e8;</i>
                </Dropdown>
              </p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
export const usePagination = (props) => {
  const pageSizeOptions = ['10', '20', '30', '40']
  const {total, changePage, current} = props
  const pageOption = {
    total,
    showTotal (total) {
      return `共${total}条`
    },
    current,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions,
    onChange (page, pageSize) {
      changePage(page,pageSize)
    },
    onShowSizeChange (current, size) {
      changePage(1, size)
    }
  }
  return (
    <div style={{textAlign: 'right'}}>
      <Pagination {...pageOption} />
    </div>
  )
}
const WidgetList: React.FC<RouteComponentWithParams> = (props) => {
  const dispatch = useDispatch()
  const [switchChange, setSwitch] = useState(1)
  const [changeButton, setChangeButton] = useChangeView(setSwitch)
  const { match, history } = props
  const [pageOption, setPage] = useState({page: 1, pageSize: 10})
  useEffect(() => {
    const projectId = +match.params.projectId
    // const {tenantId, id} = loginUser
    if (projectId) {
      dispatch(WidgetActions.loadWidgetsList(projectId, 1, 10))
    }
  }, [])
  // useInjectReducer({ key: 'global', reducer: appReducer })
  // useInjectSaga({ key: 'global', saga: appSaga })
  const { widgets, loading, currentProject, loginUser } = useSelector(mapStateToProps)
  const onCheckName = useCallback(
    (widgetName: string, resolve: () => void, reject: (err: string) => void) =>
      dispatch(
        checkNameUniqueAction(
          'widget',
          { name: widgetName, projectId: currentProject.id },
          resolve,
          reject
        )
      ),
    [currentProject]
  )

  const openCopyModal = useCallback(
    (widget: IWidgetBase) => () => {
      setCopyFromWidget(widget)
      setCopyModalVisible(true)
    },
    []
  )
  const copyWidget = useCallback((widget: IWidgetBase) => {
    const {page, pageSize} = pageOption
    dispatch(
      WidgetActions.copyWidget(widget, () => {
        setCopyModalVisible(false)
        dispatch(WidgetActions.loadWidgetsList(+match.params.projectId, page, pageSize))
      })
    )
  }, [])
  const cancelCopy = useCallback(() => {
    setCopyModalVisible(false)
  }, [])
  const toWorkbench = useCallback(
    (widgetId?: number) => () => {
      sessionStorage.removeItem('editWidgetFromDashboard')
      const workbenchUrl = `/project/${match.params.projectId}/widget`
      const url = `/project/${match.params.projectId}/choose`
      history.push(widgetId ? `${workbenchUrl}/${widgetId}` : url)
    },
    []
  )

  const onDeleteWidget = useCallback(
    (widgetId: number) => () => {
      const {page, pageSize} = pageOption
      dispatch(WidgetActions.deleteWidget(widgetId, () => dispatch(WidgetActions.loadWidgetsList(+match.params.projectId, page, pageSize))))
    },
    []
  )

  const [tempFilterWidgetName, setTempFilterWidgetName] = useState('')
  const [filterWidgetName, setFilterWidgetName] = useState('')
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false)
  const [tableSorter, setTableSorter] = useState<SorterResult<IWidgetBase>>(
    null
  )
  const [copyModalVisible, setCopyModalVisible] = useState(false)
  const [copyFromWidget, setCopyFromWidget] = useState<IWidgetBase>(null)
  const filterWidgets = useMemo(() => {
    if (!widgets || (widgets && !Array.isArray(widgets.list)) || !widgets.list.length) {
      return []
    }
    const regex = new RegExp(filterWidgetName, 'gi')
    const filterWidgets = widgets.list.filter(
      (v) => v.name.match(regex) || v.description.match(regex)
    )
    return filterWidgets
  }, [filterWidgetName, widgets])
  const cardList = CardList({ filterWidgets, openCopyModal, toWorkbench, onDeleteWidget,
    icon: <img src={require('app/assets/images/ic_tubiao.svg')} />
   })
  const tablePagination = useTablePagination(0, { showQuickJumper: true, showTotal: (total) => `共${total}条` })
  const changePage = (page, pageSize) =>  {
    setPage({page, pageSize})
    dispatch(WidgetActions.loadWidgetsList(+match.params.projectId, page, pageSize))
  }
  const pagination = useMemo(() => {
    if (!widgets) return null
    return usePagination({
    total: widgets.total,
    changePage
  })}, [widgets])
  const { widgetPermission, AdminButton, EditButton, CreateButton } = useMemo(
    () => ({
      widgetPermission: initializePermission(
        currentProject,
        'widgetPermission'
      ),
      AdminButton: ModulePermission<ButtonProps>(
        currentProject,
        'widget',
        true
      )(Button),
      CreateButton: ModulePermission<ButtonProps>(
        currentProject,
        'widget',
      )(AddButton),
      EditButton: ModulePermission<ButtonProps>(
        currentProject,
        'widget',
        false
      )(Button),
      DeleteButton: ModulePermission<ButtonProps>(
        currentProject,
        'widget',
        false
      )(DeleteButton)
    }),
    [currentProject]
  )
  const filterWidgetNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTempFilterWidgetName(e.target.value)
      setFilterWidgetName('')
    },
    []
  )
  const searchWidget = useCallback((value: string) => {
    setFilterWidgetName(value)
    setFilterDropdownVisible(false)
  }, [])

  const tableColumns = [...columns]
  // tableColumns[0].filterDropdown = (
  //   <SearchFilterDropdown
  //     placeholder="名称"
  //     value={tempFilterWidgetName}
  //     onChange={filterWidgetNameChange}
  //     onSearch={searchWidget}
  //   />
  // )
  // tableColumns[0].filterDropdownVisible = filterDropdownVisible
  // tableColumns[0].onFilterDropdownVisibleChange = useCallback(
  //   (visible: boolean) => setFilterDropdownVisible(visible),
  //   []
  // )
  // tableColumns[0].sortOrder =
  //   tableSorter && tableSorter.columnKey === 'name' ? tableSorter.order : void 0
  // if (filterWidgetName) {
  //   const regex = new RegExp(`(${filterWidgetName})`, 'gi')
  //   tableColumns[0].render = (text: string) => (
  //     <span
  //       dangerouslySetInnerHTML={{
  //         __html: text.replace(
  //           regex,
  //           `<span class="${utilStyles.highlight}">$1</span>`
  //         )
  //       }}
  //     />
  //   )
  // }
  if (widgetPermission) {
    tableColumns.push({
      title: '操作',
      key: 'action',
      align: 'center',
      width: 200,
      render: (_, record) => (
        <span className="ant-table-action-column">
          <EditButton
            type="link"
            shape="circle"
            onClick={openCopyModal(record)}
          >复制</EditButton>
          <EditButton
            type="link"
            shape="circle"
            onClick={toWorkbench(record.id)}
          >修改</EditButton>
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={onDeleteWidget(record.id)}
          >
            <AdminButton shape="circle" type="link">删除</AdminButton>
          </Popconfirm>
        </span>
      )
    })
  }

  const tableChange = useCallback(
    (_1, _2, sorter: SorterResult<IWidgetBase>) => {
      setTableSorter(sorter)
    },
    []
  )

  return (
    <div className={styles.widgetList}>
      {/* <Container> */}
      {/* <Helmet title="Widget" /> */}
      {/* <ContainerTitle>
          <Row>
            <Col xl={18} lg={16} md={12} sm={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="">Widget</Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </ContainerTitle> */}
      {/* <ContainerBody> */}
      {/* <Box> */}
      <div className={styles.header}>
        <div>
          <CreateButton
            type="primary"
            onClick={toWorkbench()}
          />
        </div>
        {changeButton}
      </div>
      <p className={styles.subtitle}>你可以将数据转换为可视化图表，展现数据价值</p>
      {/* <Box.Body> */}
      <Row style={{marginBottom: '20px'}}>
        <Col span={24} >
          {switchChange == 1 && cardList || <Table
            rowKey="id"
            dataSource={filterWidgets}
            columns={tableColumns}
            pagination={false}
            loading={loading}
            onChange={tableChange}
          />
          }
        </Col>
      </Row>
      { widgets && pagination}
      {/* </Box.Body> */}
      {/* </Box> */}
      {/* </ContainerBody> */}
      {/* </Container> */}
      <CopyModal
        visible={copyModalVisible}
        loading={false}
        fromWidget={copyFromWidget}
        onCheckUniqueName={onCheckName}
        onCopy={copyWidget}
        onCancel={cancelCopy}
      />
    </div>
  )
}

export default withRouter(WidgetList)
