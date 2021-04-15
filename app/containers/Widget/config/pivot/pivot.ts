import PivotTypes from './PivotTypes'
import {
  PIVOT_DEFAULT_AXIS_LINE_COLOR,
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_FONT_COLOR,
  PIVOT_DEFAULT_HEADER_BACKGROUND_COLOR
} from 'app/globalConstants'

import { IChartInfo } from 'containers/Widget/components/Widget'

const pivot: IChartInfo = {
  id: PivotTypes.PivotTable,
  name: 'pivot',
  title: '透视表',
  icon: 'icontoushibiaoge',
  coordinate: 'cartesian',
  rules: [{ dimension: [0, 9999], metric: [0, 9999] }],
  data: {
    cols: {
      title: 'x数据轴',
      type: 'category'
    },
    rows: {
      title: 'y数据轴',
      type: 'category'
    },
    metrics: {
      title: '指标',
      type: 'value'
    },
    filters: {
      title: '筛选',
      type: 'all'
    },
    color: {
      // title: '颜色',
      // type: 'category'
    },
    sampling: {
      title: '数据采样方式',
      value: {v: ''}
    },
    stride: {
      title: '采样步长',
      value: {v: ''}

    },
    calculation: {
      title : '采样计算方式',
      value: {v: ''}

    },
    frequency: {
      title: '刷新频率',
      value: {v: ''}
    },
    isConfig: {
      title: '是否开启配置',
      value: {v: ''}
    }
  },
  style: {
    pivot: {
      fontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      fontSize: '12',
      color: PIVOT_DEFAULT_FONT_COLOR,
      lineStyle: 'solid',
      lineColor: PIVOT_DEFAULT_AXIS_LINE_COLOR,
      headerBackgroundColor: PIVOT_DEFAULT_HEADER_BACKGROUND_COLOR,
      tableSize: '1',
      isConfig: false,
      height: 0,
      width: 0
    }
  }
}

export default pivot
