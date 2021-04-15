import React, {useEffect, useRef} from 'react';
import { Form, Input } from 'antd'
import { FormComponentProps } from 'antd/es/form';

class CreateName extends React.Component<any> {
    componentDidMount () {
        const {setFieldsValue} = this.props.form
        const { name, description} = this.props
        setFieldsValue({name, description})
    }
    public render() {
        const { getFieldDecorator, setFieldsValue } = this.props.form
        const { name, description} = this.props
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 18 },
            },
        };
        return (
            <div>
                <Form {...formItemLayout} labelAlign="left">
                    <Form.Item label="名称">
                        {getFieldDecorator('name', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入名字',
                                },
                                {
                                    min: 1,
                                    max: 20,
                                    message: '名称长度不超过20位'
                                },
                            ],
                        })(<Input />)}
                    </Form.Item>
                    <Form.Item label="描述">
                        {getFieldDecorator('description')(<Input />)}
                    </Form.Item>
                </Form>
            </div>
        )
    }
}
export default Form.create({ name: 'createName' })(CreateName)