// 仪表盘新增编辑复制弹框
import React from 'react'
import AntdFormType from 'antd/lib/form/Form'
import { IProjectRoles } from 'containers/Organizations/component/ProjectRole'
import { IProject } from 'containers/Projects/types'
import { IExludeRoles, PortalList } from 'containers/Viz/components/PortalList'
import { Button, Modal, Row } from 'antd'
import PortalForm from 'containers/Viz/components/PortalForm'
import { createStructuredSelector } from 'reselect'
import { makeSelectProjectRoles } from 'containers/Projects/selectors'
import { connect } from 'react-redux'
import { compose } from 'redux'

interface DashboardOperateModelProps {
  projectId: number
  portals: any
  projectRoles: IProjectRoles[]
  currentProject: IProject
  childRef: any
  onPortalClick: (portalId: number, dashboardId: number) => () => void
  onAdd: (portal, resolve) => void
  onEdit: (portal, resolve) => void
  onCopy: (portal, resolve) => void
  onDelete: (portalId: number) => void
  refreshList: () => void
  onExcludeRoles: (type: string, id: number, resolve?: any) => any
  onCheckUniqueName: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
}

enum OperateType {
  'add' = 'add', 'edit' ='edit', 'copy' = 'copy'
}

const operateTypeMap = {
  add: '新建仪表盘',
  edit: '编辑仪表盘',
  copy: '复制仪表盘'
}

interface DashboardOperateModelState {
  modalLoading: boolean
  formType: 'edit' | 'add' | 'copy'
  formVisible: boolean
  exludeRoles: IExludeRoles[]
}
class DashboardOperateModel extends React.Component<DashboardOperateModelProps, DashboardOperateModelState> {
  constructor(props) {
    super(props)
    this.state = {
      modalLoading: false,
      formType: 'add',
      formVisible: false,
      exludeRoles: []
    }
  }
  private portalForm: AntdFormType
  private refHandlers = {
    portalForm: (ref) => this.portalForm = ref
  }
  public showPortalForm = (formType: OperateType, portal?: any)  => {
    console.log(formType, 'formType')
    this.setState({
      formType,
      formVisible: true
    }, () => {
      setTimeout(() => {
        if (portal) {
          this.portalForm.props.form.setFieldsValue(portal)
        }
      }, 0)
      const { onExcludeRoles, projectRoles } = this.props
      if (onExcludeRoles && portal) {
        onExcludeRoles('portal', portal.id, (result: number[]) => {
          this.setState({
            exludeRoles:  projectRoles.map((role) => {
              return result.some((re) => re === role.id) ? role : {...role, permission: true}
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
    })
  }

  private hidePortalForm = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    }, () => {
      this.portalForm.props.form.resetFields()
    })
  }

  private onModalOk = () => {
    this.portalForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {  projectId, onAdd, onCopy, refreshList, onEdit } = this.props
        const { formType } = this.state
        const { id, name, description, publish, avatar } = values
        const val = {
          description,
          name,
          publish,
          roleIds: this.state.exludeRoles.filter((role) => !role.permission).map((p) => p.id),
          avatar: formType === 'add' ? `${Math.ceil(Math.random() * 19)}` : avatar
        }

        const successCallback = () => {
          this.hidePortalForm()
          refreshList()
        }


        if (formType === 'add') {
          onAdd({
            ...val,
            projectId: Number(projectId)
          }, successCallback)
        } else if (formType === 'copy') {
          onCopy({...val, id}, successCallback)
        }
        else {
          onEdit({
            ...val,
            id
          }, successCallback)
        }
      }
    })
  }
  private changePermission = (scope: IExludeRoles, event) => {
    scope.permission = event.target.checked
    this.setState({
      exludeRoles: this.state.exludeRoles.map((role) => role && role.id === scope.id ? scope : role)
    })
  }
  public componentDidMount() {
    this.props?.childRef(this)
  }

  public render() {
    const {
      projectId,
      portals,
      currentProject,
      onCheckUniqueName,
      refreshList
    } = this.props
    if (!Array.isArray(portals)) {
      return null
    }

    const {
      formType,
      formVisible,
      modalLoading
    } = this.state

    const modalButtons = [(
      <Button
        key="back"
        onClick={this.hidePortalForm}
      >
        取 消
      </Button>
    ), (
      <Button
        key="submit"
        type="primary"
        loading={modalLoading}
        disabled={modalLoading}
        onClick={this.onModalOk}
      >
        {formType === 'copy' ? '提 交' : '保 存'}
      </Button>
    )]


    return (
      <Modal
        title={operateTypeMap[formType]}
        width="640px"
        visible={formVisible}
        footer={modalButtons}
        onCancel={this.hidePortalForm}
      >
        <PortalForm
          type={formType}
          onCheckUniqueName={onCheckUniqueName}
          projectId={projectId}
          exludeRoles={this.state.exludeRoles}
          onChangePermission={this.changePermission}
          wrappedComponentRef={this.refHandlers.portalForm}
        />
      </Modal>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  projectRoles: makeSelectProjectRoles()
})

const withConnect = connect(mapStateToProps, null)


export default compose(
  withConnect
)(DashboardOperateModel)
