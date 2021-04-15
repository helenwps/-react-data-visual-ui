import React from 'react'
import classnames from 'classnames'
import { createStructuredSelector } from 'reselect'
import { makeSelectProjectRoles } from 'containers/Projects/selectors'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Col, Tooltip, Icon, Popconfirm, Row, Button, Table, Modal, Menu, Card, Dropdown } from 'antd'
import { IconProps } from 'antd/lib/icon'
// const styles = require('../Viz.less')

import DisplayFormModal from './DisplayFormModal'
import ModulePermission from 'containers/Account/components/checkModulePermission'
import { IProject } from 'containers/Projects/types'
import { IExludeRoles } from 'containers/Viz/components/PortalList'
import { IProjectRoles } from 'containers/Organizations/component/ProjectRole'
import { Display, DisplayFormType } from './types'
import { TextOverflow, ChangeView, usePagination } from 'app/components/hook/usePublic.tsx'
import styles from 'app/containers/Widget/Widget.less'

export interface IDisplayEvent {
  onDisplayClick: (displayId: number) => () => void
  onAdd: (display: Display, resolve: () => void) => void
  onEdit: (display: Display, resolve: () => void) => void
  onCopy: (display: Display, resolve: () => void) => void
  onDelete: (displayId: number, resolve: () => void) => void
}

interface IDisplayListProps extends IDisplayEvent {
  projectId: number
  displays: Display[],
  currentProject?: IProject
  projectRoles: IProjectRoles[]
  onCheckName: (type, data, resolve, reject) => void
  onExcludeRoles: (type: string, id: number, resolve?: any) => any
  onLoadDisplays: (projectId: number, page: number, pageSize: number) => void
}

interface IDisplayListStates {
  editingDisplay: Display
  modalLoading: boolean
  formType: DisplayFormType
  formVisible: boolean
  exludeRoles: IExludeRoles[]
  currentView: number
  pageOption: {page: number, pageSize: number}
}
const CardList = (props) => {
  const { filterWidgets: list,
    openCopyModal,
    toWorkbench,
    onDeleteWidget,
    onLoadDisplays,
    icon,
    onCreate } = props
  const confirmDelete = (id) => {
    Modal.confirm({
      title: '确定要删除吗？',
      content: '删除后，该数据无法恢复。',
      okText: '确认',
      cancelText: '取消',
      icon: <Icon type="info-circle" />,
      onOk: ()=> {
        onDeleteWidget(id, onLoadDisplays)
      }
    });
  }
  const menu = (record) => (
    <Menu>
      <Menu.Item key="1" onClick={openCopyModal(record)}>复制</Menu.Item>
      <Menu.Item key="2" onClick={toWorkbench(record.id)}>修改名称</Menu.Item>
      <Menu.Item key="3" onClick={onCreate(record.id)}>修改大屏</Menu.Item>
      <Menu.Item key="4" onClick={() => confirmDelete(record.id)}>删除</Menu.Item>
    </Menu>
  )
  const src = icon || 'assets/images/folder.png'
  return (
    <div>
      <div className={styles['flex-wrapper']}>
        {list.map(x => {
          const { name, description, createTime, updateTime } = x
          return (
            <Card className={styles['content-card']} key={x.id} data-v-widget>
              <p className={styles['inner-img']}><img src={require('app/assets/images/ic_shujudapin.svg')} /></p>
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
const columns = [
  {
    title: '数据大屏名称',
    dataIndex: 'name',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    sorter: (a, b) => (a.createTime > b.createTime ? 1 : -1)
  },
  {
    title: '描述',
    dataIndex: 'description'
  }
]
export class DisplayList extends React.PureComponent<IDisplayListProps, IDisplayListStates> {

  constructor(props: IDisplayListProps) {
    super(props)
    this.state = {
      editingDisplay: null,
      modalLoading: false,
      formType: 'add',
      formVisible: false,
      exludeRoles: [],
      currentView: 1,
      pageOption: {page: 1, pageSize: 10}
    }
  }

  private stopPPG = (e) => {
    e.stopPropagation()
  }

  public componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.projectRoles) {
      this.setState({
        exludeRoles: nextProps.projectRoles.map((role) => {
          return {
            ...role,
            permission: false
          }
        })
      })
    }
  }


  private saveDisplay = (display: Display, type: DisplayFormType, resolve) => {
    this.setState({ modalLoading: true })
    const { onAdd, onEdit, onCopy, onLoadDisplays, projectId } = this.props
    const {pageOption: {page, pageSize}} = this.state
    const val = {
      ...display,
      roleIds: this.state.exludeRoles.filter((role) => !role.permission).map((p) => p.id)
    }
    if (typeof display.config === 'string' && display.config) {
      val.config = JSON.parse(display.config)
    }
    const fn = () => {
      this.hideDisplayFormModal()
      onLoadDisplays(projectId, page, pageSize)
    }
    switch (type) {
      case 'add':
        onAdd({
          ...val
        }, fn)
        break
      case 'edit':
        onEdit({
          ...val
        }, fn)
        break
      case 'copy':
        onCopy({
          ...val
        }, fn)
        break
    }
    resolve && resolve()
  }

  private cancel = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    })
  }

  private showDisplayFormModal = (formType: DisplayFormType) => (display?: any) => (e: React.MouseEvent<HTMLDivElement>) => {

    // const display = this.props.displays.find(x => x.id == displayId)
    this.setState({
      editingDisplay: formType === 'copy'
        ? {
          ...display,
          name: `${display.name}_copy`
        }
        : this.props.displays.find(x => x.id == display),
      formType,
      formVisible: true
    })
    const { onExcludeRoles, projectRoles } = this.props
    if (onExcludeRoles && display) {
      onExcludeRoles('display', display.id || display, (result: number[]) => {
        this.setState({
          exludeRoles: projectRoles.map((role) => {
            return result.some((re) => re === role.id) ? role : { ...role, permission: true }
          })
        })
      })
    } else {
      this.setState({
        exludeRoles: this.state.exludeRoles.map((role) => {
          return {
            ...role,
            permission: true
          }
        })
      })
    }
  }

  private hideDisplayFormModal = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    })
  }

  private delegate = (func: (...args) => void, ...args) => (e: React.MouseEvent<any>) => {
    func.apply(this, args)
    e.stopPropagation()
  }

  private changePermission = (scope: IExludeRoles, event) => {
    scope.permission = event.target.checked
    this.setState({
      exludeRoles: this.state.exludeRoles.map((role) => role && role.id === scope.id ? scope : role)
    })
  }

  private renderCreate() {
    return (
      <Col
        xxl={4}
        xl={6}
        lg={8}
        md={12}
        sm={24}
        key="createDisplay"
      >
        <div className={styles.display}>
          <div className={styles.container} onClick={this.showDisplayFormModal('add')()}>
            <div className={styles.central}>
              <div className={`${styles.item} ${styles.icon}`}><Icon type="plus-circle-o" /></div>
              <div className={`${styles.item} ${styles.text}`}>创建新 Display</div>
            </div>
          </div>
        </div>
      </Col>
    )
  }
  private changeView(type) {

    this.setState({ currentView: type })
  }
  // private renderDisplay(display: Display) {
  //   const coverStyle: React.CSSProperties = {
  //     backgroundImage: `url(${display.avatar})`
  //   }
  //   const { onDisplayClick, onDelete, currentProject } = this.props

  //   const editHint = !display.publish && '(编辑中…)'
  //   const displayClass = classnames({
  //     [styles.display]: true,
  //     [styles.editing]: !display.publish
  //   })

  //   const EditIcon = ModulePermission<IconProps>(currentProject, 'viz', false)(Icon)
  //   const AdminIcon = ModulePermission<IconProps>(currentProject, 'viz', true)(Icon)

  //   return (
  //     <Col
  //       xxl={4}
  //       xl={6}
  //       lg={8}
  //       md={12}
  //       sm={24}
  //       key={display.id}
  //       onClick={onDisplayClick(display.id)}
  //     >
  //       <div className={displayClass} style={coverStyle}>
  //         <div className={styles.container}>
  //           <header>
  //             <h3 className={styles.title}>{display.name} {editHint}</h3>
  //             <p className={styles.content}>{display.description}</p>
  //           </header>
  //           <div className={styles.displayActions}>
  //             <Tooltip title="编辑">
  //               <EditIcon className={styles.edit} type="setting" onClick={this.showDisplayFormModal('edit')(display)} />
  //             </Tooltip>
  //             <Tooltip title="复制">
  //               <AdminIcon className={styles.copy} type="copy" onClick={this.showDisplayFormModal('copy', display)} />
  //             </Tooltip>
  //             <Popconfirm
  //               title="确定删除？"
  //               placement="bottom"
  //               onConfirm={() => onDelete(display.id, onLoadDisplays)}
  //             >
  //               <Tooltip title="删除">
  //                 <AdminIcon className={styles.delete} type="delete" onClick={this.stopPPG} />
  //               </Tooltip>
  //             </Popconfirm>
  //           </div>
  //         </div>
  //       </div>
  //     </Col>
  //   )
  // }
  private deleteDisplay (id) {
    const {onLoadDisplays, onDelete, projectId} = this.props
    const {pageOption: {page, pageSize} } = this.state
    onDelete(id, () => onLoadDisplays(projectId, page, pageSize))
  }
  public render() {
    const { displays, projectId, currentProject, onCheckName, onLoadDisplays, onDelete } = this.props
    if (!Array.isArray(displays)) { return null }
    const pagination = displays.length && usePagination({total: displays.length, changePage: (page, pageSize) => {
      this.setState({pageOption: {page, pageSize}})
      onLoadDisplays(projectId, page, pageSize)
    }}) || ''
    const { editingDisplay, formType, formVisible, modalLoading, currentView, pageOption: {page, pageSize} } = this.state
    const {AdminButton, EditButton, DeleteButton} = {
      AdminButton: ModulePermission<IconProps>(currentProject, 'viz', true)(Button),
      EditButton: ModulePermission<IconProps>(currentProject, 'viz', false)(Button),
      DeleteButton: ModulePermission<IconProps>(currentProject, 'viz', true)(Button)
    }
    const tableColumns:any = [...columns]
    let addAction, cardList, vizPermission
    if (currentProject && currentProject.permission) {
      vizPermission = currentProject.permission.vizPermission
      cardList = CardList({
        filterWidgets: displays,
        toWorkbench: this.showDisplayFormModal('edit'),
        openCopyModal: this.showDisplayFormModal('copy'),
        onLoadDisplays: () => onLoadDisplays(projectId, page, pageSize),
        onDeleteWidget: this.props.onDelete,
        onCreate: this.props.onDisplayClick,
        icon: 'app/assets/images/ic_shujudapin.svg'
      })
      tableColumns.push({
        title: '操作',
        key: 'action',
        align: 'center',
        width: 200,
        render: (_, record) => (
          <span className="ant-table-action-column">
            <EditButton
              type="link"
              onClick={this.showDisplayFormModal('copy')(record)}
            >复制</EditButton>
            <EditButton
              type="link"
              onClick={this.showDisplayFormModal('edit')(record.id)}
            >修改</EditButton>
            <Popconfirm
              title="确定删除？"
              placement="bottom"
              onConfirm={() => this.deleteDisplay(record.id)}
            >
              <AdminButton type="link">删除</AdminButton>
            </Popconfirm>
          </span>
        )
      })
      // addAction = vizPermission === 3
      //   ? [this.renderCreate(), ...displays.map((d) => this.renderDisplay(d))]
      //   : [...displays.map((d) => this.renderDisplay(d))]
    }
    return (
      <div className={styles.widgetList}>
        <div className={styles.header}>
          <div>
            {vizPermission === 3 &&
              <Button type="primary" onClick={this.showDisplayFormModal('add')()} className={styles.createButton}>
                <i className="iconfont" style={{ marginRight: '6px' }}>&#xe712;</i>
              新建数据大屏
            </Button> || ''}
          </div>
          <ChangeView onChange={this.changeView.bind(this)} />
        </div>
        <p className={styles.subtitle}>你可以观看数据大屏，但无法进行筛选、联动</p>
        {currentView == 1 && cardList || <Table
            rowKey="id"
            dataSource={displays}
            columns={tableColumns}
            pagination={false}
            // loading={loading}
            // onChange={tableChange}
          />}
        {/* {addAction} */}
        <div style={{marginTop: '20px'}}>
          {pagination}
        </div>
        <DisplayFormModal
          projectId={projectId}
          display={editingDisplay}
          visible={formVisible}
          loading={modalLoading}
          exludeRoles={this.state.exludeRoles}
          onChangePermission={this.changePermission}
          type={formType}
          onCheckName={onCheckName}
          onSave={this.saveDisplay}
          onCancel={this.cancel}
        />
      </div>
    )
  }
}


const mapStateToProps = createStructuredSelector({
  projectRoles: makeSelectProjectRoles()
})

const withConnect = connect(mapStateToProps, null)


export default compose(
  withConnect
)(DisplayList)
