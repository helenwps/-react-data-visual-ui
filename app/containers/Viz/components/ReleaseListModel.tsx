// 发布后，生成的列表纪录

/**
 * 仪表盘发布
 * create by zhu_jie 2021年1月15日14:07:01
 **/

import React from 'react'

import { Button, DatePicker, Form, Input, message, Modal, Spin, Table } from 'antd'
import moment from 'moment'
import { createStructuredSelector } from 'reselect'
import { makeSelectCurrentDashboardShareToken } from 'containers/Dashboard/selectors'

import DasAction from '../../Dashboard/actions'
import { connect } from 'react-redux'
import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import reducer from 'containers/Dashboard/reducer'
import injectSaga from 'utils/injectSaga'
import saga from 'containers/Dashboard/sagas'
import VizActions from 'containers/Viz/actions'
import { copyTextToClipboard } from 'components/SharePanel/utils'
import { DEFAULT_DATETIME_FORMAT, SHARE_HOST } from 'app/globalConstants'

const utilStyles = require('assets/less/util.less')
import ReleaseListModelStyle from './ReleaseListModel.less'
import { makeSelectReleaseModel } from 'containers/Viz/selectors'
import { ColumnProps } from 'table'
import { colBase } from 'containers/View/types'
import { FormComponentProps } from 'antd/lib/form/Form'
import { PortalListReleaseModel } from 'containers/Viz/components/PortalListReleaseModel'

interface ReleaseListModelProps {
  visible: boolean
  hideModal: () => void
  releaseModel?: {
    tableList: []
    offlineIng: boolean
    loading: boolean
  },
  dataId: number,
  offlineIng?: boolean
  onReleaseList?: (release: number) => void
  createNew: () => void
  onUpdateRelease?: (status: 1 | 2, dataId: number, resolve) => void
}

interface ReleaseListModelState {
  modalLoading: boolean
}

export class ReleaseListModel extends React.Component<ReleaseListModelProps, ReleaseListModelState> {
  constructor(props) {
    super(props)
  }

  private hidePortalForm = () => {
    const {hideModal} = this.props
    hideModal()
  }

  public componentDidMount() {
    const {dataId, onReleaseList} = this.props
    onReleaseList(dataId)
  }
  private offlineData =(record) => {
    const resolve = () => {
      this.componentDidMount()
      message.success(record.status === 1 ? '下架成功!' : '上架成功！')
    }
    this.props.onUpdateRelease(record.status === 1 ? 2 : 1, record.id, resolve)
  }
  private createNew = () => {
    this.props.createNew()
  }
  public render() {
    const {
      visible
    } = this.props

    const modalButtons = [(
      <div className={ReleaseListModelStyle.info}>
        没有找到您的发布信息，<span onClick={this.createNew} className={ReleaseListModelStyle.createNew}>立即新创建一个</span>吧！
      </div>
    ),(
      <Button
        key='back'
        onClick={this.hidePortalForm}
      >
        取 消
      </Button>
    )]

    const jumpPage = (url) => {
      window.open(url)
    }

    const columns:ColumnProps<colBase>[] = [
      {
        dataIndex: 'createTime',
        title: '发布时间',
        width: 150,
        sorter: (a, b) => (new Date(a.createTime).getTime()) - (new Date(b.createTime).getTime())
      },
      {
        dataIndex: 'url',
        title: 'url',
        ellipsis: true,
        render: (text, record) => (
          <span className={record.status === 1 ? ReleaseListModelStyle.jumpPage : ReleaseListModelStyle.disabled} onClick={() => jumpPage(text)}>{text}</span>
        )
      },
      {
        dataIndex: 'validityTime',
        title: '失效时间',
        width: 160
      },
      {
        dataIndex: 'description',
        title: '备注',
        ellipsis: true
      },
      {
        dataIndex: 'c',
        title: '操作',
        width: 80,
        align: 'right',
        render: (text, record) => (
          <span className={ReleaseListModelStyle.operate} onClick={() => this.offlineData(record)}>
            {record.status === 1 ? '下架' : '上架'}
          </span>
        )
      },
    ]

    return (
      <Modal
        title='发布记录'
        width='640px'
        visible={visible}
        footer={modalButtons}
        className={ReleaseListModelStyle.ReleaseListModel}
        onCancel={this.hidePortalForm}
      >
        <Spin spinning={this.props.releaseModel?.loading}>
          <div className={utilStyles.flagTitle} style={{marginBottom: '10px'}}>发布列表</div>
          <Table pagination={false} columns={columns} dataSource={this.props.releaseModel?.tableList || []} />
        </Spin>
      </Modal>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  currentDashboardShareToken: makeSelectCurrentDashboardShareToken(),
  releaseModel: makeSelectReleaseModel(),

})

function mapDispatchToProps(dispatch) {
  return {
    onReleaseList: (release: number) => dispatch(VizActions.getReleaseList(release)),
    onUpdateRelease: (status: 1 | 2, dataId: number, resolve) => dispatch(VizActions.updateReleaseStatus(status, dataId, resolve))
  }
}

const withReducer = injectReducer({ key: 'dashboard', reducer })
const withSaga = injectSaga({ key: 'dashboard', saga })

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default Form.create<ReleaseListModelProps & FormComponentProps>()(compose(withReducer, withSaga, withConnect)(ReleaseListModel))

