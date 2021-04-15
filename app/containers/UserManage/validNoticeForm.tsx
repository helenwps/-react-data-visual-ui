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
import { RichText, RichTextNode } from 'components/RichText'

import moment from 'moment';
const FormItem = Form.Item
const { Option } = Select;
const { RangePicker } = DatePicker;

class ValidNoticeFormClass extends React.Component {


  public render() {
    const { getFieldDecorator } = this.props.form
    console.log(this.props.validNoticeDetail)
    const {
      validNoticeDetail
    } = this.props
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    return (<Form {...formItemLayout}>
      <Row>
        <Col span={24}>
          <FormItem label="邮件主题">
            {getFieldDecorator('title', {
              initialValue: this.props.validNoticeDetail.title || "<h1>标题</h1>",
              rules: [{
                required: true,
                message: '邮件主题不能为空'
              }]
            })(
              <Input placeholder="请输入"/>
            )}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem label="收件人">
            {getFieldDecorator('to', {
              initialValue: (validNoticeDetail.to && validNoticeDetail.to.split(";")) || undefined,
              rules: [{
                required: true,
                message: '收件人不能为空'
              }]
            })(
              <Select mode="tags" style={{ width: '100%' }} placeholder="收件人" >
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem label="抄送人">
            {getFieldDecorator('cc', {
              initialValue: (validNoticeDetail.cc && validNoticeDetail.cc.split(";")) || undefined,
              // rules: [{
              //     required: true,
              //     message: '抄送人 不能为空'
              //   }]
            })(
              <Select mode="tags" style={{ width: '100%' }} placeholder="抄送人" >
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem label="邮件正文">
            {getFieldDecorator('content', {
              initialValue: this.props.validNoticeDetail.content || "<h1>标题</h1>",
              rules: [{
                required: true,
                message: 'content 不能为空'
              }]
            })(
              <RichText />
            )}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem label="频率">
            <p>正式租户，有效期截止日期前2个月开始，每周发送一次</p>

            <p>创建试用租户或注册试用租户，有效截止日期前2周开始，每3天发送一次</p>
          </FormItem>
        </Col>
      </Row>
    </Form>)
  }
}

export default Form.create()(ValidNoticeFormClass)