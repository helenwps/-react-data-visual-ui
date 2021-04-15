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
  Modal,
  TreeSelect
} from 'antd'
import moment from 'moment';
const FormItem = Form.Item
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TreeNode } = TreeSelect;


//获取父亲id
const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};


class addDepartmentModalClass extends React.Component<any, any> {
  state = {
    value: undefined,
    searchValue: '',
    expandedKeys: [],
    autoExpandParent: true,
  };

  //选择组织
  onChange = value => {
    console.log(value);
    this.setState({ value });
  };

  //搜索组织
  onSearch = value => {
    const expandedKeys = this.props.departmentsList
      .map(item => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, this.props.departments);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
      // debugger
    this.setState({
      // expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  };

  public render() {
    // debugger
    const { getFieldDecorator } = this.props.form
    const {
      name,
    } = this.props

    const {searchValue} = this.state

    const loop = data =>
      data.map(item => {
        const index = item.title.indexOf(searchValue);
        const beforeStr = item.title.substr(0, index);
        const afterStr = item.title.substr(index + searchValue.length);
        const title =
          index > -1 ? (
            <span>
              {beforeStr}
              <span style={{ color: '#f50' }}>{searchValue}</span>
              {afterStr}
            </span>
          ) : (
              <span>{item.title}</span>
            );
        if (item.children) {
          return (
            <TreeNode key={item.key} title={item.title} value={item.title}>
              {loop(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode key={item.key} title={item.title}  value={item.title}/>;
      });

    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    console.log(loop(this.props.departments))
    // debugger
    return (<Form {...formItemLayout} labelAlign="left">
      <Row>
        <Col span={24}>
          <FormItem label="部门名称">
            {getFieldDecorator('name', {
              initialValue: this.props.editDepartment.name || undefined,
              rules: [{
                required: true,
                message: '部门名称不能为空'
              },{
                whitespace: true,
                message: '不能全部为空'
              }
            
              ]
            })(
              <Input placeholder="部门名称" />
            )}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem label="部门所属上级部门">
            {getFieldDecorator('parentId', {
              initialValue: this.props.editDepartment.parentId,
              rules: [{
                required: true,
                message: '上级部门不能为空'
              }]
            })(
              <TreeSelect
                showSearch
                style={{ width: '100%' }}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder="请选择"
                allowClear
                treeDefaultExpandAll
                onChange={this.onChange}
                // onSearch={this.onSearch}
                // searchValue={searchValue}
                treeData={this.props.departments}
                treeNodeFilterProp="title"  
              >
                {/* {loop(this.props.departments)} */}
                {/* <TreeNode value="parent 1" title="parent 1" key="0-1">
                  <TreeNode value="parent 1-0" title="parent 1-0" key="0-1-1">
                    <TreeNode value="leaf1" title="my leaf" key="random" />
                    <TreeNode value="leaf2" title="your leaf" key="random1" />
                  </TreeNode>
                  <TreeNode value="parent 1-1" title="parent 1-1" key="random2">
                    <TreeNode value="sss" title={<b style={{ color: '#08c' }}>sss</b>} key="random3" />
                  </TreeNode>
                </TreeNode> */}
              </TreeSelect>
            )}
          </FormItem>
        </Col>
      </Row>
    </Form>)
  }
}

export default Form.create()(addDepartmentModalClass)