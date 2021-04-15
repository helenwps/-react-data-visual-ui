import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import FormType from 'antd/lib/form/Form'
import {
  Icon,
  Col,
  message,
  Row,
  Input,
  Form,
  Select,
  Button,
  Breadcrumb,
  Divider,
  Table,
  Popconfirm,
  Modal,
  Typography,
  Tooltip
} from 'antd'
import {
  GET_USERS,
  ADD_ZHUHU,
  EDIT_ZHUHU,
  GET_EMAIL_NOTICE,
  EDIT_VALID_NOTICE,
  GET_INDUSTRYS
} from "./constants"
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import AddUpdateZhuhuForm from './addZhuhuModal'
import ValidNoticeForm from './validNoticeForm' //有效期提醒设置
import ActiveZhuhuForm from './activeZhuhu' //有效期提醒设置
import { serialize } from 'components/RichText/Serializer'


const FormItem = Form.Item
const { Option } = Select;
const { Title } = Typography;
const styles = require('app/containers/Profile/profile.less')
import './zhuhus.less'
import { createStructuredSelector } from 'reselect'
import { makeSelectLoginUser } from '../App/selectors'
import { compose } from 'redux'


export class ZuhusClass extends React.PureComponent<any, any> {
  constructor(props) {
    super(props)
    this.state = {
      formVisible: false,
      company: '',
      tenantType: '',
      curPage: 1,
      addZhuhuVisible: false,
      formType: 'add', //租户表单类型  添加/修改
      zhuhuInfo: {}, //一个租户信息
      activeZhuhuVisible: false,
      emailNoticeVisible: false
    }
  }

  private activeZhuhu = {} //一条激活租户信息

  private refHandles = {
    addZhuForm: (ref) => this.addZhuForm = ref,
    validNoticeForm: (ref) => this.validNoticeForm = ref,
    activeZhuhuForm: (ref) => this.activeZhuhuForm = ref,
  }

  componentDidMount = () => {
    this.getZuhuList()
    //获取行业列表
    this.props.getIndustrys()
  }
  getZuhuList = (params = {}) => {
    const { company, tenantType } = { ...this.state, ...params }
    this.props.getZuhuList(company, tenantType)
  }
  onChange = (page) => {
    this.setState({
      curPage: page
    })
  }


  submit = () => {
    // e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
      if (!err) {
        this.getZuhuList(values)
      }
    });
  };


  //隐藏 添加租户modal
  hideaddZhuhuModal = () => {
    this.setState({
      addZhuhuVisible: false
    })
  }

  //添加租户
  showaddZhuhuModal = () => {
    this.setState({
      formType: "add",
      zhuhuInfo: {},
      addZhuhuVisible: true
    })
  }
  //编辑租户
  private showEditZhuhuModal = (text, record) => {
    console.log(text, record)
    this.setState({
      formType: "edit",
      zhuhuInfo: record,
      addZhuhuVisible: true
    })
  }

  handleOk = e => {
    console.log(this)
    this.addZhuForm.props.form.validateFields((err, values) => {
      if (!err) {
        values.validityStartTime = values.validityTime[0]
        values.validityEndTime = values.validityTime[1]
        delete values.validityTime
        console.log("values", values)
        const loginUserId = this.props.loginUser.id
        if (this.state.formType == "add") {
          //添加租户
          this.props.addZhuhu({
            ...values,
            createBy: loginUserId,
            admin: true,
            userType: 2

          }, () => {
            this.hideaddZhuhuModal()
            this.submit()
          })
        } else {
          //修改租户
          this.props.editZhuhu({
            ...values,
            id: this.state.zhuhuInfo.id,  //公司租户id
            userId: this.state.zhuhuInfo.userId, //管理员id
            updateBy: loginUserId,
            // admin: true
          }, () => {
            this.hideaddZhuhuModal()
            this.submit()
          })
        }
        // this.setState({
        //   addZhuhuVisible: false,
        // });
      }
    })
  };

  showActiveZhuhuModal = (record) => {
    console.log("record", record)
    this.activeZhuhu = record
    this.setState({
      activeZhuhuVisible: true,
    });
  }

  //隐藏激活租户模态框
  hideActiveZhuhuModal = () => {
    this.setState({
      activeZhuhuVisible: false,
    });
  }

  doActiveZhuhu = () => {
    //禁止
    if (this.activeZhuhu.status == 1) {
      const loginUserId = this.props.loginUser.id
      this.props.editZhuhu({
        id: this.activeZhuhu.id,
        updateBy: loginUserId,
        status: 2
      }, () => {
        this.hideActiveZhuhuModal()
        this.submit()
      })
    } else {
      //开启
      this.activeZhuhuForm.props.form.validateFields((err, values) => {
        if (!err) {
          // console.log(values.validityTime)
          values.validityStartTime = values.validityTime[0]
          values.validityEndTime = values.validityTime[1]
          const loginUserId = this.props.loginUser.id
          console.log(values)
          this.props.editZhuhu({
            ...values,
            id: this.activeZhuhu.id,
            updateBy: loginUserId,
            status: 1
          }, () => {
            this.hideActiveZhuhuModal()
            this.submit()
          })
        }
      })
    }

  }




  //显示有效期提醒模态框
  showEditEmailNoticeModal = (text, record) => {
    this.props.loadMailNoticeDetail(record.id)
    this.setState({
      emailNoticeVisible: true
    })
    this.validNoticeId = record.id

  }

  //提交有效期提醒数据
  doEditEmailNotice = () => {
    //根据belongerId 是否是0 来判断是模板还是自己的   
    // 如果是0模板，提交数据就是新增，把提醒行的id字段去掉；否则就提供id字段表示更新
    // belongerId  邮件属于谁
    // createBy  或者 updateBy  指超级管理员


    this.validNoticeForm.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("values``````", values)

        let validNoticeDetail = this.props.validNoticeDetail
        if (validNoticeDetail.belongerId == 0) {
          delete validNoticeDetail.id

          validNoticeDetail.createBy = this.props.loginUser.id
        } else {
          validNoticeDetail.updateBy = this.props.loginUser.id
        }
        validNoticeDetail.belongerId = this.validNoticeId
        console.log("values", values)
        validNoticeDetail = { ...validNoticeDetail, ...values }
        if (typeof validNoticeDetail.content != "string") {
          validNoticeDetail.content = serialize(validNoticeDetail.content)
        }
        if (typeof validNoticeDetail.to != "string") {
          validNoticeDetail.to = validNoticeDetail.to.join(";")
        }
        if (validNoticeDetail.cc && (typeof validNoticeDetail.cc != "string")) {
          validNoticeDetail.cc = validNoticeDetail.cc.join(";")
        }
        let emptyReg = /^(<p><span>(\s)*<\/span><\/p>)*$/
        if (validNoticeDetail.content == "<p><span></span></p>" || emptyReg.test(validNoticeDetail.content)) {
          return message.error("请填写邮件正文")
        }

        this.props.editValidNoticeDetail(validNoticeDetail, () => {
          this.hideValidNoticeModal()
        })
      }
    })
  }

  hideValidNoticeModal = () => {
    this.setState({
      emailNoticeVisible: false
    })
  }



  public render() {
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
    };
    const formTailLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 8, offset: 4 },
    };
    const { getFieldDecorator } = this.props.form
    const addUpdateZhuhuTitle = this.state.formType == "add" ? "新增租户" : "修改"

    const columns = [
      {
        title: '租户ID',
        key: 'id',
        dataIndex: 'id',
      },
      {
        title: '公司名称',
        key: 'name',
        dataIndex: 'name',
        ellipsis: {
          showTitle: false,
        },
        render:(val) => <Tooltip placement="topLeft" title={val}>{val}</Tooltip>
      },
      {
        title: '行业',
        key: 'industry',
        dataIndex: 'industry',
        render: (text, record) => {
          let industry = this.props.industrys.find((item) => {
            // console.log(item,text,record)
            return item.id == text
          })
          // console.log("industry",industry)
          return (industry && industry.value) ? industry.value : "未知"
        }
      },
      {
        title: '租户类型',
        key: 'tenantType',
        dataIndex: 'tenantType',
        render: (text, record) => {
          let userTypes = {
            1: "创建试用租户",
            2: "注册试用租户",
            3: "正式租户",
          }
          return userTypes[text]
        }
      },
      {
        title: '创建时间',
        key: 'createTime',
        dataIndex: 'createTime',
        sorter: (a, b) => (a.createTime > b.createTime ? 1 : -1)
      },
      {
        title: '租户管理员姓名',
        key: 'nickname',
        dataIndex: 'nickname',
      },
      {
        title: '管理员手机号码',
        key: 'phone',
        dataIndex: 'phone',
      },
      // {
      //   title: '管理员邮箱',
      //   key: 'email',
      //   dataIndex: 'email',
      // },
      // {
      //   title: '有效期',
      //   key: 'validityEndTime',
      //   dataIndex: 'validityEndTime',
      //   render:(text, record)=>{
      //     return `${record.validityStartTime.slice(0,10)}~${record.validityEndTime.slice(0,10)}`
      //   }
      // },
      // {
      //   title: '用户数量限制',
      //   key: 'createUserNum',
      //   dataIndex: 'createUserNum',
      // },
      {
        title: '操作',
        dataIndex: 'address9',
        key: 'address9',
        fixed: 'right',
        align: 'center',
        render: (text, record) => (
          <span>
            <a href="javascript:;" onClick={() => this.showActiveZhuhuModal(record)}>{record.status == 1 ? "禁用" : "启用"}</a>
            <Divider type="vertical" />
            <a href="javascript:;" onClick={() => this.showEditZhuhuModal(text, record)}>编辑</a>
            <Divider type="vertical" />
            <a href="javascript:;" onClick={() => this.showEditEmailNoticeModal(text, record)}>有效期提醒设置</a>

          </span>
        )
      },
    ];
    const {
      formVisible,
      addZhuhuVisible,
      emailNoticeVisible,
      activeZhuhuVisible
    } = this.state

    const activeZhuhu = this.activeZhuhu
    return (
      <div className="leaseholder">
        <div className={styles.header}>
          租户列表
        </div>
        {/* <Divider className={styles.antDividerHorizontal}></Divider> */}
        <div style={{ padding: '20px' }}>
          <Form {...formItemLayout} labelAlign="left" name="dynamic_rule">
            <Row >
              <Col span={8} key={1}>
                <Form.Item
                  label={`公司名称`}
                >
                  {getFieldDecorator('company', {})(
                    <Input />
                  )}
                </Form.Item>
              </Col>
              <Col span={8} key={2}>
                <Form.Item
                  label={`租户类型`}
                >
                  {getFieldDecorator('tenantType', {
                    initialValue: '',
                  })(
                    <Select style={{ width: '100%' }} >
                      <Option value="" >全部</Option>
                      <Option value="1">创建试用租户</Option>
                      <Option value="2">注册试用租户</Option>
                      <Option value="3">正式租户</Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8} key={3}>

                <Form.Item
                  {...{
                    labelCol: { span: 0 },
                    wrapperCol: { span: 24, offset: 20 },
                  }}
                >
                  <Button type="primary" onClick={this.submit}>
                    查询
                </Button>

                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Button type="primary" onClick={() => this.showaddZhuhuModal()} style={{ marginBottom: '15px' }}>
               <i className="iconfont" style={{fontSize:'12px'}}>&#xe712;</i> 新增租户
              </Button>
            </Row>
          </Form>



          <Table
            // scroll={{ x: 2000 }}
            columns={columns}
            dataSource={this.props.users}
            pagination={{
              current: this.state.curPage,
              onChange: this.onChange,
              showQuickJumper: true,
              // showSizeChanger:true,
              // pageSize:1,
              showTotal: (total) => `${total}条`
            }}
            loading={this.props.loading}
          />
        </div>


        {
          activeZhuhuVisible && (
            <Modal
              title={activeZhuhu && activeZhuhu.status == 1 ? "禁用" : "启用"}
              visible={activeZhuhuVisible}
              onCancel={() => this.hideActiveZhuhuModal()}
              onOk={this.doActiveZhuhu}
              // width={'80%'}
              maskClosable={false}
            >
              <ActiveZhuhuForm
                wrappedComponentRef={this.refHandles.activeZhuhuForm}
                activeZhuhu={activeZhuhu}
              />
            </Modal>
          )
        }

        {
          addZhuhuVisible && (<Modal
            title={addUpdateZhuhuTitle}
            visible={addZhuhuVisible}
            onCancel={() => this.hideaddZhuhuModal()}
            onOk={this.handleOk}
            maskClosable={false}
          >
            <AddUpdateZhuhuForm
              wrappedComponentRef={this.refHandles.addZhuForm}
              zhuhuInfo={this.state.zhuhuInfo}
              industrys={this.props.industrys}
            />
          </Modal>)
        }



        {
          emailNoticeVisible && (
            <Modal
              title={"邮件提醒"}
              visible={emailNoticeVisible}
              onCancel={() => this.hideValidNoticeModal()}
              onOk={this.doEditEmailNotice}
              // width={'80%'}
              maskClosable={false}
            >
              <ValidNoticeForm
                wrappedComponentRef={this.refHandles.validNoticeForm}
                validNoticeDetail={this.props.validNoticeDetail}
              />
            </Modal>
          )
        }



      </div>
    )
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    getZuhuList: (companyName, zuhuType, resolve) => dispatch({
      type: GET_USERS,
      payload: {
        companyName,
        zuhuType,
        resolve
      }
    }),
    addZhuhu: (formdata, resolve) => dispatch({
      type: ADD_ZHUHU,
      payload: {
        formdata,
        resolve
      }
    }),
    editZhuhu: (formdata, resolve) => dispatch({
      type: EDIT_ZHUHU,
      payload: {
        formdata,
        resolve
      }
    }),
    getIndustrys: () => dispatch({
      type: GET_INDUSTRYS,
      payload: {

      }
    }),
    //获取租户邮件提醒
    loadMailNoticeDetail: (id) => dispatch({
      type: GET_EMAIL_NOTICE,
      payload: {
        id
      }
    }),

    //修改有效期提醒
    editValidNoticeDetail: (formdata, resolve) => dispatch({
      type: EDIT_VALID_NOTICE,
      payload: {
        formdata,
        resolve
      }
    })

  }
}

const mapStateToProps = createStructuredSelector({
  loginUser: makeSelectLoginUser(),
  users: (state) => state.zhuhus.users,
  loading: (state) => state.zhuhus.loading,
  validNoticeDetail: (state) => state.zhuhus.validNoticeDetail,
  industrys: (state) => state.zhuhus.industrys,
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducerZhuhu = injectReducer({ key: 'zhuhus', reducer })
const withSagaZhuhu = injectSaga({ key: 'zhuhus', saga })

export const Zuhus = compose(
  withReducerZhuhu,
  withSagaZhuhu,
  withConnect
)(Form.create()(ZuhusClass))
