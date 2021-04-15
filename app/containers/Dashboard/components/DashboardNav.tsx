import * as React from 'react'
import { Icon, Select } from 'antd'
import DashboardNavStyle from './DashboardNav.less'
import { createStructuredSelector } from 'reselect'
import { makeSelectGlobalTime } from 'containers/Dashboard/selectors'
import DashboardActions from 'containers/Dashboard/actions'
import { connect } from 'react-redux'
import { compose } from 'redux'
interface DashboardNavProps {
  title: string
  navToList: () => void
  setRefreshTime: (time: number) => void
  refreshTime: number
  isPreview: boolean
}
interface DashboardNavState {

}

export default class DashboardNav extends React.Component<DashboardNavProps, DashboardNavState> {
  constructor(props) {
    super(props);
  }
  private toList = () => {
    this.props.navToList()
  }
  private setRefreshTime = (val) => {
    this.props.setRefreshTime(val)
  }
  render() {
    const {title, isPreview} = this.props
    return (
      <div className={DashboardNavStyle.dashboardNav}>
        <div className={DashboardNavStyle.title} onClick={this.toList}>
          <Icon type="arrow-left" />
          <span>{isPreview ? '预览' : title}</span>
        </div>
        {
          !isPreview && <div className={DashboardNavStyle.refreshTime}>
            全局图表刷新时间设置：
            <Select style={{width: '120px'}} value={this.props.refreshTime} onChange={this.setRefreshTime}>
              <Select.Option value={0}>手动</Select.Option>
              <Select.Option value={5}>5s</Select.Option>
              <Select.Option value={10}>10s</Select.Option>
              <Select.Option value={15}>15s</Select.Option>
              <Select.Option value={30}>30s</Select.Option>
              <Select.Option value={45}>45s</Select.Option>
              <Select.Option value={60}>60s</Select.Option>
            </Select>
          </div>
        }
        <div className={DashboardNavStyle.operate}>
          {this.props.children}
        </div>
      </div>
    )
  }
}
