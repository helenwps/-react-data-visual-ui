import React, { useState, useEffect, useCallback, useMemo } from 'react'
import pick from 'lodash/pick'
import { ISourceFormValues, IDatasourceInfo } from '../types'

import {
  Modal,
  Form,
  Row,
  Col,
  Button,
  Input,
  Select,
  Icon,
  Cascader
} from 'antd'
const FormItem = Form.Item
const TextArea = Input.TextArea
const Option = Select.Option
import { FormComponentProps } from 'antd/lib/form/Form'
import { CascaderOptionType } from 'antd/lib/cascader'
import { SourceProperty } from './types'
import {
  EditableFormTable,
  EditableColumnProps
} from 'components/Table/Editable'

const utilStyles = require('assets/less/util.less')

interface ISourceConfigModalProps
  extends FormComponentProps<ISourceFormValues> {
  visible: boolean
  formLoading: boolean
  testLoading: boolean
  source: ISourceFormValues
  datasourcesInfo: IDatasourceInfo[]
  onSave: (values: any) => void
  onClose: () => void
  // onTestSourceConnection: (
  //   username: string,
  //   password: string,
  //   jdbcUrl: string,
  //   ext: boolean,
  //   version: string
  // ) => any
  onCheckUniqueName: (
    pathname: string,
    data: any,
    resolve: () => any,
    reject: (error: string) => any
  ) => any
}

const commonFormItemStyle = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
}

const longFormItemStyle = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 }
}

const datasourceInfoDisplayRender = (label: string[]) => label.join(' : ')

const columns: Array<EditableColumnProps<SourceProperty>> = [
  {
    title: 'Key',
    dataIndex: 'key',
    width: '30%',
    editable: true,
    inputType: 'input'
  },
  {
    title: 'Value',
    dataIndex: 'value',
    editable: true,
    inputType: 'input'
  }
]
const SourceConfigModal: React.FC<ISourceConfigModalProps> = (props) => {
  const {
    visible,
    source,
    datasourcesInfo,
    form,
    formLoading,
    testLoading,
    // onTestSourceConnection,
    onCheckUniqueName,
    onSave,
    onClose
  } = props
  if (!source) {
    return null
  }
  const { id: sourceId } = source
  const { getFieldDecorator } = form
  const [dbList, setDBList] = useState([])
  useEffect(() => {
    setDBList(datasourcesInfo)
  }, [datasourcesInfo])
  useEffect(
    () => {
      let fieldsKeys: Array<keyof ISourceFormValues> = [
        'id',
        'name',
        'type',
        'datasourceInfo',
        'description',
        'ip',
        'port',
        'dbName'
      ]
      // @FIXME nested object properties name typing
      fieldsKeys = []
        .concat(fieldsKeys)
        .concat(['config.username', 'config.password'])

      const fieldsValue = pick(source, fieldsKeys)
      console.log(fieldsValue)
      form.setFieldsValue(fieldsValue)
    },
    [source, visible]
  )
  const checkNameUnique = useCallback(
    (_, name = '', callback) => {
      const { id, projectId } = source
      const {tenantId} = JSON.parse(localStorage.getItem('loginUser'))

      const data = { id, name, tenantId }
      if (!name) {
        callback()
      }
      onCheckUniqueName(
        'source',
        data,
        () => {
          callback()
        },
        (err) => callback(err)
      )
    },
    [onCheckUniqueName, source]
  )

  const datasourceInfoChange = useCallback(
    (value: string[]) => {
      const datasourceName = value[0]
      const selectedDatasource = datasourcesInfo.find(
        ({ name }) => name === datasourceName
      )
      const prefix = selectedDatasource.prefix
      const currentUrl = form.getFieldValue('config.url') as string
      let hasMatched = false
      let newUrl = currentUrl.replace(/^jdbc:([\w:]+):/, (match) => {
        hasMatched = !!match
        return prefix
      })
      if (!hasMatched) {
        newUrl = prefix + currentUrl
      }
      form.setFieldsValue({ 'config.url': newUrl })
    },
    [datasourcesInfo]
  )

  // const testSourceConnection = useCallback(
  //   () => {
  //     const {
  //       datasourceInfo,
  //       config
  //     } = form.getFieldsValue() as ISourceFormValues
  //     const { username, password } = config
  //     const version =
  //       datasourceInfo[1] === 'Default' ? '' : datasourceInfo[1] || ''
  //     onTestSourceConnection(username, password, !!version, version)
  //   },
  //   [form, onTestSourceConnection]
  // )

  const save =
    () => {
      form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const { ip, port, dbName } = values
          const datasourceName = values.datasourceInfo[0]
          const selectedDatasource = datasourcesInfo.find(
            ({ name }) => name === datasourceName
          )
          // values.config.url = `${selectedDatasource.prefix}//${ip}:${port}/${dbName}`
          onSave(values)
        }
      })
    }

  const typeChange = useCallback(val => {
    if (val !== 'jdbc') setDBList([{ "name": "clickhouse", "prefix": "jdbc:clickhouse:", "versions": "" }])
    else setDBList(datasourcesInfo)
  }, [datasourcesInfo])

  const reset = useCallback(
    () => {
      form.resetFields()
    },
    [form]
  )

  const cascaderOptions: CascaderOptionType[] = useMemo(
    () =>
      dbList.map(({ name, versions }) => ({
        label: name,
        value: name,
        ...(versions && {
          children: versions.map((ver) => ({
            label: ver,
            value: ver
          }))
        })
      })),
    [dbList]
  )

  const modalButtons = useMemo(
    () => [
      <Button key="back" size="small" onClick={onClose}>
        取消
      </Button>,
      <Button
        key="submit"
        size="small"
        type="primary"
        loading={formLoading}
        disabled={formLoading}
        onClick={save}
      >
        确定
    </Button>
    ],
    [form, formLoading, onSave, onClose]
  )
  const type = form.getFieldValue('type')
  return (
    <Modal
      title={`${!sourceId ? '新增数据源' : '编辑'}`}
      wrapClassName="ant-modal-medium"
      maskClosable={false}
      visible={visible}
      footer={modalButtons}
      onCancel={onClose}
      afterClose={reset}
    >
      <Form labelAlign="left">
        <Row>
          <FormItem className={utilStyles.hide}>
            {getFieldDecorator<ISourceFormValues>('id')(<Input />)}
          </FormItem>
          <Col span={12}>

          </Col>
        </Row>
        <FormItem label="数据源名称" {...commonFormItemStyle} hasFeedback>
          {getFieldDecorator<ISourceFormValues>('name', {
            rules: [
              {
                required: true,
                message: '数据源名称不能为空'
              },
              {
                min: 1,
                max: 20,
                message: '数据源名称长度为1-20位'
              },
              {
                validator: checkNameUnique
              }
            ]
          })(<Input autoComplete="off" placeholder="请输入名称" />)}
        </FormItem>
        <FormItem label="类型" {...commonFormItemStyle}>
          {getFieldDecorator<ISourceFormValues>('type', {
            initialValue: 'jdbc'
          })(
            <Select onChange={typeChange}>
              <Option value="jdbc">jdbc</Option>
              <Option value="csv">csv文件</Option>
              <Option value="excel">excel文件</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="数据库" {...commonFormItemStyle}>
          {getFieldDecorator<ISourceFormValues>('datasourceInfo', {
            initialValue: [],
            rules: [
              {
                required: true,
                message: '数据库不能为空'
              }
            ]
          })(
            <Cascader
              options={cascaderOptions}
              displayRender={datasourceInfoDisplayRender}
            // onChange={datasourceInfoChange}
            />
          )}
        </FormItem>
        { type == 'jdbc' && <FormItem label="用户名" {...commonFormItemStyle}>
          {getFieldDecorator('config.username', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: '请输入用户名'
              }
            ]
          })(<Input autoComplete="off" placeholder="请输入用户名" />)}
        </FormItem> }
        { type == 'jdbc' && <FormItem label="密码" {...commonFormItemStyle}>
          {getFieldDecorator('config.password', {
            initialValue: '',
            rules: [
              {
                required: form.getFieldValue('datasourceInfo').length && form.getFieldValue('datasourceInfo')[0] == 'mysql',
                message: '请输入密码'
              }
            ]
          })(
            <Input
              autoComplete="off"
              placeholder="请输入密码"
              type="password"
            />
          )}
        </FormItem> }
        {type == 'jdbc' && <FormItem label="ip" {...commonFormItemStyle}>
          {getFieldDecorator('ip', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: 'ip不能为空'
              },
            ]
          })(
            <Input
              autoComplete="off"
              placeholder="请输入ip"
            />
          )}
        </FormItem> }
        {type == 'jdbc' && <FormItem label="端口" {...commonFormItemStyle}>
          {getFieldDecorator('port', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: '端口不能为空'
              },
            ]
          })(
            <Input
              autoComplete="off"
              placeholder="请输入端口"
            />
          )}
        </FormItem> }
        {type == 'jdbc' && <FormItem label="数据库名称" {...commonFormItemStyle}>
          {getFieldDecorator('dbName', {
            initialValue: '',
            rules: [
              {
                required: true,
                message: '请输入数据库名称'
              },
            ]
          })(
            <Input
              autoComplete="off"
              placeholder="请输入数据库名称"
            />
          )}
        </FormItem> }
        <FormItem label="描述" {...commonFormItemStyle}>
          {getFieldDecorator('description', {
            initialValue: ''
          })(
            <TextArea
              placeholder="请输入描述"
              autosize={{ minRows: 3, maxRows: 6 }}
            />
          )}
        </FormItem>
      </Form>
    </Modal>
  )
}

export default Form.create<ISourceConfigModalProps>()(SourceConfigModal)
