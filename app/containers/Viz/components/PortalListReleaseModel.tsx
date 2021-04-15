/**
 * 仪表盘发布
 * create by zhu_jie 2021年1月15日14:07:01
 **/

import React, { useCallback } from 'react'

import { Button, Col, DatePicker, Form, Input, message, Modal, Radio, Row, Tabs, Tree, Spin } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import api from 'utils/api'
import request from 'utils/request'
import moment from 'moment'
import PortalListReleaseModelStyle from './PortalListReleaseModel.less'
import { createStructuredSelector } from 'reselect'
import { makeSelectCurrentDashboardShareToken } from 'containers/Dashboard/selectors'

import DasAction from '../../Dashboard/actions'
import { connect } from 'react-redux'
import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import reducer from 'containers/Dashboard/reducer'
import injectSaga from 'utils/injectSaga'
import saga from 'containers/Dashboard/sagas'
import { copyTextToClipboard } from 'components/SharePanel/utils'
import { DEFAULT_DATETIME_FORMAT, SHARE_HOST } from 'app/globalConstants'

const TreeNode = Tree.TreeNode
const FormItem = Form.Item
const TextArea = Input.TextArea
const RadioGroup = Radio.Group
const TabPane = Tabs.TabPane
const utilStyles = require('assets/less/util.less')

interface PortalListReleaseModelProps {
  visible: boolean
  releaseModal: any
  operateSuccess: any,
  hideReleaseModel: any,
  currentDashboardShareToken?: any
  onCurrentDashboardShareToken?: any
  onClearShareToken?: any
  releaseDashboard:(params: any, resolve: any) => void,
  releaseDashboardIng: boolean
}

interface PortalListReleaseModelState {
  modalLoading: boolean
}

export class PortalListReleaseModel extends React.PureComponent<PortalListReleaseModelProps & FormComponentProps, PortalListReleaseModelState> {
  constructor(props) {
    super(props);
  }
  public state = {
    modalLoading: false
  }
  private hidePortalForm = () => {
    this.props.onClearShareToken()
    this.props.hideReleaseModel()
    this.props.form.resetFields()
  }
  // private onSave = async (values)=> {
  //   const res = await request( {url: `${api.portalRelease}/${this.props.releaseModal.id}/share`, method: 'post', data: {...values, "permission": "SHARER"}})
  //   console.log(res, 'res')
  // }
  private checkFormAndGetValue = () =>  {
    return new Promise<any>(async (resolve, reject) => {
      this.props.form.validateFieldsAndScroll((err, values) => {
        console.log(values, 'values')
        if (err) {
          reject()
        } else {
          const {id, dashboardId} = this.props.releaseModal
          let {validityTime, description} = values
          validityTime = moment(validityTime).format('YYYY-MM-DD HH:mm:ss')
          resolve({createBy: this.props.releaseModal.createBy, expired: validityTime, validityTime, description, id: dashboardId, mode: 'NORMAL'})
        }
      })
    })
  }
  private onModalOk = async () => {
    try {
      if (!this.props.currentDashboardShareToken) {
        return message.warning('请先生成分享链接！')
      }
      let params = await this.checkFormAndGetValue()
      // 类型：1-widget 2-display 3-dashboard
      params.type = 3
      params.status = 1
      params.typeId = params.id
      delete params.id
      const {releaseDashboard, onClearShareToken, form, operateSuccess, hideReleaseModel} = this.props
      params.url = `${SHARE_HOST}?shareToken=${encodeURI(this.props.currentDashboardShareToken)}#share/dashboard`
      const resolve = () => {
        onClearShareToken()
        form.resetFields()
        operateSuccess()
        hideReleaseModel()
        message.success('发布成功！')
      }
      releaseDashboard(params, resolve)
    } catch (e) {
      console.log(e)
    }
  }
  private copyUrl = () => {
    copyTextToClipboard(`${SHARE_HOST}?shareToken=${encodeURI(this.props.currentDashboardShareToken)}#share/dashboard`,
      () => message.success('复制链接成功'),
      () => message.warning('复制链接失败，请稍后重试'))
  }
  private createUrl = async () => {
    try {
      const params = await this.checkFormAndGetValue()
      console.log(params, 'params')
      this.props.onCurrentDashboardShareToken(params)
    } catch (e) {
      console.log(e)
    }

  }
  public render () {
    const {
      visible
    } = this.props
    const {modalLoading} = this.state
    const { getFieldDecorator } = this.props.form

    const commonFormItemStyle = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    }

    const shareUrl = `${SHARE_HOST}?shareToken=${encodeURI(this.props.currentDashboardShareToken)}#share/dashboard`
    const disabledDate = (current) => current && current < moment().subtract(1, 'day').endOf('day')

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
        保 存
      </Button>
    )]

    return (
      <Modal
        title="新建发布"
        width="640px"
        visible={visible}
        footer={modalButtons}
        className={PortalListReleaseModelStyle.portalListReleaseModel}
        onCancel={this.hidePortalForm}
      >
        <Spin spinning={this.props.releaseDashboardIng}>
          <Form>
            <Row gutter={8}>
              <Col span={24}>
                <FormItem label="id" className={utilStyles.hide}>
                  {getFieldDecorator('id', {})(
                    <Input />
                  )}
                </FormItem>
                <FormItem label="createBy" className={utilStyles.hide}>
                  {getFieldDecorator('createBy', {})(
                    <Input />
                  )}
                </FormItem>
                <Col span={24}>
                  <FormItem label="有效期" {...commonFormItemStyle} hasFeedback>
                    {getFieldDecorator('validityTime', {
                      rules: [{
                        required: true,
                        message: '请选择有效期'
                      }]
                    })(
                      <DatePicker
                        style={{width: '100%'}}
                        showTime
                        format={DEFAULT_DATETIME_FORMAT}
                        disabledDate={disabledDate}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem label="备注" {...commonFormItemStyle}>
                    {getFieldDecorator('description', {
                      initialValue: ''
                    })(
                      <TextArea
                        placeholder="写下仪表盘的背景、目的、效果等内容吧，将会激起更多人对你的仪表盘的兴趣"
                        autosize={{minRows: 4, maxRows: 6}}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem wrapperCol={{span: 18, offset: 6}}>
                    <div onClick={this.createUrl} className={PortalListReleaseModelStyle.link}>点击生成链接</div>
                    {
                      this.props.currentDashboardShareToken &&
                      <div className={PortalListReleaseModelStyle.result}>
                        <span title={shareUrl} className={PortalListReleaseModelStyle.linkResult}>{shareUrl}</span>
                        {
                          <Button
                            type="default"
                            onClick={this.copyUrl}
                          >
                            复制
                          </Button>
                        }
                      </div>
                    }
                  </FormItem>
                </Col>
              </Col>
            </Row>
          </Form>
        </Spin>

      </Modal>
    )
  }
}
const mapStateToProps = createStructuredSelector({
  currentDashboardShareToken: makeSelectCurrentDashboardShareToken(),
})
function mapDispatchToProps(dispatch) {
  return {
    onClearShareToken: () => dispatch(DasAction.clearShareToken()),
    onCurrentDashboardShareToken: (params) => dispatch(DasAction.loadDashboardShareLink(params))
  }
}

const withReducer = injectReducer({ key: 'dashboard', reducer })
const withSaga = injectSaga({ key: 'dashboard', saga })

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default Form.create<PortalListReleaseModelProps & FormComponentProps>()(compose(withReducer, withSaga, withConnect)(PortalListReleaseModel))
