import React, { useCallback, useEffect, useMemo } from 'react'
import { Row, Col, Select, Checkbox, InputNumber, Collapse, Input, Button, Radio, Switch } from 'antd'
import ColorPicker from 'components/ColorPicker'

const { Panel } = Collapse
const Option = Select.Option
const styles = require('../Workbench.less')
import { IAxisConfig } from './AxisSection'
import { PIVOT_CHART_FONT_FAMILIES, PIVOT_CHART_LINE_STYLES, PIVOT_CHART_FONT_SIZES } from 'app/globalConstants'

interface StyleProps {
    config: IAxisConfig
    title?: string
    onChange: (value: string | number, propPath: string[]) => void
    onSplitChange?: (value: string | number, propPath: string[]) => void
    splitConfig?: any
}
const lineStyles = PIVOT_CHART_LINE_STYLES.map((l) => (
    <Option key={l.value} value={l.value}>{l.name}</Option>
))
const fontFamilies = PIVOT_CHART_FONT_FAMILIES.map((f) => (
    <Option key={f.value} value={f.value}>{f.name}</Option>
))
const fontSizes = PIVOT_CHART_FONT_SIZES.map((f) => (
    <Option key={`${f}`} value={`${f}`}>{f}</Option>
))
export const XCoordinate: React.FC<StyleProps> = (props) => {
    const { title } = props
    const { lineStyle, lineSize, lineColor, labelFontFamily, labelFontSize, labelColor } = props.config
    const checkboxChange = (prop) => (e) => {
        props.onChange(prop, e.target.checked)
    }


    const selectChange = (prop) => (value) => {
        props.onChange(prop, value)
    }
    const changeName = (prop) => (e) => {
        props.onChange(prop, e.target.value)
    }
    const colorChange = (prop) => (color) => {
        props.onChange(prop, color)
    }
    return (
        <div className={`${styles.paramsPane} ${styles.dropPane}`}>
            {title == 'X轴设置' && <h4>坐标轴标题设置</h4>}
            <div className={styles.blockBody} data-v-coofdinate>
                <p>{title}</p>
                <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                    <Col span={10}>
                        <Select
                            placeholder="样式"
                            className={styles.blockElm}
                            value={lineStyle}
                            onChange={selectChange('lineStyle')}
                            style={{ width: '100%' }}

                        >
                            {lineStyles}
                        </Select>
                    </Col>
                    <Col span={10}>
                        <Select
                            placeholder="粗细"
                            className={styles.blockElm}
                            value={lineSize}
                            onChange={selectChange('lineSize')}
                            style={{ width: '100%' }}
                        >
                            {Array.from(Array(10), (o, i) => (
                                <Option key={i} value={`${i + 1}`}>{i + 1}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <ColorPicker
                            value={lineColor}
                            onChange={colorChange('lineColor')}
                        />
                    </Col>
                </Row>
                <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                    <Col span={10}>
                        <Select
                            placeholder="字体"
                            className={styles.blockElm}
                            value={labelFontFamily}
                            onChange={selectChange('labelFontFamily')}
                            style={{ width: '100%' }}
                        >
                            {fontFamilies}
                        </Select>
                    </Col>
                    <Col span={10}>
                        <Select
                            placeholder="文字大小"
                            className={styles.blockElm}
                            value={labelFontSize}
                            onChange={selectChange('labelFontSize')}
                            style={{ width: '100%' }}
                        >
                            {fontSizes}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <ColorPicker
                            value={labelColor}
                            onChange={colorChange('labelColor')}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    )
}
const sizes = new Array(32)
for (let i = 0; i < sizes.length; i++) {
    sizes[i] = i
}
const splitKeys = ['showHorizontalLine', 'horizontalLineStyle', 'horizontalLineSize', 'horizontalLineColor', 'showVerticalLine', 'verticalLineStyle', 'verticalLineSize', 'verticalLineColor']
export const ShowScatter: React.FC<StyleProps> = (props) => {
    const { showHorizontalLine,
        horizontalLineStyle,
        horizontalLineSize,
        horizontalLineColor,
        showVerticalLine,
        verticalLineStyle,
        verticalLineSize,
        verticalLineColor
    } = props.splitConfig
    const { symbolSize = 10, color } = props.config
    const selectChange = (prop) => (value) => {
        if (splitKeys.includes(prop)) props.onSplitChange(prop, value)
        else props.onChange(prop, value)
    }
    const colorChange = (prop) => (color) => {
        if (splitKeys.includes(prop)) props.onSplitChange(prop, color)
        else props.onChange(prop, color)
    }
    const checkboxChange = (prop) => (e) => {
        const value = e.target.checked
        if (splitKeys.includes(prop)) props.onSplitChange(prop, value)
    }
    return (
        <div>
            <h4>样式</h4>
            <p>散点设置</p>
            <div className={styles.blockBody} data-v-coofdinate>
                <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                    <Col span={10}>
                        <Select
                            placeholder="大小"
                            className={styles.blockElm}
                            value={symbolSize}
                            onChange={selectChange('symbolSize')}
                        >
                            {sizes.map((x) => (<Option key={x} value={x}>{x}</Option>))}
                        </Select>
                    </Col>
                    <Col span={10}>
                        <ColorPicker
                            value={color}
                            onChange={colorChange('color')}
                        />
                    </Col>
                </Row>
                <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                    <Col span={24}>
                        <Checkbox
                            checked={showHorizontalLine}
                            onChange={checkboxChange('showHorizontalLine')}
                        >
                            显示横向网格线
              </Checkbox>
                    </Col>
                </Row>
                <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                    <Col span={10}>
                        <Select
                            placeholder="样式"
                            className={styles.blockElm}
                            value={horizontalLineStyle}
                            onChange={selectChange('horizontalLineStyle')}
                        >
                            {lineStyles}
                        </Select>
                    </Col>
                    <Col span={10}>
                        <Select
                            placeholder="粗细"
                            className={styles.blockElm}
                            value={horizontalLineSize}
                            onChange={selectChange('horizontalLineSize')}
                        >
                            {Array.from(Array(10), (o, i) => (
                                <Option key={i} value={`${i + 1}`}>{i + 1}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <ColorPicker
                            value={horizontalLineColor}
                            onChange={colorChange('horizontalLineColor')}
                        />
                    </Col>
                </Row>
                <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                    <Col span={24}>
                        <Checkbox
                            checked={showVerticalLine}
                            onChange={checkboxChange('showVerticalLine')}
                        >
                            显示纵向网格线
              </Checkbox>
                    </Col>
                </Row>
                <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                    <Col span={10}>
                        <Select
                            placeholder="样式"
                            className={styles.blockElm}
                            value={verticalLineStyle}
                            onChange={selectChange('verticalLineStyle')}
                        >
                            {lineStyles}
                        </Select>
                    </Col>
                    <Col span={10}>
                        <Select
                            placeholder="粗细"
                            className={styles.blockElm}
                            value={verticalLineSize}
                            onChange={selectChange('verticalLineSize')}
                        >
                            {Array.from(Array(10), (o, i) => (
                                <Option key={i} value={`${i + 1}`}>{i + 1}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <ColorPicker
                            value={verticalLineColor}
                            onChange={colorChange('verticalLineColor')}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export const PovitTable: React.FC<any> = (props) => {
    const selectChange = prop => value => props.onChange(prop, value)
    const checkboxChange = prop => e => {
        const value = e.target.checked
        props.onChange(prop, value)
    }
    const inputChange = prop => e => props.onChange(prop, e.target.value)
    const {
        fontFamily,
        fontSize,
        color,
        lineStyle,
        lineColor,
        headerBackgroundColor,
        isConfig,
        tableSize
    } = props.config
    useEffect(() => {
        if (isConfig) {
            props.onChange('width', 0)
            props.onChange('height', 0)
        }
    }, [isConfig])
    return (
        <div className={`${styles.paramsPane} ${styles.dropPane}`}>
            <h4>样式</h4>
            <div className={styles.paramsRow}>
                <p style={{ lineHeight: '32px' }}>行列转换</p>
                <div>{props.children}</div>
            </div>

            <Row key="body" gutter={8} type="flex" align="middle" className={styles.blockRow} style={{ marginBottom: '10px' }}>
                <Col span={4}>
                    <span className={styles.configTitle}>文字</span>
                </Col>
                <Col span={8}>
                    <Select
                        placeholder="字体"
                        className={styles.blockElm}
                        value={fontFamily}
                        onChange={selectChange('fontFamily')}
                        style={{ width: '100%' }}
                    >
                        {fontFamilies}
                    </Select>
                </Col>
                <Col span={8}>
                    <Select
                        placeholder="文字大小"
                        className={styles.blockElm}
                        value={fontSize}
                        onChange={selectChange('fontSize')}
                        style={{ width: '100%' }}

                    >
                        {fontSizes}
                    </Select>
                </Col>
                <Col span={4}>
                    <ColorPicker
                        value={color}
                        onChange={selectChange('color')}
                    />
                </Col>
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow} style={{ marginBottom: '10px' }}>
                <Col span={4}>
                    <span className={styles.configTitle}>边框</span>
                </Col>
                <Col span={16}>
                    <Select
                        placeholder="样式"
                        className={styles.blockElm}
                        value={lineStyle}
                        onChange={selectChange('lineStyle')}
                        style={{ width: '100%' }}
                    >
                        {lineStyles}
                    </Select>
                </Col>
                <Col span={4}>
                    <ColorPicker
                        value={lineColor}
                        onChange={selectChange('lineColor')}
                    />
                </Col>
            </Row>
            <Row gutter={8} type="flex" align="middle" className={styles.blockRow}>
                <Col span={20}>
                    <span className={styles.configTitle}>表头背景颜色</span>
                </Col>
                <Col span={4}>
                    <ColorPicker
                        value={headerBackgroundColor}
                        onChange={selectChange('headerBackgroundColor')}
                    />
                </Col>
            </Row>
            {/* <div className={styles.paramsRow}>
                <h4>表格大小</h4>
                <div style={{ lineHeight: '38px' }}>
                    <Checkbox
                        checked={isConfig}
                        onChange={checkboxChange('isConfig')}
                    >
                        自定义设置
              </Checkbox>
            </div>
            </div> */}
            {/* {!isConfig && (
                <Radio.Group value={tableSize} onChange={inputChange('tableSize')} className="coordinateRadio">
                    <Radio.Button value="1">小</Radio.Button>
                    <Radio.Button value="1.5">中</Radio.Button>
                    <Radio.Button value="2">大</Radio.Button>
                </Radio.Group>
            )}
            {isConfig && (
                <div className={styles.paramsRow} style={{ lineHeight: '30px' }}>
                    <p>单格子大小</p>
                    <div>
                        <Input placeholder="长" onChange={inputChange('width')} style={{ height: '30px', width: '40px' }} />
                        <span>*</span>
                        <Input placeholder="高" onChange={inputChange('height')} style={{ height: '30px', width: '40px' }} />
                    </div>
                </div>
            )} */}
        </div>
    )
} 
