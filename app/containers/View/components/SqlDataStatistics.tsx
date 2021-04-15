import React  from 'react'
import { Table} from 'antd'
import { colBase, IExcuteSqlStatisticsResponse, statisticsResponseData } from '../types'
import { ColumnProps } from 'antd/es/table';
import { findDOMNode } from 'react-dom'
import SqlPreview from 'containers/View/components/SqlPreview'
import { TableProps } from '_antd@3.26.20@antd/lib/table'

interface SqlDataStatisticsProps {
  value?: string,
  sourceId?: number,
  sql?: string,
  isRun?: boolean,
  rename: string,
  statistics: IExcuteSqlStatisticsResponse<statisticsResponseData>
}

interface SqlDataStatisticsState {
  tableBodyHeight: number
}

export class SqlDataStatistics extends React.Component<SqlDataStatisticsProps,SqlDataStatisticsState> {
  constructor (props) {
    super(props)
  }

  public render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    const status = this.props.statistics?.status
    const {data = []}: any = this.props.statistics?.data || []
    const col:ColumnProps<colBase>[] = this.props.statistics?.data?.col || []
    if (col.length) {
      // 第一列是指标，设置固定宽度
      col[0].width = 100
      col[0].ellipsis = true
    }
    const renames = JSON.parse(this.props.rename || '[]')
    col.forEach(row => {
      const item = renames.find(item => item.old === row.title)
      row.width = SqlPreview.computeColumnWidth(data, row.dataIndex)
      item && (row.title = item.new + `(${row.title})`)
      console.log(row, 'row')
    })
    console.log(col, 'col')

    const scroll: TableProps<any>['scroll'] = {
      x: col.reduce((acc, col) => (col.width as number + acc), 0),
      y: true
    }

    let result
    if (status === -1) {
      result = (
        <div>未执行sql，请先执行sql！</div>
      )
    } else if (status === 0) {
      result = (
          <div>结果统计中，请稍后查看！</div>
        )
    } else {
      result = (<Table scroll={scroll} rowKey={'type'} pagination={false} dataSource={data} columns={col} />)
    }
    console.log(result, 'result')
    return (
      <div className='table'>
        {result}
      </div>
    )
  }
}

export default SqlDataStatistics
