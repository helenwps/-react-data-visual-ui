import React, { useCallback, useEffect, useState } from 'react'
import { Row, Col, Switch, Select } from 'antd'
const Option = Select.Option
const styles = require('../Workbench.less')

interface tableConfigProps {
    onChange: any
    data: any
}

const step = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
export const Povit: React.FC<tableConfigProps> = (props) => {
    const {sampling, stride, calculation, frequency, isConfig} = props.data
    const [open, setOpen] = useState(isConfig?.value.v || false)
    useEffect(() => {
        setOpen(isConfig?.value.v || false)
    }, [isConfig])
    const changeData = (prop) => (value) => {
        if (prop == 'isConfig') setOpen(!open)
        props.onChange(prop, value)
    }
    return (
        <div className={styles.dropbox}>
            <p className={styles.title}><span>是否开启配置</span><Switch checked={open} size="small" onChange={changeData('isConfig')} /></p>
            {open &&
                <div>
                    <p className={styles.title}>数据采样方式</p>
                    <Select style={{ width: '100%'}} onChange={changeData('sampling')} value={sampling.value.v}>
                        <Option value="窗口采样">窗口采样</Option>
                        <Option value="自定义间隔采样">自定义间隔采样</Option>
                    </Select>
                    <p className={styles.title}>采样步长</p>
                    <Select style={{ width: '100%'}} value={stride.value.v} onChange={changeData('stride')}>
                        {step.map((num) => <Option value={num} key={num}>{num}</Option>)}
                    </Select>
                    <p className={styles.title}>采样计算方式</p>
                    <Select style={{ width: '100%'}} value={calculation.value.v} onChange={changeData('calculation')}>
                        <Option value="和">和</Option>
                        <Option value="均值">均值</Option>
                        <Option value="最大值">最大值</Option>
                        <Option value="最小值">最小值</Option>
                    </Select>
                    <p className={styles.title}>刷新频率</p>
                    <Select style={{ width: '100%', marginBottom: '10px' }} value={frequency.value.v} onChange={changeData('frequency')}>
                        <Option value={5}>5s</Option>
                        <Option value={10}>10s</Option>
                        <Option value={15}>15s</Option>
                    </Select>
                </div>
            }
        </div>

    )
}