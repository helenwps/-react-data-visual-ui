import React from 'react'
import {
  Icon,
  Col,
  message,
  Row,
  Input,
  Form,
  Select,
  Button,
  DatePicker,
  TreeSelect,
  Breadcrumb,
  Divider,
  Table,
  Popconfirm,
  Modal
} from 'antd'
import moment from 'moment';
import { rulesGen } from 'app/utils/rulesGen';
const FormItem = Form.Item
const { Option } = Select;
const { RangePicker } = DatePicker;

class AddUserClass extends React.Component<any, any> {
  state = {
    value: undefined,
  };


  onChange = value => {
    console.log(value);
    this.setState({ value });
  };

  public render() {
    const { getFieldDecorator } = this.props.form
    console.log(this.props)
    const {

    } = this.props

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };

    const AddUserForm = (


      <Form {...formItemLayout}>
        <Row>


          <Col span={24}>
            <FormItem label="用户名">
              {getFieldDecorator('username', {
                initialValue: this.props.editUserItem.username || undefined,
                rules: [{
                  required: true,
                  message: '用户名不能为空'
                }, {
                  whitespace: true,
                  message: '不能全部为空'
                }, {
                  pattern: /^.{1,10}$/,
                  message: '长度10位以内'
                }]
              })(
                <Input autoComplete="off" />
              )}
            </FormItem>
          </Col>
          {
            this.props.editUserItem.id ? null : (
              <Col span={24}>
                <FormItem label="初始密码">
                  {getFieldDecorator('password', {
                    initialValue: undefined,
                    rules: [
                      ...rulesGen.required,
                      ...rulesGen.length(6, 20)
                    ]
                  })(
                    <Input autoComplete="off" />
                  )}
                </FormItem>
              </Col>
            )
          }

          <Col span={24}>
            <FormItem label="姓名">
              {getFieldDecorator('name', {
                initialValue: this.props.editUserItem.name || undefined,
                rules: [
                  ...rulesGen.required,
                  ...rulesGen.length(1, 10)
                ]
              })(
                <Input autoComplete="off" />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="手机号码">
              {getFieldDecorator('phone', {
                initialValue: this.props.editUserItem.phone,
                rules: [{
                  required: true,
                  message: '手机号码不能为空'
                },
                ...rulesGen.telephone
                ]
              })(
                <Input autoComplete="off" />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="邮箱">
              {getFieldDecorator('email', {
                initialValue: this.props.editUserItem.email,
                rules: [{
                  required: true,
                  message: '邮箱不能为空'
                },
                ...rulesGen.email
                ]
              })(
                <Input autoComplete="off" />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="所属部门">
              {getFieldDecorator('departmentId', {
                initialValue: this.props.editUserItem.departmentId && `${this.props.editUserItem.departmentId}` || undefined,
                rules: [...rulesGen.required]
              })(
                <TreeSelect
                  showSearch
                  style={{ width: '100%' }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="请选择"
                  allowClear
                  treeDefaultExpandAll
                  onChange={this.onChange}
                  treeData={this.props.departments.filter((item) => {
                    return item.parentId != -1
                  })}
                  treeNodeFilterProp="title"
                >

                </TreeSelect>
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label="工号">
              {getFieldDecorator('workNum', {
                initialValue: this.props.editUserItem.workNum,
                rules: [...rulesGen.length(1, 30)]
              })(
                <Input autoComplete="off" />
              )}
            </FormItem>
          </Col>

          <Col span={24}>
            <FormItem label="用户角色">
              {getFieldDecorator('roles', {
                initialValue: this.props.editUserItem.roles && this.props.editUserItem.roles.map((item => {
                  return `${item}`
                })) || undefined,
                // rules: [
                //   ...rulesGen.required,
                //   ...rulesGen.length(1, 10)
                // ]
              })(
                <Select  placeholder="请选择角色" allowClear={true}>
                  {
                    this.props.roles.map((item)=>{
                      return <Option value={`${item.id}`} key={`${item.id}`}>{item.name}</Option>
                    })
                  }
                  
                </Select>
              )}
            </FormItem>
          </Col>

        </Row>
      </Form>)



    return AddUserForm
  }
}

export default Form.create()(AddUserClass)