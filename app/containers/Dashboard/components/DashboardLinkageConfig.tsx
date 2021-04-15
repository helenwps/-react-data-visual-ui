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

import React from 'react'
import { Button, Modal } from 'antd'

import { SQL_NUMBER_TYPES, DEFAULT_SPLITER } from 'app/globalConstants'
import { decodeMetricName, getAggregatorLocale } from 'containers/Widget/components/util'
import { IFormedViews } from 'containers/View/types'
import { IWidgetConfig } from 'containers/Widget/components/Widget'
import LinkageConfig from 'components/Linkages/LinkageConfig'
import ReleaseListModelStyle from 'containers/Viz/components/ReleaseListModel.less'

const styles = require('../Dashboard.less')

interface IDashboardLinkageConfigProps {
  currentDashboard: any
  currentItems: any[]
  currentItemsInfo: any
  linkages: any[]
  views: IFormedViews
  widgets: any[]
  visible: boolean
  loading: boolean
  onCancel: () => void
  onSave: (filterItems: any[]) => void
  onGetWidgetInfo: (itemId: number) => void
}

interface IDashboardLinkageConfigStates {
  linkageCascaderSource: any[]
  savingLinkageConfig: boolean
}

export class DashboardLinkageConfig extends React.Component<IDashboardLinkageConfigProps, IDashboardLinkageConfigStates> {
  private linkageConfig: any
  public constructor (props: IDashboardLinkageConfigProps) {
    super(props)
    this.state = {
      linkageCascaderSource: [],
      savingLinkageConfig: false
    }
  }

  public componentWillReceiveProps (nextProps: IDashboardLinkageConfigProps) {
    const { visible } = nextProps
    if (visible) {
      const linkageCascaderSource = this.getLinkageConfigSource()
      this.setState({ linkageCascaderSource })
    }
  }

  private getLinkageConfigSource = () => {
    const { currentItems, widgets, views, currentItemsInfo } = this.props
    if (!currentItemsInfo) { return [] }

    const linkageConfigSource = []
    Object.keys(currentItemsInfo).forEach((infoKey) => {
      const dashboardItem = currentItems.find((ci) => `${ci.id}` === infoKey)
      const widget = widgets.find((w) => w.id === dashboardItem.widgetId)
      const { cols, rows, metrics, color, label } = widget.config
      const view = views[widget.viewId]
      const { model, variable } = view

      let triggerDimensions = [...cols, ...rows].map(({ name }) => name)
      if (color) {
        triggerDimensions = triggerDimensions.concat(color.items.map(({ name }) => name))
      }
      if (label) {
        triggerDimensions = triggerDimensions.concat(label.items.map(({ name }) => name))
      }
      console.log(triggerDimensions, model, 'triggerDimensions')
      const triggerColumns = [
        ...[...new Set(triggerDimensions)]
          .filter((name) => model[name])
          .map((name) => {
            console.log(name, model[name].sqlType, 'model[name].sqlType')
            return {
              label: name,
              value: [name, model[name].sqlType, 'column'].join(DEFAULT_SPLITER)
            }
          }),
        ...metrics.map(({ name, agg }) => {
          console.log(metrics, SQL_NUMBER_TYPES[SQL_NUMBER_TYPES.length - 1], 'test')
          const metricName = decodeMetricName(name)
          return {
            label: `${getAggregatorLocale(agg)} ${metricName}`,
            value: [`${agg}(${metricName})`, SQL_NUMBER_TYPES[SQL_NUMBER_TYPES.length - 1], 'column'].join(DEFAULT_SPLITER)
          }
        })
      ]

      const linkagerColumns = Object.entries(model)
        .map(([name, value]) => ({
          label: name,
          value: [name, value.sqlType, 'column'].join(DEFAULT_SPLITER)
        }))

      const variables = variable.map(({ name }) => {
        return {
          label: `${name}[变量]`,
          value: [name, null, 'variable'].join(DEFAULT_SPLITER)
        }
      })

      linkageConfigSource.push({
        label: widget.name,
        value: infoKey,
        children: {
          triggerColumns,
          linkagerColumns,
          variables
        }
      })
    })
    return linkageConfigSource
  }

  private onSavingLinkageConfig = () => {
    this.setState({
      savingLinkageConfig: !this.state.savingLinkageConfig
    })
  }
  private createNew = () => {
    this.linkageConfig?.showForm()
  }
  public render () {
    const { visible, loading, onSave, onGetWidgetInfo, linkages, onCancel } = this.props
    const { linkageCascaderSource, savingLinkageConfig } = this.state

    const modalButtons = [
      (
        <div className={styles.info}>
          没有找到相关的联动信息，<span onClick={this.createNew} className={styles.createNew}>立即新创建一个</span>吧！
        </div>
      ),
      (
      <Button
        key="cancel"
        onClick={onCancel}
      >
        取 消
      </Button>
    ), (
      <Button
        key="submit"
        type="primary"
        loading={loading}
        disabled={loading}
        onClick={this.onSavingLinkageConfig}
      >
        保 存
      </Button>
    )]

    return (
      <Modal
        title="联动关系配置"
        wrapClassName="ant-modal-large"
        maskClosable={false}
        visible={visible}
        onCancel={onCancel}
        key="DashboardLinkageConfig"
        footer={modalButtons}
      >
        <div className={styles.modalLinkageConfig}>
          <LinkageConfig
            childrenRef={ref => this.linkageConfig = ref}
            linkages={linkages}
            cascaderSource={linkageCascaderSource}
            onGetWidgetInfo={onGetWidgetInfo}
            saving={savingLinkageConfig}
            onSave={onSave}
          />
        </div>
      </Modal>
    )
  }
}

export default DashboardLinkageConfig
