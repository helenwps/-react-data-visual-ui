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
    console.log("validNoticeDetail",validNoticeDetail)
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    return (<Form {...formItemLayout}>
      <Row>
        <Col span={24}>
          <FormItem label="邮件主题">
            {getFieldDecorator('title', {
              initialValue: this.props.validNoticeDetail.title || "",
              rules: [{
                required: true,
                message: '邮件主题不能为空'
              }]
            })(
              <Input placeholder="邮件主题"/>
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
              initialValue:validNoticeDetail.content || "<p><span></span></p>",
              rules: [{
                required: true,
                message: '邮件正文不能为空'
              }]
            })(
              <RichText />
            )}
          </FormItem>
        </Col>
        
      </Row>
    </Form>)
  }
}

export default Form.create()(ValidNoticeFormClass)