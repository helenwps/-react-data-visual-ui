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

import React, { useContext } from 'react'
import classnames from 'classnames'
import {
  Input,
  InputNumber,
  Radio,
  Checkbox,
  Select,
  Form,
  Icon,
  Col,
  Switch
} from 'antd'
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group
const { Option } = Select
const FormItem = Form.Item
import { GetFieldDecoratorOptions } from 'antd/lib/form/Form'

import ColorPicker from 'components/ColorPicker'
import Upload from 'components/Upload'
import IconFont from 'components/IconFont'

import { SettingItem } from './types'
import { SlideSettingContext } from './util'
import api from 'utils/api'

import utilStyles from 'assets/less/util.less'
import styles from './Form.less'

interface IItemProps {
  item: SettingItem
  [propName: string]: any;
}
const switchTitles = ['宽度（像素）', '高度（像素）',]
const ColorPick = React.forwardRef((props: any, ref) => {
  return (
    <div style={{ marginTop: '8px', float: 'right' }} >
      <ColorPicker rawValue {...props} ref={ref} />
    </div>
  )
})
const Item: React.FC<IItemProps> = (props) => {
  const { item } = props
  const { form, size, slideId, layerId } = useContext(SlideSettingContext)
  let visible = true
  const { relatedItems } = item
  if (Array.isArray(relatedItems)) {
    relatedItems.some(({ name, values }) => {
      const relatedValue = form.getFieldValue(name)
      if (values.findIndex((val) => val === relatedValue) < 0) {
        visible = false
        return true
      }
    })
  }
  const itemCls = classnames({
    [utilStyles.hide]: !visible
  })

  const { getFieldDecorator, getFieldValue } = form
  const options: GetFieldDecoratorOptions = { initialValue: item.default }
  const { labelCol, wrapperCol, span } = item


  let control: React.ReactNode
  switch (item.component) {
    case 'input':
      control = <FormItem
        labelCol={{ span: labelCol || 12 }}
        wrapperCol={{ span: wrapperCol || 12 }}
        label={item.title}
      >
        {getFieldDecorator(item.name, options)(<Input size={size} placeholder={item.placeholder} />)}
      </FormItem>
      break
    case 'inputnumber':
      // if (switchTitles.includes(item.title)) {
      //   control = (
      //     !isSelect &&
      //     <FormItem
      //       labelCol={{ span: labelCol || 12 }}
      //       wrapperCol={{ span: wrapperCol || 12 }}
      //       label={item.title}
      //     >
      //       {getFieldDecorator(item.name, options)(<InputNumber
      //         size={size}
      //         placeholder={item.placeholder}
      //         min={item.min === undefined ? -Infinity : item.min}
      //         max={item.max === undefined ? Infinity : item.max}
      //       />)}
      //     </FormItem> || <span></span>
      //   )
      // } else 
      control = (
        <FormItem
          labelCol={{ span: labelCol || 12 }}
          wrapperCol={{ span: wrapperCol || 12 }}
          label={item.title}
        >
          {getFieldDecorator(item.name, options)(<InputNumber
            size={size}
            placeholder={item.placeholder}
            min={item.min === undefined ? -Infinity : item.min}
            max={item.max === undefined ? Infinity : item.max}
          />)}
        </FormItem>
      )
      break
    case 'radio':
      control = (
        <FormItem
          labelCol={{ span: labelCol || 12 }}
          wrapperCol={{ span: wrapperCol || 12 }}
          label={item.title}
        >
          {getFieldDecorator(item.name, options)(<RadioGroup size={size}>
            {item.values.map(({ value, name }) => (
              <Radio key={value} value={value}>
                {name}
              </Radio>
            ))}
          </RadioGroup>)}
        </FormItem>
      )
      break
    case 'checkbox':
      options.valuePropName = item.valuePropName
      control = <FormItem
        labelCol={{ span: labelCol || 12 }}
        wrapperCol={{ span: wrapperCol || 12 }}
        label={item.title}
      >
        {getFieldDecorator(item.name, options)(<Checkbox />)}
      </FormItem>
      break
    case 'checkboxGroup':
      control = <FormItem
        labelCol={{ span: labelCol || 12 }}
        wrapperCol={{ span: wrapperCol || 12 }}
        label={item.title}
      >
        {getFieldDecorator(item.name, options)(<CheckboxGroup options={item.values} />)}
      </FormItem>
      break
    case 'select':
      control = (
        <FormItem
          labelCol={{ span: labelCol || 12 }}
          wrapperCol={{ span: wrapperCol || 12 }}
          label={item.title}
        >
          {getFieldDecorator(item.name, options)(<Select size={size} style={{ width: '80%' }}>
            {item.values.map(({ name, value }) => (
              <Option key={value} value={value}>
                {name}
              </Option>
            ))}
          </Select>)}
        </FormItem>
      )
      break
    case 'colorPicker':
      let color = form.getFieldValue(item.name)
      if (color) {
        color = `rgba(${color.join()})`
      }
      control = (
        <FormItem
          labelCol={{ span: labelCol || 12 }}
          wrapperCol={{ span: wrapperCol || 12 }}
          label={item.title}
        >
          {getFieldDecorator(item.name, options)(<ColorPick size={size} />)}
        </FormItem>
      )
      break
    case 'upload':
      const action = `${api.display}/${item.action}`
        .replace(/({slideId})/, slideId ? `${slideId}` : '')
        .replace(/({layerId})/, layerId ? `${layerId}` : '')
      const img = form.getFieldValue(item.name)
      control = (
        <FormItem
          labelCol={{ span: labelCol || 12 }}
          wrapperCol={{ span: wrapperCol || 12 }}
          label={item.title}
        >
          {getFieldDecorator(item.name, options)(<Upload name={item.name} action={action}>
            {img ? (
              <div className="display-setting-form-img">
                <img src={img} alt={item.title} />
                <Icon
                  type="delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    form.setFieldsValue({ [item.name]: null })
                  }}
                />
              </div>
            ) : (
                <Icon type="plus" />
              )}
          </Upload>)}
        </FormItem>
      )
      break
  }
  return (
    // <Col span={span || 24} className={itemCls}>
    // <FormItem
    //   labelCol={{ span: labelCol || 12 }}
    //   wrapperCol={{ span: wrapperCol || 12 }}
    //   label={item.title}
    // >
    //   {getFieldDecorator(item.name, options)(control)}
    // </FormItem>
    // {/* </Col> */}
    control
  )
}

export default Item
