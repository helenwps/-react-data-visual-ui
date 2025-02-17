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

import { Form, Row, Col, Input, Radio, Tabs, Tree, Checkbox } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'

const TreeNode = Tree.TreeNode
const FormItem = Form.Item
const TextArea = Input.TextArea
const RadioGroup = Radio.Group
const TabPane = Tabs.TabPane

const utilStyles = require('assets/less/util.less')
const styles = require('../Viz.less')
import { IExludeRoles } from './PortalList'

interface IProtalListProps {
  projectId: number
  type: string
  params?: any
  exludeRoles?: IExludeRoles[]
  onChangePermission: (scope: object, e: any) => any
  onCheckUniqueName?: (pathname: string, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export class PortalForm extends React.PureComponent<IProtalListProps & FormComponentProps, {}> {
  private checkNameUnique = (rule, value = '', callback) => {
    const { onCheckUniqueName, type, form, projectId } = this.props
    const { id } = form.getFieldsValue()

    const data = {
      projectId,
      id: type === 'add' ? '' : id,
      name: value
    }
    if (!value) {
      callback()
    }
    onCheckUniqueName('dashboardPortal', data,
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }


  public render() {
    const {
      type,
      exludeRoles
    } = this.props
    const { getFieldDecorator } = this.props.form
    const authControl = exludeRoles && exludeRoles.length ? exludeRoles.map((role) => (
      <div className={styles.excludeList} key={`${role.name}key`}>
        <Checkbox checked={role.permission} onChange={this.props.onChangePermission.bind(this, role)} />
        <b>{role.name}</b>
      </div>
    )) : []
    const commonFormItemStyle = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    }

    return (
      <Form>
        <Row gutter={8}>
          <Col span={24}>
            {type !== 'add' && (
              <FormItem className={utilStyles.hide}>
                {getFieldDecorator('id', {})(
                  <Input />
                )}
              </FormItem>
            )}
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('avatar', {})(
                <Input />
              )}
            </FormItem>
            <Col span={24}>
              <FormItem label='名称' {...commonFormItemStyle} hasFeedback>
                {getFieldDecorator('name', {
                  rules: [{
                    required: true,
                    message: '名称不能为空'
                  },
                    {
                      validator: this.checkNameUnique
                    }]
                })(
                  <Input minLength={1} maxLength={20} placeholder='想个专属名称吧' />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label='描述' {...commonFormItemStyle}>
                {getFieldDecorator('description', {
                  initialValue: ''
                })(
                  <TextArea
                    maxLength={200}
                    placeholder='写下仪表盘的背景、目的、效果等内容吧，将会激起更多人对你的仪表盘的兴趣'
                    autosize={{ minRows: 4, maxRows: 6 }}
                  />
                )}
              </FormItem>
            </Col>


            {/*<Tabs defaultActiveKey="infomation">*/}
            {/*  <TabPane tab="基本信息" key="infomation">*/}

            {/*<Col span={24}>*/}
            {/*  <FormItem label="是否发布" {...commonFormItemStyle}>*/}
            {/*    {getFieldDecorator('publish', {*/}
            {/*      initialValue: true*/}
            {/*    })(*/}
            {/*      <RadioGroup>*/}
            {/*        <Radio value>发布</Radio>*/}
            {/*        <Radio value={false}>编辑</Radio>*/}
            {/*      </RadioGroup>*/}
            {/*    )}*/}
            {/*  </FormItem>*/}
            {/*</Col>*/}
            {/*</TabPane>*/}
            {/*<TabPane tab="权限管理" key="control" className={styles.controlTab}>*/}
            {/*  {*/}
            {/*    authControl*/}
            {/*  }*/}
            {/*</TabPane>*/}
            {/*</Tabs>*/}
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IProtalListProps & FormComponentProps>()(PortalForm)
