import React from 'react'
import { Form, Input, Icon, Button, Select, Row, Col, Upload ,message} from 'antd';
import styles from '../View.less'

let id = 0;
let keysInit = []
import OrderFieldStyle from './OrderField.less'

class DynamicFieldSet extends React.Component {
  constructor(props) {
    super(props)
    let orders = [
      {field:"email",order:"desc"},
      {field:"id",order:"asc"},
    ]
    orders = this.props.editingView.order || "[]"
    orders = JSON.parse(orders)
    this.orders = orders
    id = orders.length
    for (let i = 0; i < id; ++i) {
      keysInit.push(i)
    }
    // keysInit = [0,1,2]
    console.log("constructor")
    console.log(keysInit)
    // this.state = {
    //   files: []
    // }

  }
  componentWillUnmount = () => {
    id = 0;
    keysInit = []
  }
  remove = k => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    // We need at least one passenger
    // if (keys.length === 1) {
    //   return;
    // }
    console.log(keys, k)

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  };

  add = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    if (keys.length === 3) {
      message.info("只能对3个字段排序")
      return;
    }
    const nextKeys = keys.concat(id++);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys,
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { keys, orders } = values;
        console.log('Received values of form: ', values);
        console.log('Merged values:', keys.map(key => orders[key]));
      }
    });
  };

  private preventUpload = (file) => {
    this.setState({
      files: [file]
    })
    return false
  }

  private isDisabled = (item):boolean => {
    const {orders = []} = this.props.form.getFieldsValue()
    console.log(orders, item, this.props.form.getFieldsValue(), '11111')
    return orders.findIndex(row => row?.field === item[0]) !== -1
  }


  private onRemove = () => {
    // 只有一个文件，先简单删除
    this.setState({
      files: []
    })
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 8 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 16 },
        sm: { span: 16 },
      },
    };

    const formItemLayoutSort = {
      labelCol: {
        xs: { span: 8 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 16 },
        sm: { span: 16 },
      },
    }

    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };

    console.log(this.props.model)
    getFieldDecorator('keys', { initialValue: keysInit });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => {
      // let key = rename.key
      return (
        <Row key={k} className={OrderFieldStyle.orderField}>
          <Col span={10}>
            <Form.Item
              {...formItemLayout}
              label={'排序依据'}
              key={k}
            >
              {
                getFieldDecorator(`orders[${k}]['field']`, {
                  initialValue: this.orders[k] && this.orders[k].field || undefined,
                  rules: [
                    {
                      required: true,
                      whitespace: true,
                      message: "必填项",
                    },
                  ],
                })(<Select placeholder="" style={{ width: '100%', }} >
                  {
                    Object.entries(this.props.model).map((item, index) => {
                      console.log(item)
                      if(!["timestamp","bigint", "tinyint", "smallint", "decimal", "double", "smallmoney", "money", "float", "real", "datetime", "datetime2", "smalldatetime", "time", "timestamp", "datetimeoffset", "float32", "float64", "int8", "int16", "int32", "int64", "date", "datetime", "uint8", "uint16", "uint32", "uint64"].includes(item[1].sqlType.toLowerCase())){
                        return null
                      }
                      return <Select.Option value={`${item[0]}`} disabled={this.isDisabled(item)} key={index}>{item[0]}</Select.Option>
                    })
                  }
                </Select>)
              }

            </Form.Item>
          </Col>
          <Col span={10} offset={1}>
            <Form.Item
              {...formItemLayoutSort}
              label={'排序方式'}
              key={`new_${k}`}
            >
              {getFieldDecorator(`orders[${k}]['order']`, {
                initialValue: this.orders[k] && this.orders[k].order || undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "必填项",
                  },
                ],
              })(
                <Select placeholder="" style={{ width: '100%', }} >
                  <Select.Option value={`desc`} key={index}>从大到小</Select.Option>
                  <Select.Option value={`asc`} key={index}>从小到大</Select.Option>
                </Select>
              )}

            </Form.Item>
          </Col>
          <Col span={1}>
            {/* {keys.length > 1 ? ( */}
            <Icon
              className={OrderFieldStyle.dynamicDeleteButton}
              type="minus-circle-o"
              onClick={() => this.remove(k)}
            />
            {/* ) : null} */}
          </Col>
        </Row>

      )
    });
    return (
      <div className={OrderFieldStyle.orderField}>
        <div className={OrderFieldStyle.tip}>可对数值型或日期型数据进行排序</div>
        <Form onSubmit={this.handleSubmit}>
          {formItems}
          <Form.Item {...formItemLayoutWithOutLabel}>
            <Button type="dashed" onClick={this.add} style={{ width: '60%' }}>
              <Icon type="plus" /> 添加一组
          </Button>
          </Form.Item>
          {/* <Form.Item {...formItemLayoutWithOutLabel}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item> */}

        </Form>
      </div>

    );
  }
}

const WrappedDynamicFieldSet = Form.create({ name: 'dynamic_form_item' })(DynamicFieldSet);
export default WrappedDynamicFieldSet
