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
  Breadcrumb,
  Divider,
  Table,
  Popconfirm,
  Modal
} from 'antd'
import moment from 'moment';
const FormItem = Form.Item
const { Option } = Select;
const { RangePicker } = DatePicker;

class addZhuhusClass extends React.Component {

  public render() {
    const { getFieldDecorator } = this.props.form
    console.log(this.props.zhuhuInfo)
    const {
      name,
      industry,
      tenantType,
      username,
      nickname,
      phone,
      email,
      password,
      createUserNum,
      validityStartTime,
      validityEndTime
    } = this.props.zhuhuInfo

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    return (<Form {...formItemLayout}>
      <Row>
        <Col span={24}>
          <FormItem label="公司名称">
            {getFieldDecorator('name', {
              initialValue: name || '',
              rules: [{
                required: true,
                message: '公司名称不能为空'
              }, {
                whitespace: true,
                message: '不能全部为空格'
              }, {
                pattern: /^.{1,40}$/, message: '公司名称限制40字符'
              }]
            })(
              <Input placeholder="公司名称" />
            )}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem label="行业">
            {getFieldDecorator('industry', {
              initialValue: industry && industry.toString() || undefined,
              rules: [{
                required: true,
                message: '行业不能为空'
              }, {
                whitespace: true,
                message: '不能全部为空格'
              }]
            })(
              <Select style={{ width: '100%' }} placeholder="行业">
                {
                  this.props.industrys.map((item) => {
                    return (<Option value={`${item.id}`}>{item.value}</Option>)
                  })
                }
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem label="租户类型">
            {getFieldDecorator('tenantType', {
              initialValue: (tenantType && tenantType.toString()) || "1",
              rules: [{
                required: true,
                message: '租户类型不能为空'
              }, {
                whitespace: true,
                message: '不能全部为空格'
              }]
            })(
              <Select style={{ width: '100%' }} >
                <Option value="1">创建试用租户</Option>
                <Option value="2" disabled>注册试用租户</Option>
                <Option value="3">正式租户</Option>
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem label="租户管理员用户名">
            {getFieldDecorator('username', {
              initialValue: username || '',
              rules: [{
                required: true,
                message: '租户管理员用户名不能为空'
              }, {
                whitespace: true,
                message: '不能全部为空格'
              }, {
                pattern: /^.{1,10}$/, message: '管理员用户名限制10字符'
              }]
            })(
              <Input placeholder="租户管理员用户名" />
            )}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem label="租户管理员姓名">
            {getFieldDecorator('nickname', {
              initialValue: nickname || undefined,
              rules: [{
                required: true,
                message: '租户管理员姓名不能为空'
              }, {
                whitespace: true,
                message: '不能全部为空格'
              }, {
                pattern: /^.{1,10}$/, message: '管理员姓名限制10字符'
              }]
            })(
              <Input placeholder="租户管理员姓名" />
            )}
          </FormItem>
        </Col>


        <Col span={24}>
          <FormItem label="管理员手机号码">
            {getFieldDecorator('phone', {
              initialValue: phone || '',
              rules: [{
                required: true,
                message: '管理员手机号码不能为空'
              }, {
                pattern: /^1[3|4|5|7|8][0-9]\d{8}$/, message: '请输入正确的手机号'
              }]
            })(
              <Input placeholder="管理员手机号码" />
            )}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem label="管理员邮箱">
            {getFieldDecorator('email', {
              initialValue: email || '',
              rules: [{
                required: true,
                message: '管理员邮箱不能为空'
              }, {
                type: 'email',
                message: '邮箱格式不正确'
              }]
            })(
              <Input placeholder="管理员邮箱" />
            )}
          </FormItem>
        </Col>
        {/* 有邮箱时是修改  修改的时候不显示管理员初始密码 */}
        {
          email ? null : (
            <Col span={24}>
              <FormItem label="管理员初始密码">
                {getFieldDecorator('password', {
                  initialValue: password || undefined,
                  rules: [{
                    required: true,
                    message: '管理员初始密码不能为空'
                  }, {
                    whitespace: true,
                    message: '不能全部为空格'
                  }]
                })(
                  <Input placeholder="管理员初始密码" />
                )}
              </FormItem>
            </Col>
          )
        }

        {/* <Col span={24}>
            <FormItem label="管理员初始密码">
              {getFieldDecorator('password', {
                initialValue: password || '',
                rules: [{
                    required: true,
                    message: 'password 不能为空'
                  }]
              })(
                <Input placeholder="password" />
              )}
            </FormItem>
          </Col> */}
        <Col span={24}>
          <FormItem label="有效期">
            {getFieldDecorator('validityTime', {
              initialValue: (validityStartTime && [validityStartTime && moment(validityStartTime), validityEndTime && moment(validityEndTime)]) || undefined,
              rules: [{
                required: true,
                message: '有效期不能为空'
              }]
            })(
              <RangePicker style={{ width: '100%' }} />
            )}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem label="用户数量限制">
            {getFieldDecorator('createUserNum', {
              initialValue: createUserNum || '',
              rules: [{
                required: true,
                message: '用户数量限制不能为空'
              }, {
                pattern: /^[1-9][0-9]{0,8}$/,
                message: '请输入数字，并且少于9位'
              }]
            })(
              <Input placeholder="用户数量限制" />
            )}
          </FormItem>
        </Col>
      </Row>
    </Form>)
  }
}

export default Form.create()(addZhuhusClass)