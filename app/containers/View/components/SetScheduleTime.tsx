import { LongFormItemStyle } from 'containers/Schedule/components/constants'
import Styles from 'containers/Schedule/components/ScheduleBaseConfig/ScheduleBaseConfig.less'
import { ICronExpressionPartition, ISchedule, SchedulePeriodUnit } from 'containers/Schedule/components/types'
import React, {
  useState,
  useCallback,
  useMemo, forwardRef, useEffect
} from 'react'


import { CheckboxChangeEvent } from 'antd/lib/checkbox'

import { Form, Row, Col, Input, Select, Checkbox } from 'antd'
import { ScheduleBaseConfig, ScheduleBaseFormProps } from 'containers/Schedule/components/ScheduleBaseConfig'
const FormItem = Form.Item
const { Option } = Select
import { FormComponentProps } from 'antd/lib/form'
import { IScheduleTime } from 'containers/View/components/ModelAuth'
import { getCronExpressionByPartition } from 'containers/Schedule/Editor'

interface IScheduleBaseConfigProps extends FormComponentProps<ScheduleBaseFormProps> {
  schedule: IScheduleTime,
  childRef: any
}

const periodUnitList: SchedulePeriodUnit[] = [
  'Minute',
  'Hour',
  'Day',
  'Week',
  'Month',
  'Year'
]

const periodUnitListLocale: { [key in SchedulePeriodUnit]: string } = {
  Minute: '分钟',
  Hour: '小时',
  Day: '天',
  Week: '周',
  Month: '月',
  Year: '年'
}

const minutePeriodOptions = [...Array(50).keys()].map((s) => (
  <Option key={s + 10} value={s + 10}>
    {s + 10}
  </Option>
))

const minuteOptions = [...Array(60).keys()].map((m) => (
  <Option key={m} value={m}>
    {`0${m}`.slice(-2)} 分
  </Option>
))

const hourOptions = [...Array(24).keys()].map((h) => (
  <Option key={h} value={h}>
    {`0${h}`.slice(-2)} 时
  </Option>
))

const dayOptions = [...Array(31).keys()].map((d) => (
  <Option key={d + 1} value={d + 1}>
    {`0${d + 1}`.slice(-2)} 日
  </Option>
))

const weekOptions = [
  '星期天',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六'
].map((w, idx) => (
  <Option key={idx + 1} value={idx + 1}>
    {w}
  </Option>
))

const monthOptions = [...Array(12).keys()].map((m) => (
  <Option key={m + 1} value={m + 1}>
    {`0${m + 1}`.slice(-2)}月
  </Option>
))


const computePeriodUnit = (cronExpression: string) => {
  const partitions = cronExpression.split(' ')
  const stars = partitions.filter((item) => item === '*').length
  let periodUnit: SchedulePeriodUnit = 'Minute'
  switch (stars) {
    case 3:
      periodUnit = partitions[1].includes('/') ? 'Minute' : 'Hour'
      break
    case 2:
      periodUnit = 'Day'
      break
    case 1:
      periodUnit = partitions[partitions.length - 1] === '?' ? 'Month' : 'Week'
      break
    case 0:
      periodUnit = 'Year'
      break
  }
  return periodUnit
}

export const SetScheduleTime: React.FC<IScheduleBaseConfigProps> = (
  props,
  ref
) => {
    const { form, schedule, childRef } = props
    let { cronExpression, setCronExpressionManually } = schedule
    const { getFieldDecorator } = form
    if (typeof childRef === 'function') {
      childRef(form)
    }
    const [manual, setManual] = useState(false)

    const [currentPeriodUnit, setCurrentPeriodUnit] = useState<
    SchedulePeriodUnit
    >(computePeriodUnit(cronExpression))

    const changeManual = useCallback((e: CheckboxChangeEvent) => {
      setManual(e.target.checked)
      console.log(e.target.checked, '122121')
      if (e.target.checked) {
        (async () => {
          const values:ICronExpressionPartition = await form.getFieldsValue() as ICronExpressionPartition
          cronExpression = getCronExpressionByPartition(values)
          form.setFieldsValue({'cronExpression': cronExpression})
        })()
      }
    }, [])

  const changeRange = (value) => {
    let minute = form.getFieldValue('minute')
    console.log(value, 'currentPeriodUnit', minute)
    if (value === 'Minute' && minute < 10) {
      minute = 10
      form.setFieldsValue({ minute })
    }
    setCurrentPeriodUnit(value)
  }


  let { minute = 0, hour = 0, day = 1, month = 1, weekDay = 1, } = useMemo<
    Partial<ScheduleBaseFormProps>
    >(() => {
      if (!cronExpression) return {}
    const partitions = cronExpression.split(' ')
    let minute =
      form.getFieldValue('minute') ||
      +(partitions[1].includes('/')
        ? partitions[1].slice(2) // slice(2) to remove */
        : partitions[1])
    // min minute duration is 10
    console.log(currentPeriodUnit, 'currentPeriodUnit', minute)
    if (currentPeriodUnit === 'Minute' && minute < 10) {
      minute = 10
      form.setFieldsValue({ minute })
    }
    const hour = +partitions[2] || 0
    const day = +partitions[3] || 1
    const month = +partitions[4] || 1
    const weekDay = +partitions[5] || 1
    return { minute, hour, day, month, weekDay }
  }, [cronExpression, currentPeriodUnit])

    useEffect(() => {
      const periodUnit = computePeriodUnit(cronExpression)
      setCurrentPeriodUnit(periodUnit)
    }, [cronExpression])

    useEffect(() => {
      setManual(setCronExpressionManually)
    }, [setCronExpressionManually])

    return (
      <Form>
        <Row>
          <FormItem label="执行时间间隔设置" {...LongFormItemStyle}>
            {(
              <Row className={Styles.cronSetting} gutter={8}>
                {manual ? (
                  <Col span={12}>
                    {getFieldDecorator<ScheduleBaseFormProps>('cronExpression', {
                      rules: [{ required: true , message: '执行时间间隔设置不能为空！'}],
                      initialValue: cronExpression
                    })(<Input placeholder="请输入cron表达式" />)}
                  </Col>
                ) : (
                  <>
                    <span>每</span>-
                    {/* Minute */}
                    {currentPeriodUnit === 'Minute' && (
                      <>
                        {getFieldDecorator<ScheduleBaseFormProps>('minute', {
                          initialValue: minute
                        })(
                          <Select style={{ width: 80 }}>
                            {minutePeriodOptions}
                          </Select>
                        )}
                      </>
                    )}
                    {/** */}
                    {getFieldDecorator<ScheduleBaseFormProps>('periodUnit', {
                      initialValue: currentPeriodUnit
                    })(
                      <Select
                        style={{ width: 80 }}
                        onChange={(value: SchedulePeriodUnit) =>
                          changeRange(value)
                        }
                      >
                        {periodUnitList.map((unit) => (
                          <Option key={unit} value={unit}>
                            {periodUnitListLocale[unit]}
                          </Option>
                        ))}
                      </Select>
                    )}

                    {/* Hour */}
                    {currentPeriodUnit === 'Hour' && (
                      <>
                        <span>的第</span>
                        {getFieldDecorator<ScheduleBaseFormProps>('minute', {
                          initialValue: minute
                        })(<Select style={{ width: 80 }}>{minuteOptions}</Select>)}
                      </>
                    )}
                    {/* Day */}
                    {currentPeriodUnit === 'Day' && (
                      <>
                        <span>的</span>
                        {getFieldDecorator<ScheduleBaseFormProps>('hour', {
                          initialValue: hour
                        })(<Select style={{ width: 80 }}>{hourOptions}</Select>)}
                        <span>:</span>
                        {getFieldDecorator<ScheduleBaseFormProps>('minute', {
                          initialValue: minute
                        })(<Select style={{ width: 100 }}>{minuteOptions}</Select>)}
                      </>
                    )}
                    {/* Week */}
                    {currentPeriodUnit === 'Week' && (
                      <>
                        {getFieldDecorator<ScheduleBaseFormProps>('weekDay', {
                          initialValue: weekDay
                        })(<Select style={{ width: 95 }}>{weekOptions}</Select>)}
                        <span>的</span>
                        {getFieldDecorator<ScheduleBaseFormProps>('hour', {
                          initialValue: hour
                        })(<Select style={{ width: 80 }}>{hourOptions}</Select>)}
                        <span>:</span>
                        {getFieldDecorator<ScheduleBaseFormProps>('minute', {
                          initialValue: minute
                        })(<Select style={{ width: 80 }}>{minuteOptions}</Select>)}
                      </>
                    )}
                    {/* Month */}
                    {currentPeriodUnit === 'Month' && (
                      <>
                        {getFieldDecorator<ScheduleBaseFormProps>('day', {
                          initialValue: day
                        })(<Select style={{ width: 80 }}>{dayOptions}</Select>)}
                        <span>的</span>
                        {getFieldDecorator<ScheduleBaseFormProps>('hour', {
                          initialValue: hour
                        })(<Select style={{ width: 80 }}>{hourOptions}</Select>)}
                        <span>:</span>
                        {getFieldDecorator('minute', { initialValue: minute })(
                          <Select style={{ width: 80 }}>{minuteOptions}</Select>
                        )}
                      </>
                    )}
                    {/* Year */}
                    {currentPeriodUnit === 'Year' && (
                      <>
                        {getFieldDecorator<ScheduleBaseFormProps>('month', {
                          initialValue: month
                        })(<Select style={{ width: 80 }}>{monthOptions}</Select>)}
                        {getFieldDecorator<ScheduleBaseFormProps>('day', {
                          initialValue: day
                        })(<Select style={{ width: 80 }}>{dayOptions}</Select>)}
                        <span>的</span>
                        {getFieldDecorator<ScheduleBaseFormProps>('hour', {
                          initialValue: hour
                        })(<Select style={{ width: 80 }}>{hourOptions}</Select>)}
                        <span>:</span>
                        {getFieldDecorator<ScheduleBaseFormProps>('minute', {
                          initialValue: minute
                        })(<Select style={{ width: 80 }}>{minuteOptions}</Select>)}
                      </>
                    )}
                  </>
                )}
                {getFieldDecorator<ScheduleBaseFormProps>(
                  'isManually',
                  { initialValue: manual || false, valuePropName: 'checked' }
                )(
                  <Checkbox className={Styles.manual} onChange={changeManual}>
                    手动输入
                  </Checkbox>
                )}
              </Row>
            )}
          </FormItem>
        </Row>
      </Form>)
}


export default Form.create<IScheduleBaseConfigProps>()(
  forwardRef(SetScheduleTime)
)
