import React from 'react'

import { Button, Tooltip, Col, Popconfirm, Menu, Dropdown, Icon} from 'antd'
import { ButtonProps } from 'antd/lib/button/button'

import { IProject } from 'containers/Projects/types'
import { IDashboard } from '../types'

import ModulePermission from 'containers/Account/components/checkModulePermission'
import ShareDownloadPermission from 'containers/Account/components/checkShareDownloadPermission'

const utilStyles = require('assets/less/util.less')
import ExportDashboard from 'containers/Dashboard/components/ExportDashboard'
import ToolbarV1Style from './ToolbarV1.less'

interface IToolbarProps {
  currentProject: IProject
  currentDashboard: IDashboard
  showAddDashboardItem: () => void
  onOpenSharePanel: () => void
  onOpenLinkageConfig: () => void
  onOpenGlobalControlConfig: () => void
  onDownloadDashboard: () => void
  isPreview: boolean
}

export class ToolbarCopy extends React.PureComponent<IToolbarProps> {

  public render () {
    const { currentDashboard } = this.props
    if (!currentDashboard) { return null }

    const handleMenuClick = function(v) {
      console.log(v)
    }

    const {
      currentProject,
      showAddDashboardItem,
      onOpenSharePanel,
      onOpenLinkageConfig,
      onOpenGlobalControlConfig,
      onDownloadDashboard,
      isPreview
    } = this.props

    return (
      <div className={ToolbarV1Style.toolbarV1}>
        {
          !isPreview &&
            <>
              <Button type="primary" onClick={showAddDashboardItem}>新增图表</Button>
              <Button onClick={onOpenLinkageConfig}>联动关系配置</Button>
              <Button onClick={onOpenGlobalControlConfig}>全局控制器设置</Button>
              <Button onClick={onOpenSharePanel}>分享</Button>
            </>
        }
        <ExportDashboard dashboardId={this.props.currentDashboard.id}/>
        <Popconfirm
          title="点击开始下载"
          placement="bottom"
          onConfirm={onDownloadDashboard}
        >
          <Button icon="download"/>
        </Popconfirm>
      </div>
    )
  }
}
