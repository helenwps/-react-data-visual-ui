import React from 'react'
import { Form, Input, Icon, Button, Select, Row, Col, Upload, message } from 'antd'
import styles from '../View.less'
import RenameFieldStyle from './RenameField.less'
import { getToken } from 'utils/request'
import api from 'utils/api'
import { FormComponentProps } from 'antd/lib/form'
import { deepCopy } from 'containers/View/util'
let id = 0;
let keysInit = []
import UtilStyle from 'assets/less/util.less'


interface RenameFieldProps extends FormComponentProps{
  form: any
  model: any
  editingView: any
}

interface RenameFieldState {
  renames: any
  files: any
}

class RenameField extends React.Component<RenameFieldProps, RenameFieldState> {
  constructor(props) {
    super(props)
  }
  private initData = (initName: any[]) => {
    const myInitName = deepCopy(initName) as any[]
    id = 0;
    keysInit = []
    id = myInitName.length
    for (let i = 0; i < id; ++i) {
      keysInit.push(i)
    }
    const form = this.props.form
    form.resetFields()
    console.log(myInitName, 'initName')
    this.setState({
      renames: myInitName,
      files: []
    })
  }
  state = {
    renames: [],
    files: []
  }
  componentDidMount() {
    this.initData(JSON.parse(this.props.editingView?.rename || '[]'))
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
        const { keys, names } = values;
        console.log('Received values of form: ', values);
        console.log('Merged values:', keys.map(key => names[key]));
      }
    });
  };

  private preventUpload = (file) => {
    console.log(file, 'file')
    const {name} = file
    const suffix = name.split('.')[name.split('.').length - 1]
    console.log(suffix, 'suffix')
    if (suffix !== 'xsl' && suffix !== 'xlsx' && suffix !== 'csv') {
      message.warning('请选择正确的文件！')
      return false
    }
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      message.warning('请选择小于50M的文件！')
      return false
    }
    this.setState({
      files: [file]
    })
    return true
  }

  private onRemove = () => {
    // 只有一个文件，先简单删除
    this.setState({
      files: []
    })
  }
  private isDisabled = (item):boolean => {
    const {names = []} = this.props.form.getFieldsValue()
    return names.findIndex(row => row?.old === item[0]) !== -1
  }

  private uploadChange = (info) => {
    console.log(info, 'info')
    const {file} = info
    const {status} = file
    if (status === 'done') {
      // 更新列表数据
      console.log(file.response, 'file.response')
      this.initData(file.response.payload || [])
      message.success('上传成功！');
    } else if (status === 'error') {
      this.setState({
        files: []
      })
      message.error('上传失败！');
    }

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
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };

    const TOKEN = { Authorization: getToken() }

    console.log(this.props.model, keysInit, this.state.renames, '1121221')
    getFieldDecorator('keys', { initialValue: keysInit });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => {
      // let key = rename.key
      return (
        <Row key={k} className={RenameFieldStyle.RenameField}>
          <Col span={10}>
            <Form.Item
              {...formItemLayout}
              label={'原列名'}
              key={k}
            >
              {
                getFieldDecorator(`names[${k}]['old']`, {
                  initialValue: this.state.renames[k] && this.state.renames[k].old || undefined,
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
                      return <Select.Option value={`${item[0]}`} disabled={this.isDisabled(item)} key={index}>{item[0]}</Select.Option>
                    })
                  }
                </Select>)
              }

            </Form.Item>
          </Col>
          <Col span={10} offset={1}>
            <Form.Item
              {...formItemLayout}
              label={'新列名'}
              key={`new_${k}`}
            >
              {getFieldDecorator(`names[${k}]['new']`, {
                initialValue: this.state.renames[k] && this.state.renames[k].new || undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "必填项",
                  },
                ],
              })(<Input placeholder="" maxLength={20} style={{ width: '100%', }} />)}

            </Form.Item>
          </Col>
          <Col span={1}>
            {/* {keys.length > 1 ? ( */}
            <Icon
              className={"dynamic-delete-button"}
              type="minus-circle-o"
              onClick={() => this.remove(k)}
            />
            {/* ) : null} */}
          </Col>
        </Row>

      )
    });
    return (
      <div className={RenameFieldStyle.RenameField}>
        <div className={RenameFieldStyle.tip}>在后续创建的图表中将显示更改后的列名</div>
        <div className={UtilStyle.flagTitle}>单个更改列名</div>
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

          <div className={UtilStyle.flagTitle} style={{paddingBottom: 10}}>批量列名更改</div>
          <Row>
            <Col span={20}>
                <Upload
                  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  multiple={false}
                  data={{col: Object.keys(this.props.model).join()}}
                  fileList={this.state.files}
                  beforeUpload={this.preventUpload}
                  headers={TOKEN}
                  action={api.uploadRename}
                  onChange={this.uploadChange}
                  onRemove={this.onRemove}
                >
                  <Button style={{ padding: '0 10px' }} type="dashed">
                    {/* <Icon type="upload" /> */}
                    <i className="iconfont" style={{ lineHeight: '20px', verticalAlign: 'bottom' }}>&#xe6eb;</i>
                    <span style={{ marginLeft: '5px' }}>点击上传批量列名更改文档</span>
                  </Button>
                </Upload>
              <div className={RenameFieldStyle.tip} style={{paddingBottom: 0, marginTop: 5}}>
                支持xls、xlsx格式，小于50M
                <a href="void:(0)" onClick={()=>{window.open(`/ext/rename.xlsx`,"blank")}}>下载模板</a>
              </div>

            </Col>
          </Row>
        </Form>
      </div>

    );
  }
}

export default Form.create<RenameFieldProps>({ name: 'dynamic_form_item' })(RenameField);
