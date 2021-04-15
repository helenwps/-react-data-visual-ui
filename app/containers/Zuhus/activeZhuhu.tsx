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
  const {  RangePicker } = DatePicker;

class activeZhuhuClass extends React.Component {
    public render(){
        const { getFieldDecorator } = this.props.form
        console.log(this.props)
        const {
          activeZhuhu
        } = this.props

        const active = (
        
        
        <Form>
          <Row>
            <Col span={24}>确认需要启用此租户？</Col>
          
            <Col span={24}>
              <FormItem label="有效期设置">
                {getFieldDecorator('validityTime', {
                  initialValue: undefined,
                  rules: [{
                      required: true,
                      message: '有效期不能为空'
                    }]
                })(
                  <RangePicker  />
                )}
              </FormItem>
            </Col>
            <Col span={24}>有效期包括开始时间和结束时间当天</Col>
          </Row>
        </Form>)

        const forbiden = (
          <div> 

          <p>确认需要禁用此租户？</p>
          <p>租户相关信息：</p>
          <p>公司名称：{activeZhuhu.name}</p>
        <p>有效期：{activeZhuhu.validityStartTime.slice(0,10)} ~ {activeZhuhu.validityEndTime.slice(0,10)}</p>
          
          
          

          </div>
          )

        return activeZhuhu.status == 1 ? forbiden:active
    }
}

export default Form.create()(activeZhuhuClass)