import React, { ChangeEvent, memo } from 'react'
import { findDOMNode } from 'react-dom'
import memoizeOne from 'memoize-one'
import {debounce} from 'lodash'

import { Button, Col, Input, Row, Table } from 'antd'
import { ColumnProps, TableProps } from 'antd/lib/table'
import { PaginationConfig } from 'antd/lib/pagination'
import Styles from '../View.less'

import { IExecuteSqlResponse, ISqlColumn } from '../types'
import { DEFAULT_SQL_PREVIEW_PAGE_SIZE, SQL_PREVIEW_PAGE_SIZE_OPTIONS } from '../constants'
import { getTextWidth } from 'utils/util'
import { ContainerBody } from 'components/Container'
import { usePagination } from 'containers/Widget/List'

export interface ISqlPreviewProps {
  loading: boolean
  response: IExecuteSqlResponse
  height?: number
  size: TableProps<any>['size']
  isDetail?: boolean
  rename?: string
  ref?: any
  showModifyTypeModal: (flag: boolean) => void
  showRenameFieldModal: (flag: boolean) => void
  showOrderFieldModal: (flag: boolean) => void
  fenyeExecuteSql: (pageConfig: any) =>  void
}

interface ISqlPreviewStates {
  tableBodyHeight: number
  current: number
  pageSize: number
  filterValue: string
}

export class SqlPreview extends React.PureComponent<ISqlPreviewProps, ISqlPreviewStates> {
  constructor(props) {
    super(props);
    // this.showColHighlight = debounce(this.showColHighlight, 1000)
  }


  private static readonly TableCellPaddingWidth = 8
  private static readonly TableCellMaxWidth = 300

  private static ExcludeElems = ['.ant-table-thead', '.ant-pagination.ant-table-pagination']

  private static basePagination: PaginationConfig = {
    pageSize: DEFAULT_SQL_PREVIEW_PAGE_SIZE,
    pageSizeOptions: SQL_PREVIEW_PAGE_SIZE_OPTIONS.map((size) => size.toString()),
    showQuickJumper: true,
    showSizeChanger: true
  }

  private prepareTable = memoizeOne((columns: ISqlColumn[], resultList: any[], rename) => {
    console.log("computeColumnWidth", columns, resultList)
    const rowKey = `rowKey_${new Date().getTime()}`
    const renames = JSON.parse(rename || '[]')
    resultList.forEach((record, idx) => record[rowKey] = Object.values(record).join('_') + idx)
    const tableColumns = columns.map<ColumnProps<any>>((col) => {
      const width = SqlPreview.computeColumnWidth(resultList, col.name)
      const item = renames.find(row => row.old === col.name)
      return {
        title: item ? (item.new + `(${col.name})`) : col.name,
        dataIndex: col.name,
        width
      }
    })
    console.log(rowKey, 'rowKey')
    return { tableColumns, rowKey}
  })

  public showColHighlight = memoizeOne((tableColumns, filterValue) => {
    console.log('run run')
    return tableColumns.map(col => {
      return {
        ...col,
        className: filterValue && col.title.indexOf(filterValue) > -1 ? 'highlight' : ''
      }
    })
  })

  public static computeColumnWidth = (resultList: any[], columnName: string) => {
    let textList = resultList.map((item) => item[columnName])
    textList = textList.filter((text, idx) => textList.indexOf(text) === idx)
    const contentMaxWidth = textList.reduce((maxWidth, text) =>
      Math.max(maxWidth, getTextWidth(text, '700', '14px')), -Infinity)
    const titleWidth = getTextWidth(columnName, '500', '14px')
    let maxWidth = Math.max(contentMaxWidth, titleWidth) + (2 * SqlPreview.TableCellPaddingWidth) + 2
    maxWidth = Math.min(maxWidth, SqlPreview.TableCellMaxWidth)
    return maxWidth
  }

  private table = React.createRef<Table<any>>()
  public state = {
    filterValue: '',
    tableBodyHeight: 0,
    current: 1,
    pageSize: 10
  }

  public componentDidMount() {
    const tableBodyHeight = this.computeTableBody()
    this.setState({ tableBodyHeight })
    if (this.props.ref) {
      this.props.ref(this)
    }
    console.log('create---update')
  }

  public componentDidUpdate() {
    const newTableBodyHeight = this.computeTableBody()
    if (Math.abs(newTableBodyHeight - this.state.tableBodyHeight) > 5) { // FIXED table body compute vibration
      this.setState({ tableBodyHeight: newTableBodyHeight })
    }
  }

  private computeTableBody = () => {
    const tableDom = findDOMNode(this.table.current) as Element
    if (!tableDom) { return 0 }
    const excludeElemsHeight = SqlPreview.ExcludeElems.reduce((acc, exp) => {
      const elem = tableDom.querySelector(exp)
      if (!elem) { return acc }
      const style = window.getComputedStyle(elem)
      const { marginTop, marginBottom } = style
      const height = elem.clientHeight + parseInt(marginTop, 10) + parseInt(marginBottom, 10)
      return acc + height
    }, 0)
    return this.props.height - excludeElemsHeight
  }

  public resetCurrentPage() {
    console.log('run')
    this.setState({
      current: 1})
  }

  pageSizeChange = (page, size) => {
    let newPageSize = {
      current: page,
      pageSize: size
    }
    this.setState(newPageSize, () => {
      this.props.fenyeExecuteSql(newPageSize)
    })
  }

  public changeFilterValue = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    this.setState({
      filterValue: value
    })
  }

  public render() {
    const { loading, response, size, isDetail } = this.props
    const { totalCount,pageNo, columns, resultList } = response
    console.log('121221')
    const paginationConfig: PaginationConfig = {
      ...SqlPreview.basePagination,
      total: totalCount,
      showTotal:(total)=>`共${total}条`,
      current:pageNo,
      pageSize:this.state.pageSize,
      onChange:this.pageSizeChange,
      onShowSizeChange:this.pageSizeChange,

    }
    const { tableColumns, rowKey } = this.prepareTable(columns, resultList, this.props.rename)
    const tableColumnsResult = this.showColHighlight(tableColumns, this.state.filterValue)
    const scroll: TableProps<any>['scroll'] = {
      x: tableColumnsResult.reduce((acc, col) => (col.width as number + acc), 0),
      y: this.state.tableBodyHeight - 220
    }

    const pagination = usePagination({
      total: paginationConfig.total,
      current: this.state.current,
      changePage: this.pageSizeChange
    })

    return (
      <React.Fragment>
        {!isDetail && <Row>
          <Col span={16} style={{marginBottom: '15px'}}>
            <Button type="primary" onClick={() => this.props.showRenameFieldModal(true)}>列名更改</Button> &nbsp;
            <Button onClick={() => this.props.showModifyTypeModal(true)}>更改字段类型</Button>  &nbsp;
            <Button onClick={() => this.props.showOrderFieldModal(true)}>排序</Button>
          </Col>
          <Col span={8} >
            <Input onChange={this.changeFilterValue} placeholder="请输入搜索内容" />
          </Col>
        </Row>}
        <div >
          <Table
            ref={this.table}
            className={Styles.sqlPreview}
            // bordered
            // size={size}
            pagination={false}
            dataSource={resultList}
            columns={tableColumnsResult}
            scroll={scroll}
            loading={loading}
            rowKey={rowKey}
          />
          <div style={{marginTop: '20px'}}>
            {totalCount && pagination || ''}
          </div>
        </div>
      </React.Fragment>

    )
  }

}

export default SqlPreview
