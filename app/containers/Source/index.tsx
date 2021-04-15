

import React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import memoizeOne from 'memoize-one'
import { Link } from 'react-router-dom'
import { RouteComponentWithParams } from 'utils/types'
import { Card, Dropdown, Menu, Modal, Pagination } from 'antd'
import { compose, Dispatch } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import Container, { ContainerTitle, ContainerBody } from 'components/Container'
import Box from 'components/Box'
import SearchFilterDropdown from 'components/SearchFilterDropdown'
import SourceConfigModal from './components/SourceConfigModal'
import UploadCsvModal from './components/UploadCsvModal'
import ResetConnectionModal from './components/ResetConnectionModal'
import { makeSelectLoginUser } from 'containers/App/selectors'

import {TextOverflow} from 'app/components/hook/usePublic.tsx'
import {
  message,
  Row,
  Col,
  Table,
  Button,
  Tooltip,
  Icon,
  Popconfirm,
  Breadcrumb
} from 'antd'
import { ButtonProps } from 'antd/lib/button/button'
import { ColumnProps, PaginationConfig, SorterResult } from 'antd/lib/table'

import { SourceActions, SourceActionType } from './actions'
import {
  makeSelectSourcesTotal,
  makeSelectSources,
  makeSelectListLoading,
  makeSelectFormLoading,
  makeSelectTestLoading,
  makeSelectResetLoading,
  makeSelectDatasourcesInfo
} from './selectors'
import { checkNameUniqueAction } from '../App/actions'
import { makeSelectCurrentProject } from '../Projects/selectors'
import ModulePermission from '../Account/components/checkModulePermission'
import { initializePermission } from '../Account/components/checkUtilPermission'
import { IProject } from 'containers/Projects/types'
import {
  ISourceBase,
  ISource,
  ICSVMetaInfo,
  ISourceFormValues,
  SourceResetConnectionProperties
} from './types'

import utilStyles from 'assets/less/util.less'
import SourceStyles from './Source.less'
import { usePagination } from 'containers/Widget/List'
// import './iconfont.css'

type ISourceListProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentWithParams

interface ISourceListStates {
  screenWidth: number
  tempFilterSourceName: string
  filterSourceName: string
  filterDropdownVisible: boolean
  tableSorter: SorterResult<ISource>
  sourceModalVisible: boolean
  uploadModalVisible: boolean
  csvUploading: boolean
  resetModalVisible: boolean
  resetSource: ISource
  editingSource: ISourceFormValues
  csvSourceId: number
  uploadType: string
}

const emptySource: ISourceFormValues = {
  id: 0,
  name: '',
  type: 'jdbc',
  description: '',
  projectId: 0,
  datasourceInfo: [],
  config: {
    username: '',
    password: '',
    ip: '',
    port: '',
    dbName: ''
    // url: '',
    // properties: []
  }
}

export class SourceList extends React.PureComponent<
  ISourceListProps,
  ISourceListStates
  > {
  state: Readonly<ISourceListStates> = {
    screenWidth: document.documentElement.clientWidth,
    tempFilterSourceName: '',
    tableSorter: null,

    filterSourceName: '',
    filterDropdownVisible: false,

    sourceModalVisible: false,

    uploadModalVisible: false,
    csvUploading: false,
    resetModalVisible: false,
    resetSource: null,

    editingSource: { ...emptySource },
    csvSourceId: null,
    uploadType: 'csv'
  }

  private basePagination: PaginationConfig = {
    defaultPageSize: 10,
    showSizeChanger: true,
    current: 1,
    pageSize: 10
  }

  public componentWillMount() {
    const { onLoadSources, onLoadDatasourcesInfo, match, user } = this.props
    // const projectId = +match.params.projectId
    onLoadSources(user.tenantId, this.basePagination.current, this.basePagination.pageSize)
    onLoadDatasourcesInfo()
    window.addEventListener('resize', this.setScreenWidth, false)
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.setScreenWidth, false)
  }

  private setScreenWidth = () => {
    this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  private getFilterSources = 
    (sourceName: string, sources: ISourceBase[]) => {
      if (!Array.isArray(sources) || !sources.length) {
        return []
      }
      const regex = new RegExp(sourceName, 'gi')
      const filterSources = sources.filter(
        (v) => v.name.match(regex) || v.description.match(regex)
      )
      return filterSources
    }

  private static getSourcePermission = memoizeOne((project: IProject) => ({
    sourcePermission: initializePermission(project, 'sourcePermission'),
    AdminButton: ModulePermission<ButtonProps>(project, 'source', true)(Button),
    EditButton: ModulePermission<ButtonProps>(project, 'source', false)(Button)
  }))

  private getTableColumns = ({
    sourcePermission,
    AdminButton,
    EditButton
  }: ReturnType<typeof SourceList.getSourcePermission>) => {
    const {
      tempFilterSourceName,
      filterSourceName,
      filterDropdownVisible,
      tableSorter
    } = this.state
    const { resetLoading } = this.props
    const columns: Array<ColumnProps<ISource>> = [
      {
        title: '数据源名称',
        dataIndex: 'name',
        // filterDropdown: (
        //   <SearchFilterDropdown
        //     placeholder="名称"
        //     value={tempFilterSourceName}
        //     onChange={this.filterSourceNameChange}
        //     onSearch={this.searchSource}
        //   />
        // ),
        // filterDropdownVisible,
        // onFilterDropdownVisibleChange: (visible: boolean) =>
        //   this.setState({
        //     filterDropdownVisible: visible
        //   }),
        // sorter: (a, b) => (a.name > b.name ? -1 : 1),
        // sortOrder:
        //   tableSorter && tableSorter.columnKey === 'name'
        //     ? tableSorter.order
        //     : void 0
      },
      {
        title: '描述',
        dataIndex: 'description'
      },
      {
        title: '类型',
        dataIndex: 'type',
        filters: [
          {
            text: 'JDBC',
            value: 'jdbc'
          },
          {
            text: 'CSV',
            value: 'csv'
          }
        ],
        filterMultiple: false,
        onFilter: (val, record) => record.type === val,
        render: (_, record) => {
          const type = record.type
          return type && type.toUpperCase()
        }
      },
      {
        title: '数据库',
        dataIndex: 'sourceType'
      },
    ]

    if (filterSourceName) {
      const regex = new RegExp(`(${filterSourceName})`, 'gi')
      columns[0].render = (text: string) => (
        <span
          dangerouslySetInnerHTML={{
            __html: text.replace(
              regex,
              `<span class="${utilStyles.highlight}">$1</span>`
            )
          }}
        />
      )
    }

    if (sourcePermission) {
      columns.push({
        title: '操作',
        key: 'action',
        width: 180,
        render: (_, record) => (
          <span className="ant-table-action-column">
            <Tooltip title="重置连接">
              <EditButton
                icon="reload"
                shape="circle"
                type="ghost"
                disabled={resetLoading}
                onClick={this.openResetSource(record)}
              />
            </Tooltip>
            <Tooltip title="修改">
              <EditButton
                icon="edit"
                shape="circle"
                type="ghost"
                onClick={this.editSource(record.id)}
              />
            </Tooltip>
            <Popconfirm
              title="确定删除？"
              placement="bottom"
              onConfirm={this.deleteSource(record.id)}
            >
              <Tooltip title="删除">
                <AdminButton icon="delete" shape="circle" type="ghost" />
              </Tooltip>
            </Popconfirm>
            {record && record.type === 'csv' ? (
              <Tooltip title="上传">
                <EditButton
                  icon="upload"
                  shape="circle"
                  type="ghost"
                  onClick={this.showUploadModal(record.id)}
                />
              </Tooltip>
            ) : (
                ''
              )}
          </span>
        )
      })
    }

    return columns
  }

  private addSource = () => {
    this.setState({
      editingSource: {
        ...emptySource,
        projectId: +this.props.match.params.projectId
      },
      sourceModalVisible: true
    })
  }

  private openResetSource = (source: ISource) => () => {
    this.setState({
      resetModalVisible: true,
      resetSource: source
    })
  }

  private resetConnection = (properties: SourceResetConnectionProperties) => {
    this.props.onResetSourceConnection(properties, () => {
      this.closeResetConnectionModal()
    })
  }

  private closeResetConnectionModal = () => {
    this.setState({ resetModalVisible: false })
  }

  private editSource = (sourceId: number) => () => {
    this.props.onLoadSourceDetail(sourceId, (editingSource) => {
      this.setState({
        editingSource: {
          ...editingSource,
          datasourceInfo: this.getDatasourceInfo(editingSource)
        },
        sourceModalVisible: true
      })
    })
  }

  private getDatasourceInfo = (source: ISource): string[] => {
    const { datasourcesInfo } = this.props
    const { url, version } = source.config
    const matchResult = url.match(/^jdbc\:(\w+)\:/)
    if (matchResult) {
      const datasource = datasourcesInfo.find(
        (info) => info.name === matchResult[1]
      )
      return datasource
        ? datasource.versions.length
          ? [datasource.name, version || 'Default']
          : [datasource.name]
        : []
    } else {
      return []
    }
  }

  private deleteSource = (sourceId: number) => () => {
    const { onDeleteSource, user, onLoadSources } = this.props
    Modal.confirm({
      title: '确定要删除吗？',
      content: '删除后，该数据无法恢复。',
      okText: '确认',
      cancelText: '取消',
      icon: <Icon type="info-circle" />,
      onOk:  ()=> {
        onDeleteSource(sourceId,  () => {
          onLoadSources(user.tenantId, this.basePagination.current, this.basePagination.pageSize)
        })
      }
    });
  }

  private showUploadModal = (sourceId: number, type: string) => () => {
    this.setState({
      csvSourceId: sourceId,
      uploadType: type,
      uploadModalVisible: true
    })
  }

  private saveSourceForm = (values: ISourceFormValues) => {
    const { match } = this.props
    const { datasourceInfo, config, ...rest } = values
    // const { ip, port, dbName } = config

    const version =
      datasourceInfo[1] === 'Default' ? '' : datasourceInfo[1] || ''
    const {tenantId} = JSON.parse(localStorage.getItem('loginUser'))
    const requestValue = {
      ...rest,
      config: {
        ...config,
        ext: !!version,
        version
        // url: datasourceInfo[0]
      },
      sourceType: datasourceInfo[0] || '',
      projectId: Number(match.params.projectId),
      tenantId
    }
    console.log(requestValue, 'requestValue')
    if (!values.id) {
      this.props.onAddSource({ ...requestValue }, () => {
        this.closeSourceForm('success')
      })
    } else {
      this.props.onEditSource({ ...requestValue }, () => {
        this.closeSourceForm('success')
      })
    }
  }

  private closeSourceForm = (success = '') => {
    this.setState({
      sourceModalVisible: false
    }, () => {
      if (typeof success == 'string') {
        // 添加成功的关闭弹窗逻辑
        const { user } = this.props
        message.success('操作成功')
        this.props.onLoadSources(user.tenantId, this.basePagination.current, this.basePagination.pageSize)
      }
    })
  }

  private closeUploadModal = () => {
    this.setState({
      uploadModalVisible: false
    })
  }

  private uploadCsv = (csvMetaInfo: ICSVMetaInfo, type) => {
    this.setState({ csvUploading: true }, () => {
      this.props.onUploadCsvFile(
        csvMetaInfo,
        type,
        () => {
          this.closeUploadModal()
          message.info('文件上传成功！')
          this.setState({ csvUploading: false })
        },
        () => {
          this.setState({ csvUploading: false })
        }
      )
    })
  }
  private renderSourceList = () => {
    const { sources } = this.props
    const menu = (record) => (
      <Menu>
        <Menu.Item key="1" onClick={this.editSource(record.id)}>编辑</Menu.Item>
        <Menu.Item key="2" onClick={this.deleteSource(record.id)}>删除</Menu.Item>
        {record.type != 'jdbc' && <Menu.Item key="3" onClick={this.showUploadModal(record.id, record.type)}>上传</Menu.Item>}
        {record.type == 'jdbc' && <Menu.Item key="4" onClick={this.openResetSource(record)}>重置链接</Menu.Item>}
      </Menu>
    )
    const renderText = (time) => {
      const currentTime = new Date().getTime()
      const dateBegin = new Date(new Date(time.replace(/-/g, "/"))).getTime()
      const diffTime = Math.floor((currentTime - dateBegin) / (24 * 3600 * 1000))
      return diffTime > 1 && '更新时间' || '刚刚更新'
    }

    return sources.map((record) => {
      const { id, name, description, type, sourceType, createTime, updateTime = '' } = record
      return (
        <Card className={SourceStyles['content-card']} key={id} data-v-source>
          <p className={SourceStyles['inner-img']}><img src={require('assets/images/folder.png')} /></p>
          <div className={SourceStyles['inner-name']}><TextOverflow text={name} /></div>
          {/* <p className={SourceStyles['inner-name']}>{description}</p> */}
          <p className={SourceStyles['inner-type']}>{type}/{sourceType}</p>
          <p className={SourceStyles['inner-time']}>
          <Tooltip title={createTime}>
              创建时间
           </Tooltip>
            {updateTime && <Tooltip title={updateTime}> | {renderText(updateTime)}</Tooltip>}
          </p>
          <p className={SourceStyles['inner-footer']}>
            <Dropdown
              overlay={menu(record)}
              trigger={['click']}
              overlayClassName='inner-dropdown'
              placement="bottomRight"
            >
              {/* <Icon type="down" style={{'cursor': 'pointer'}} /> */}
              <i className="iconfont">&#xe6e8;</i>
            </Dropdown>
          </p>
        </Card>
      )
    }
    )
  }
  private tableChange = (_1, _2, sorter: SorterResult<ISource>) => {
    this.setState({
      tableSorter: sorter
    })
  }

  private filterSourceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      tempFilterSourceName: e.target.value,
      filterSourceName: ''
    })
  }

  private searchSource = (value: string) => {
    this.setState({
      filterSourceName: value,
      filterDropdownVisible: false
    })
  }

  // private testSourceConnection = (
  //   username,
  //   password,
  //   jdbcUrl,
  //   ext,
  //   version
  // ) => {
  //   if (jdbcUrl) {
  //     this.props.onTestSourceConnection({
  //       username,
  //       password,
  //       url: jdbcUrl,
  //       ext,
  //       version
  //     })
  //   } else {
  //     message.error('连接 Url 都不能为空')
  //   }
  // }
  private changePage = (page, pageSize) => {
    this.basePagination.current = page
    this.basePagination.pageSize = pageSize
    this.props.onLoadSources(this.props.user.tenantId, this.basePagination.current, this.basePagination.pageSize)
  }
  public render() {

    const {
      filterSourceName,
      sourceModalVisible,
      uploadModalVisible,
      resetModalVisible,
      resetSource,
      csvUploading,
      csvSourceId,
      screenWidth,
      editingSource,
      uploadType
    } = this.state

    const {
      sources,
      listLoading,
      formLoading,
      testLoading,
      currentProject,
      datasourcesInfo,
      onValidateCsvTableName,
      onCheckUniqueName
    } = this.props

    const {
      sourcePermission,
      AdminButton,
      EditButton
    } = SourceList.getSourcePermission(currentProject)
    const tableColumns = this.getTableColumns({
      sourcePermission,
      AdminButton,
      EditButton
    })
    const tablePagination: PaginationConfig = {
      ...this.basePagination,
      simple: screenWidth <= 768
    }

    const myPage =  (sources?.length && usePagination({
      total: this.props.sourcesTotal,
      changePage: this.changePage
    })) || ''

    const filterSources = this.getFilterSources(filterSourceName, sources)

    return (
      <div className={SourceStyles.container}>
        <Helmet title="我新增的数据源" />
        <ContainerTitle>
          <div style={{ 'fontSize': '18px' }}>我新增的数据源</div>
        </ContainerTitle>
        <ContainerBody>
          <div>
            {/* <Box.Header>
              <Box.Title>
                <Icon type="bars" />
                Source List
              </Box.Title>
              <Box.Tools>
                <Tooltip placement="bottom" title="新增">
                  <AdminButton
                    type="primary"
                    icon="plus"
                    onClick={this.addSource}
                  />
                </Tooltip>
              </Box.Tools>
            </Box.Header> */}
            <div>
              <Row>
                <Col span={24} className={SourceStyles['flex-wrapper']}>
                  {/* <Table
                    bordered
                    rowKey="id"
                    loading={listLoading}
                    dataSource={filterSources}
                    columns={tableColumns}
                    pagination={tablePagination}
                    onChange={this.tableChange}
                  /> */}
                  {this.basePagination.current == 1 &&<div className={SourceStyles.createCrad} onClick={this.addSource}>
                    <div style={{ transform: 'translateY(-50%)', marginTop: '92px' }}>
                      <div className={SourceStyles['inner-text-add']}>
                        <i className="iconfont add-icon">&#xe6e7;</i>
                      </div>
                      <div className={SourceStyles['inner-text']}>新增数据源</div>
                    </div>
                  </div> || ''}
                  {sources && this.renderSourceList()}
                </Col>
                <Col span={24} style={{marginTop: '20px'}}>
                  {myPage}
                  {/*<Pagination onChange={this.changePage} total={this.props.sourcesTotal} pageSize={this.basePagination.pageSize} current={this.basePagination.current} />*/}
                </Col>
              </Row>
              <SourceConfigModal
                source={editingSource}
                datasourcesInfo={datasourcesInfo}
                visible={sourceModalVisible}
                formLoading={formLoading}
                testLoading={testLoading}
                onSave={this.saveSourceForm}
                onClose={this.closeSourceForm}
                // onTestSourceConnection={this.testSourceConnection}
                onCheckUniqueName={onCheckUniqueName}
              />
              <UploadCsvModal
                visible={uploadModalVisible}
                type={uploadType}
                uploading={csvUploading}
                sourceId={csvSourceId}
                onValidate={onValidateCsvTableName}
                onCancel={this.closeUploadModal}
                onOk={this.uploadCsv}
              />
              <ResetConnectionModal
                visible={resetModalVisible}
                source={resetSource}
                onConfirm={this.resetConnection}
                onCancel={this.closeResetConnectionModal}
              />
            </div>
          </div>
        </ContainerBody>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch: Dispatch<SourceActionType>) => ({
  onLoadSources: (tenantId: number, page: number, pageSize: number) =>
    dispatch(SourceActions.loadSources(tenantId, page, pageSize)),
  onLoadSourceDetail: (sourceId: number, resolve: (source: ISource) => void) =>
    dispatch(SourceActions.loadSourceDetail(sourceId, resolve)),
  onAddSource: (source: ISource, resolve: () => any) =>
    dispatch(SourceActions.addSource(source, resolve)),
  onDeleteSource: (id: number, resolve: () => void) => dispatch(SourceActions.deleteSource(id, resolve)),
  onEditSource: (source: ISource, resolve: () => void) =>
    dispatch(SourceActions.editSource(source, resolve)),
  onTestSourceConnection: (testSource: Omit<ISource['config'], 'properties'>) =>
    dispatch(SourceActions.testSourceConnection(testSource)),
  onResetSourceConnection: (
    properties: SourceResetConnectionProperties,
    resolve: () => void
  ) => dispatch(SourceActions.resetSourceConnection(properties, resolve)),
  onValidateCsvTableName: (
    csvMeta: ICSVMetaInfo,
    callback: (errMsg?: string) => void
  ) => dispatch(SourceActions.validateCsvTableName(csvMeta, callback)),
  onUploadCsvFile: (
    csvMeta: ICSVMetaInfo,
    type,
    resolve: () => void,
    reject: () => void
  ) => dispatch(SourceActions.uploadCsvFile(csvMeta, type,resolve, reject)),
  onCheckUniqueName: (
    pathname: string,
    data: any,
    resolve: () => void,
    reject: (err: string) => void
  ) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject)),
  onLoadDatasourcesInfo: () => dispatch(SourceActions.loadDatasourcesInfo())
})

const mapStateToProps = createStructuredSelector({
  sources: makeSelectSources(),
  sourcesTotal: makeSelectSourcesTotal(),
  listLoading: makeSelectListLoading(),
  formLoading: makeSelectFormLoading(),
  testLoading: makeSelectTestLoading(),
  resetLoading: makeSelectResetLoading(),
  currentProject: makeSelectCurrentProject(),
  datasourcesInfo: makeSelectDatasourcesInfo(),
  user: makeSelectLoginUser()
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'source', reducer })
const withSaga = injectSaga({ key: 'source', saga })

export default compose(withReducer, withSaga, withConnect)(SourceList)
