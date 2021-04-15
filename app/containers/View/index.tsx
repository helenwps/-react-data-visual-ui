
/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import React from 'react'
import { compose, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import memoizeOne from 'memoize-one'
import Helmet from 'react-helmet'
import { Link } from 'react-router-dom'
import { RouteComponentWithParams } from 'utils/types'

import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import sagas from './sagas'
import globalSaga from 'app/containers/App/sagas.ts'
import globalReducer from 'app/containers/App/reducer'

import { checkNameUniqueAction } from 'containers/App/actions'
import { ViewActions, ViewActionType } from './actions'
import { makeSelectViews, makeSelectLoading } from './selectors'
import { makeSelectCurrentProject } from 'containers/Projects/selectors'
import {
  makeSelectLoginUser,
} from 'containers/App/selectors'
import ModulePermission from '../Account/components/checkModulePermission'
import { initializePermission } from '../Account/components/checkUtilPermission'

import {
  Table, Tooltip, Button, Row, Col, Breadcrumb, Icon, Popconfirm,
  message, Typography,
  Card,
  Menu,
  Dropdown,
  Modal
} from 'antd'
import { ColumnProps, PaginationConfig, SorterResult } from 'antd/lib/table'
import { ButtonProps } from 'antd/lib/button'
import Container, { ContainerTitle, ContainerBody } from 'components/Container'
import Box from 'components/Box'
import SearchFilterDropdown from 'components/SearchFilterDropdown'
import CopyModal from './components/CopyModal'

import { IViewBase, IView, IViewLoading } from './types'
import { IProject } from '../Projects/types'
import { EditOutline, EllipsisOutline, SettingOutline } from '@ant-design/icons';
import utilStyles from 'assets/less/util.less'
import './myView.less'
import SourceStyles from './Source.less'
import {usePagination} from 'app/containers/Widget/List.tsx'
import { renderText } from 'containers/View/util'
import { TextOverflow } from 'components/hook/usePublic'
const { Title } = Typography;

interface IViewListStateProps {
  views: {list: any[], [propName: string]: any;}
  currentProject: IProject
  loading: IViewLoading
  loginUser: any
}

interface IViewListDispatchProps {
  onLoadViews: (projectId: number, tenantId: number,page: number, pageSize: number) => void
  onDeleteView: (viewId: number, resolve: () => void) => void
  onCopyView: (view: IViewBase, resolve: () => void) => void
  onCheckName: (data, resolve, reject) => void
}

type IViewListProps = IViewListStateProps & IViewListDispatchProps & RouteComponentWithParams

interface IViewListStates {
  screenWidth: number
  tempFilterViewName: string
  filterViewName: string
  filterDropdownVisible: boolean
  tableSorter: SorterResult<IViewBase>

  copyModalVisible: boolean
  copyFromView: IViewBase
  changeView: number

  page: number
  pageSize: number
}

export class ViewList extends React.PureComponent<IViewListProps, IViewListStates> {

  public state: Readonly<IViewListStates> = {
    screenWidth: document.documentElement.clientWidth,
    tempFilterViewName: '',
    filterViewName: '',
    filterDropdownVisible: false,
    tableSorter: null,

    copyModalVisible: false,
    copyFromView: null,
    changeView: 1,
    page: 1,
    pageSize: 10
  }

  public componentWillMount() {
    const {page, pageSize} = this.state
    this.loadViews(page, pageSize)
    window.addEventListener('resize', this.setScreenWidth, false)
  }


  private loadViews = (page = 1, pageSize = 10) => {
    const { onLoadViews, match, loginUser: {tenantId} } = this.props
    const { projectId } = match.params
    this.setState({
      page,
      pageSize
    })
    console.log('run')
    onLoadViews(+projectId, tenantId, page, pageSize)
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.setScreenWidth, false)
  }

  private setScreenWidth = () => {
    this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  private getFilterViews = memoizeOne((viewName: string, views: IViewBase[] | any) => {
    if (!Array.isArray(views) || !views.length) { return [] }
    const regex = new RegExp(viewName, 'gi')
    const filterViews = views.filter((v) => v.name.match(regex) || v.description.match(regex))
    return filterViews
  })

  private static getViewPermission = memoizeOne((project: IProject) => ({
    viewPermission: initializePermission(project, 'viewPermission'),
    AdminButton: ModulePermission<ButtonProps>(project, 'view', true)(Button),
    EditButton: ModulePermission<ButtonProps>(project, 'view', false)(Button)
  }))

  private getTableColumns = (
    { viewPermission, AdminButton, EditButton }: ReturnType<typeof ViewList.getViewPermission>
  ) => {
    const { views } = this.props
    const { tempFilterViewName, filterViewName, filterDropdownVisible, tableSorter } = this.state
    const sourceNames = views.list.map(({ source }) => source.name) || []
    const columns: Array<ColumnProps<IViewBase>> = [{
      title: '名称',
      dataIndex: 'name',
      filterDropdown: (
        <SearchFilterDropdown
          placeholder="名称"
          value={tempFilterViewName}
          onChange={this.filterViewNameChange}
          onSearch={this.searchView}
        />
      ),
      filterDropdownVisible,
      onFilterDropdownVisibleChange: (visible: boolean) => this.setState({ filterDropdownVisible: visible }),
      sorter: (a, b) => (a.name > b.name ? 1 : -1),
      sortOrder: tableSorter && tableSorter.columnKey === 'name' ? tableSorter.order : void 0
    }, {
      title: '描述',
      dataIndex: 'description'
    }, {
      title: 'Source',
      dataIndex: 'sourceName',
      filterMultiple: false,
      onFilter: (val, record) => record.sourceName === val,
      filters: sourceNames
        .filter((name, idx) => sourceNames.indexOf(name) === idx)
        .map((name) => ({ text: name, value: name }))
    }]

    if (filterViewName) {
      const regex = new RegExp(`(${filterViewName})`, 'gi')
      columns[0].render = (text: string) => (
        <span
          dangerouslySetInnerHTML={{
            __html: text.replace(regex, `<span class="${utilStyles.highlight}">$1</span>`)
          }}
        />
      )
    }

    if (viewPermission) {
      columns.push({
        title: '操作',
        width: 150,
        className: utilStyles.textAlignCenter,
        render: (_, record) => (
          <span className="ant-table-action-column">
            <Tooltip title="复制">
              <EditButton icon="copy" shape="circle" type="ghost" onClick={this.copyView(record)} />
            </Tooltip>
            <Tooltip title="修改">
              <EditButton icon="edit" shape="circle" type="ghost" onClick={this.editView(record.id)} />
            </Tooltip>
            <Popconfirm
              title="确定删除？"
              placement="bottom"
              onConfirm={this.deleteView(record.id)}
            >
              <Tooltip title="删除">
                <AdminButton icon="delete" shape="circle" type="ghost" />
              </Tooltip>
            </Popconfirm>
          </span>
        )
      })
    }

    return columns
  }

  private tableChange = (_1, _2, sorter: SorterResult<IViewBase>) => {
    this.setState({ tableSorter: sorter })
  }

  private filterViewNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      tempFilterViewName: e.target.value,
      filterViewName: ''
    })
  }

  private searchView = (value: string) => {
    this.setState({
      filterViewName: value,
      filterDropdownVisible: false
    })
    window.event.preventDefault()
  }

  private basePagination: PaginationConfig = {
    defaultPageSize: 20,
    showSizeChanger: true
  }

  private addView = () => {
    const { history } = this.props
    history.push(`/user/view`)
  }

  private copyView = (fromView: IViewBase) => () => {
    this.setState({
      copyModalVisible: true,
      copyFromView: fromView
    })
  }

  private copy = (view: IViewBase) => {
    const { onCopyView } = this.props
    onCopyView(view, () => {
      this.setState({
        copyModalVisible: false
      })
      message.info('View 复制成功')
    })
  }

  private cancelCopy = () => {
    this.setState({ copyModalVisible: false })
  }

  private editView = (viewId: number) => () => {
    const { history, match } = this.props
    history.push(`/user/view/${viewId}`)
  }

  private deleteView = (viewId: number) => () => {
    const { onDeleteView } = this.props
    Modal.confirm({
      title: '确定要删除吗？',
      content: '删除后，该数据无法恢复。',
      okText: '确认',
      cancelText: '取消',
      icon: <Icon type="info-circle" />,
      onOk:  () =>{
        message.success('删除成功！')
        onDeleteView(viewId, () => {
          this.loadViews()
        })
      }
    });

  }

  private checkViewUniqueName = (viewName: string, resolve: () => void, reject: (err: string) => void) => {
    const { currentProject, onCheckName } = this.props
    onCheckName({ name: viewName, projectId: currentProject.id }, resolve, reject)
  }


  private renderViewList = () => {
    let { views } = this.props
    const menu = (record) => (
      <Menu>
        <Menu.Item key="1" disabled={record.status === 2} onClick={this.editView(record.id)}>编辑</Menu.Item>
        <Menu.Item key="2" onClick={this.deleteView(record.id)}>删除</Menu.Item>

        {/* {record.type != 'jdbc' && <Menu.Item key="3" onClick={this.showUploadModal(record.id)}>上传</Menu.Item>}
        {record.type == 'jdbc' && <Menu.Item key="4" onClick={this.openResetSource(record)}>重置链接</Menu.Item>} */}
      </Menu>
    )
    // views = views.concat(views)
    return views.list.map((record) => {
      const { id, name, description, type, sourceType, createTime, updateTime = '' } = record
      return (
        <Card className={SourceStyles['content-card']} key={id}>
          <p className={SourceStyles['inner-img']}><img src={require('assets/images/folder.png')} /></p>
          <p className={SourceStyles['inner-name']}><TextOverflow text={name} /></p>
          <p className={SourceStyles['inner-type']}><TextOverflow text={description} /></p>
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

  public render() {
    const { currentProject, views, loading, loginUser: {tenantId}, match, onLoadViews } = this.props
    const pagination = usePagination({
      total: views.total,
      current: this.state.page,
      changePage: this.loadViews
    })
    const { screenWidth, filterViewName } = this.state
    const { viewPermission, AdminButton, EditButton } = ViewList.getViewPermission(currentProject)
    const tableColumns = this.getTableColumns({ viewPermission, AdminButton, EditButton })
    const tablePagination: PaginationConfig = {
      ...this.basePagination,
      simple: screenWidth <= 768
    }
    const filterViews = this.getFilterViews(filterViewName, views)

    const { copyModalVisible, copyFromView } = this.state

    return (
      <div className={SourceStyles.sourceRoot} style={{padding: 10}}>
        <Container>
          <Helmet title="我的数据" />
          {/*<ContainerTitle>*/}
          {/*  <div style={{ 'fontSize': '18px' }}>我新增的数据</div>*/}
          {/*</ContainerTitle>*/}
          <div className={SourceStyles.mainTitle}>我新增的数据</div>
          <div>
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
                    <div
                      className={SourceStyles.createCard}
                      onClick={this.addView}
                    >
                      <div style={{ transform: 'translateY(-50%)', marginTop: '92px' }}>
                        <div className={SourceStyles['inner-text-add']}>
                          <i className="iconfont add-icon">&#xe6e7;</i>
                        </div>
                        <div className={SourceStyles['inner-text']}>新增数据</div>
                      </div>
                    </div>
                    {filterViews && this.renderViewList()}
                  </Col>
                </Row>
                {/* <SourceConfigModal
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
              /> */}
              </div>
            </div>
            <div style={{marginTop: '20px'}}>
              {views.list.length && pagination || ''}
            </div>
          </div>
        </Container>
        <CopyModal
          visible={copyModalVisible}
          loading={loading.copy}
          fromView={copyFromView}
          onCheckUniqueName={this.checkViewUniqueName}
          onCopy={this.copy}
          onCancel={this.cancelCopy}
        />
      </div>
    )
  }

}

const mapDispatchToProps = (dispatch: Dispatch<ViewActionType>) => ({
  onLoadViews: (projectId, tenantId, page, pageSize) => dispatch(ViewActions.loadViews(projectId, tenantId, page, pageSize)),
  onDeleteView: (viewId, resolve) => dispatch(ViewActions.deleteView(viewId, resolve)),
  onCopyView: (view, resolve) => dispatch(ViewActions.copyView(view, resolve)),
  onCheckName: (data, resolve, reject) => dispatch(checkNameUniqueAction('view', data, resolve, reject))
})

const mapStateToProps = createStructuredSelector({
  views: makeSelectViews(),
  currentProject: makeSelectCurrentProject(),
  loading: makeSelectLoading(),
  loginUser: makeSelectLoginUser()
})

const withConnect = connect<IViewListStateProps, IViewListDispatchProps, RouteComponentWithParams>(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'view', reducer })
const withSaga = injectSaga({ key: 'view', saga: sagas })
const withGlobalSaga = injectSaga({ key: 'global', saga: globalSaga })
const withGlobalReducer = injectReducer({ key: 'global', reducer: globalReducer })

export default compose(
  withReducer,
  withSaga,
  withGlobalSaga,
  withGlobalReducer,
  withConnect
)(ViewList)
