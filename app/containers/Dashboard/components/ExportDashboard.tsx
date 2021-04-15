// 导出仪表盘
import React from 'react'
import { Button, Dropdown, Icon, Menu } from 'antd'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { makeSelectDashboardDownloading } from 'containers/Dashboard/selectors'
import DashboardActions  from 'containers/Dashboard/actions'
import { compose } from 'redux'
type MappedStates = ReturnType<typeof mapStateToProps>
type MappedDispatches = ReturnType<typeof mapDispatchToProps>
interface IExportDashboard {
  dashboardId: number
}
class ExportDashboard extends React.PureComponent<IExportDashboard & MappedStates & MappedDispatches>  {
  render() {
    const {dashboardId, onDownloadFile, downloading} = this.props
    const handleMenuClick = (v) => {
      const {key} = v
      onDownloadFile(key, dashboardId)
    }
    const menu = (
      <Menu onClick={handleMenuClick}>
        <Menu.Item key="pic">导出为图片</Menu.Item>
        <Menu.Item key="ppt">导出为PPT</Menu.Item>
        <Menu.Item key="pdf">导出为PDF</Menu.Item>
      </Menu>
    );
    return (
      <Dropdown overlay={menu}>
        <Button disabled={downloading} loading={downloading}>
          导出 <Icon type="down" />
        </Button>
      </Dropdown>
      )

  }
}

const mapStateToProps = createStructuredSelector({
  downloading: makeSelectDashboardDownloading(),
})

export function mapDispatchToProps (dispatch) {
  return {
    onDownloadFile: (
      type: string,
      dashboardId: number
    ) => dispatch(DashboardActions.downloadDashboardFile(dashboardId, type))
  }
}


const withConnect = connect(mapStateToProps, mapDispatchToProps)
export default compose(
  withConnect
)(ExportDashboard)
