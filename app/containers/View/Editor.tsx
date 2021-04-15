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

import React, { useRef } from 'react'
import { compose, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import memoizeOne from 'memoize-one'
import Helmet from 'react-helmet'

import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import sagas from './sagas'
import reducerSource from 'containers/Source/reducer'
import sagasSource from 'containers/Source/sagas'
import reducerProject from 'containers/Projects/reducer'
import sagasProject from 'containers/Projects/sagas'

import { RouteComponentWithParams } from 'utils/types'
import { ViewActions, ViewActionType } from './actions'
import { SourceActions, SourceActionType } from 'containers/Source/actions'
import { OrganizationActions, OrganizationActionType } from 'containers/Organizations/actions'
import { makeSelectLoginUser } from '../App/selectors'

import {
  makeSelectEditingView,
  makeSelectEditingViewInfo,
  makeSelectSources,
  makeSelectSchema,
  makeSelectSqlDataSource,
  makeSelectSqlLimit,
  makeSelectSqlValidation,
  makeSelectLoading,

  makeSelectChannels,
  makeSelectTenants,
  makeSelectBizs,
  makeSelectIsLastExecuteWholeSql, makeStatisticsData, makeSelectSourcesResponse, makeSelectIsLoadingTreeDataIng
} from './selectors'

import { makeSelectProjectRoles } from 'containers/Projects/selectors'

import {
  IView, IViewModel, IViewRoleRaw, IViewRole, IViewVariable, IViewInfo,
  IExecuteSqlParams, IExecuteSqlResponse, IViewLoading, ISqlValidation,
  IDacChannel, IDacTenant, IDacBiz, StatisticsResult, IExcuteSqlStatisticsResponse, statisticsResponseData
} from './types'
import { ISource, ISchema, ISourceResponse, ISourceBase } from '../Source/types'
import { ViewVariableTypes } from './constants'

import {
  message,
  notification,
  Tooltip,
  Card,
  Steps,
  Button,
  Modal, Icon
} from 'antd'
import EditorSteps from './components/EditorSteps'
import EditorContainer from './components/EditorContainer'
import ModelAuth from './components/ModelAuth'
import ModifyType from './components/ModifyType'
import SourceTable from './components/SourceTable'
import SqlEditor from './components/SqlEditorByAce'
import SqlDataStatistics from './components/SqlDataStatistics'
import SqlPreview from './components/SqlPreview'
import EditorBottom from './components/EditorBottom'
import ViewVariableList from './components/ViewVariableList'
import VariableModal from './components/VariableModal'
const Step = Steps.Step
import Styles from './View.less'

import RenameField from './components/RenameField'
import OrderField from './components/OrderField'
import { getCronExpressionByPartition } from 'containers/Schedule/Editor'



interface IViewEditorStateProps {
  editingView: IView
  editingViewInfo: IViewInfo
  responseSources: ISourceResponse
  sources: ISourceBase[]
  schema: ISchema
  sqlDataSource: IExecuteSqlResponse
  sqlLimit: number
  sqlValidation: ISqlValidation
  loading: IViewLoading
  projectRoles: any[]
  channels: IDacChannel[]
  tenants: IDacTenant[]
  bizs: IDacBiz[],
  isLoadTreeDataIng: boolean,
  loginUser: any
  isLastExecuteWholeSql: boolean
  statistics: IExcuteSqlStatisticsResponse<statisticsResponseData>
}
export enum EExecuteType {
  whole,
  single
}
interface IViewEditorDispatchProps {
  onLoadViewDetail: (viewId: number) => void
  onLoadSources: (tenantId: number) => void
  onLoadSourceDatabases: (sourceId: number) => void
  onLoadDatabaseTables: (sourceId: number, databaseName: string) => void
  onLoadTableColumns: (sourceId: number, databaseName: string, tableName: string) => void
  onExecuteSql: (params: IExecuteSqlParams, exeType: EExecuteType, isRunStatistics) => void
  onAddView: (view: IView, resolve: () => void) => void
  onEditView: (view: IView, resolve: () => void) => void
  onUpdateEditingView: (view: IView) => void
  onUpdateEditingViewInfo: (viewInfo: IViewInfo) => void
  onSetSqlLimit: (limit: number) => void

  onLoadDacChannels: () => void,
  onLoadDacTenants: (channelName: string) => void,
  onLoadDacBizs: (channelName: string, tenantId: number) => void,

  onResetState: () => void
  onLoadProjectRoles: (projectId: number) => void
  onSetIsLastExecuteWholeSql: (isLastExecuteWholeSql: boolean) => void


  statistics: (statistics: StatisticsResult) => void
}

type IViewEditorProps = IViewEditorStateProps & IViewEditorDispatchProps & RouteComponentWithParams

interface IViewEditorStates {
  containerHeight: number
  sqlValidationCode: number
  init: boolean
  currentStep: number
  lastSuccessExecutedSql: string
  sqlFragment: string
  renameFieldVisible: boolean
  modifyTypeVisible: boolean
  orderFieldVisible: boolean
  tempType: IViewInfo
}

export class ViewEditor extends React.Component<IViewEditorProps, IViewEditorStates> {

  public state = {
    containerHeight: 0,
    currentStep: 0,
    sqlValidationCode: null,
    init: true,
    lastSuccessExecutedSql: null,   //所有的sql字符串
    sqlFragment: '',   //选择执行的sql
    renameFieldVisible: false, //列名更改
    modifyTypeVisible: false, //更改字段类型
    orderFieldVisible:false,
    orders: [],
    tempType: JSON.parse(JSON.stringify(this.props.editingViewInfo))
  }

  public constructor(props: IViewEditorProps) {
    super(props)
    const { onLoadSources, onLoadViewDetail, onLoadProjectRoles, onLoadDacChannels, match } = this.props
    const { viewId, projectId } = match.params   //项目id 数据视图id
    console.log(match.params, '123')
    onLoadSources(+this.props.loginUser.tenantId)   //数据源
    if (projectId) {
      onLoadProjectRoles(+projectId)   //项目角色
      //如果是编辑 就加载视图详情
    }
    if (viewId) {
      onLoadViewDetail(+viewId)
    }
    onLoadDacChannels()
  }
  private renameFieldForm: any
  private orderFieldForm: any
  private nameDesFieldForm: any
  private sqlPreviewDom: any
  private refHandles = {
    renameFieldForm: (ref) => this.renameFieldForm = ref,
    orderFieldForm: (ref) => this.orderFieldForm = ref,
    nameDesFieldForm: (ref) => this.nameDesFieldForm = ref,
    sqlPreviewDom: (ref) => this.sqlPreviewDom = ref,
  }

  private static isPageExecSql = false

  public static getDerivedStateFromProps:
    React.GetDerivedStateFromProps<IViewEditorProps, IViewEditorStates>
    = (props, state) => {
      const { match, editingView, sqlValidation } = props
      const { viewId } = match.params
      const { init, sqlValidationCode } = state
      let { lastSuccessExecutedSql } = state
      //只有返回的成功或失败的请求才会销毁原来的提示框  创建一个新的
      if (sqlValidationCode !== sqlValidation.code && sqlValidation.code) {
        notification.destroy()
        if(!ViewEditor.isPageExecSql){
          sqlValidation.code === 200
          ? notification.success({
            message: '执行成功',
            duration: 3
          })
          : notification.error({
            message: '执行失败',
            description: (
              <Tooltip
                placement="bottom"
                trigger="click"
                title={sqlValidation.message}
                overlayClassName={Styles.errorMessage}
              >
                <a>点击查看错误信息</a>
              </Tooltip>
            ),
            duration: 10
          })
        }

        if (sqlValidation.code === 200) {
          lastSuccessExecutedSql = editingView.sourceSql
        }
      }
      if (editingView && editingView.id === +viewId) {
        if (init) {
          props.onLoadSourceDatabases(editingView.sourceId)
          lastSuccessExecutedSql = editingView.sourceSql
          return {
            init: false,
            sqlValidationCode: sqlValidation.code,
            lastSuccessExecutedSql
          }
        }
      }
      return { sqlValidationCode: sqlValidation.code, lastSuccessExecutedSql }
    }

  public componentWillUnmount() {
    this.props.onResetState()
    notification.destroy()
  }
  private getOrder = () => {
    let copyOrders = JSON.parse(this.props.editingView.order || '[]')
    console.log(copyOrders, 'copyOrders')
    copyOrders = copyOrders.map(row => { return {column: row.field, direction: row.order}})
    return copyOrders
  }
  //数据预览手动执行的sql
  private executeSql = () => {
    let newPageSize = {
      current:1,
      pageSize:10
    }
    ViewEditor.isPageExecSql = false
    this.doExecuteSql(newPageSize, this.getOrder())
  }

  //数据预览分页执行的sql
  private fenyeExecuteSql = (newPageSize = null) => {
    ViewEditor.isPageExecSql = true
    this.doExecuteSql(newPageSize, this.getOrder(), false)
  }

  private doExecuteSql = (newPageSize = null, orders = [], isRunStatistics = true)=>{
    const { sqlFragment } = this.state
    //是否执行整个sql字符串
    const { onSetIsLastExecuteWholeSql } = this.props
    if (sqlFragment != null) {
      onSetIsLastExecuteWholeSql(false)  //不是执行全部sql
    }
    ViewEditor.ExecuteSql(this.props, this.state.sqlFragment,newPageSize, orders, isRunStatistics)
  }

  private static ExecuteSql = (props: IViewEditorProps, sqlFragment?: string,newPageSize = null,orders = [], isRunStatistics = true) => {
    const { onExecuteSql, editingView, editingViewInfo, sqlLimit } = props
    const { sourceId, sourceSql } = editingView  //数据源  查询数据
    if (!(sourceSql && sourceSql.trim())) {
      message.warning('sql不能为空，请先填写要执行的sql！')
      return
    }
    const { variable } = editingViewInfo
    let updatedParams: IExecuteSqlParams = {
      sourceId,
      sourceSql: sqlFragment || sourceSql,
      limit: sqlLimit,
      variables: variable,
      orders: orders || [],
      type: 'executeSql'   //执行类型   1是获取数据
    }

    if(newPageSize){
      updatedParams={
        ...updatedParams,
        ...newPageSize,
        pageNo:newPageSize.current
      }
    }
    const exeType = sqlFragment == null ? EExecuteType.whole : EExecuteType.single
    onExecuteSql(updatedParams, exeType, isRunStatistics)
  }
  // 上一步  下一步
  private stepChange = async (step: number) => {
    const { currentStep } = this.state
    if (currentStep + step < 0) {
      this.goToViewList()
      return
    }
    const { editingView } = this.props
    const { sourceId, sourceSql } = editingView
    const errorMessages = ['请选择数据源', 'sql 不能为空']
    // const fieldsValue = [name, sourceId, sql]
    const fieldsValue = [ sourceId, sourceSql]
    //切换到下一步时校验必填参数
    const hasError = fieldsValue.some((val, idx) => {
      if (!val) {
        message.error(errorMessages[idx])
        return true
      }
    })
    if (hasError) { return }

    if(currentStep==1 && step==1){  // 如果是第二步的保存  需要检验值的正确  就去提交到后台
      console.log('save11')
      const result = await this.nameDesFieldForm.props.form.validateFields()
      if (result.error) {
        return
      }
      const childResult = await this.nameDesFieldForm.childRef.validateFields()
      console.log(childResult, 'childResult')
      if (childResult.error) {
        return
      }
      if (currentStep + step > 1) {
        this.saveView(childResult)   // 如果是第二步的  就去提交到后台
        return
      }
    }else{
      if (currentStep + step > 1) {
        this.saveView()   // 如果是第二步的  就去提交到后台
        return
      }
    }
    this.setState({currentStep: currentStep + step})
  }

  private saveView = (childParams: any = {}) => {
    console.log(childParams, 'childParams')
    const { onAddView, onEditView, editingView, editingViewInfo, projectRoles, match, loginUser } = this.props
    const { projectId } = match.params
    const { model, variable, roles } = editingViewInfo   //model是字段模型   roles没有
    const { id: viewId } = editingView
    const validRoles = roles.filter(({ roleId }) => projectRoles && projectRoles.findIndex(({ id }) => id === roleId) >= 0)
    // sql转换为sourceSql
    const sourceSql = editingView.sourceSql
    let updatedView: IView = {
      ...editingView,
      sourceSql,
      tenantId: loginUser?.tenantId,
      isManually: childParams.isManually || false,
      cronExpression: childParams.isManually ? childParams.cronExpression : getCronExpressionByPartition(childParams),
      projectId: +projectId,
      status: viewId ? 1 : 2,
      model: JSON.stringify(model),
      variable: JSON.stringify(variable),
      roles: validRoles.map<IViewRoleRaw>(({ roleId, columnAuth, rowAuth }) => {
        const validColumnAuth = columnAuth.filter((c) => !!model[c])
        const validRowAuth = rowAuth.filter((r) => {
          const v = variable.find((v) => v.name === r.name)
          if (!v) { return false }
          return (v.type === ViewVariableTypes.Authorization && !v.fromService)
        })
        return {
          roleId,
          columnAuth: JSON.stringify(validColumnAuth),
          rowAuth: JSON.stringify(validRowAuth)
        }
      })
    }

    //判断是否有文件 如果有文件 把文件追加
    if(this.renameFieldForm && this.renameFieldForm.state.files.length){
      updatedView = {
        ...updatedView,
        file:this.renameFieldForm.state.files[0]
      }
    }
    console.log("editingView", editingView)
    //编辑或者新增
    viewId ? onEditView(updatedView, this.goToViewList) : onAddView(updatedView, this.goToViewList)
  }

  private goToViewList = (isNeedMsg: boolean = true) => {
    const { history } = this.props
    if (isNeedMsg) {
      message.success('操作成功！')
    }
    history.push(`/user/views`)
  }



  private viewChange = (propName: keyof IView, value: string | number | object | any) => {
    const { editingView, onUpdateEditingView } = this.props
    console.log(propName, value, 'abc')
    let updatedView = {
      ...editingView,
      [propName]: value
    }

    onUpdateEditingView(updatedView)
  }

  private sqlChange = (sql: string) => {
    this.viewChange('sourceSql', sql)
  }

  private sqlSelect = (sqlFragment: string) => {
    this.setState({ sqlFragment })
  }

  private modelChange = (partialModel: IViewModel) => {
    const { editingViewInfo, onUpdateEditingViewInfo } = this.props
    const { model } = editingViewInfo
    const updatedViewInfo: IViewInfo = {
      ...editingViewInfo,
      model: { ...model, ...partialModel }
    }
    onUpdateEditingViewInfo(updatedViewInfo)
  }

  private variableChange = (updatedVariable: IViewVariable[]) => {
    const { editingViewInfo, onUpdateEditingViewInfo } = this.props
    const updatedViewInfo: IViewInfo = {
      ...editingViewInfo,
      variable: updatedVariable
    }
    onUpdateEditingViewInfo(updatedViewInfo)
  }

  /**
   * 数组长度1为单选，大于1为全选
   * @param {IViewRole[]} viewRoles
   * @private
   * @memberof ViewEditor
   */
  private viewRoleChange = (viewRoles: IViewRole[]) => {
    const { editingViewInfo, onUpdateEditingViewInfo } = this.props
    let updatedRoles: IViewRole[] = []
    if (viewRoles.length === 1) {
      const [viewRole] = viewRoles
      const { roles } = editingViewInfo
      updatedRoles = roles.filter((role) => role.roleId !== viewRole.roleId)
      updatedRoles.push(viewRole)
    } else {
      updatedRoles = viewRoles
    }
    const updatedViewInfo = {
      ...editingViewInfo,
      roles: updatedRoles
    }
    onUpdateEditingViewInfo(updatedViewInfo)
  }

  private getSqlHints = memoizeOne((sourceId: number, schema: ISchema, variables: IViewVariable[]) => {
    if (!sourceId) { return {} }

    const variableHints = variables.reduce((acc, v) => {
      acc[`$${v.name}$`] = []
      return acc
    }, {})
    const { mapDatabases, mapTables, mapColumns } = schema
    if (!mapDatabases[sourceId]) { return {} }

    const tableHints: { [tableName: string]: string[] } = Object.values(mapTables).reduce((acc, tablesInfo) => {
      if (tablesInfo.sourceId !== sourceId) { return acc }

      tablesInfo.tables.forEach(({ name: tableName }) => {
        acc[tableName] = []
      })
      return acc
    }, {})

    Object.values(mapColumns).forEach((columnsInfo) => {
      if (columnsInfo.sourceId !== sourceId) { return }
      const { tableName, columns } = columnsInfo
      if (tableHints[tableName]) {
        tableHints[tableName] = tableHints[tableName].concat(columns.map((col) => col.name))
      }
    })

    const hints = {
      ...variableHints,
      ...tableHints
    }
    return hints
  })

  // 关闭弹框
  private closeRenameFieldModal = () => {
    this.renameFieldForm.props.form.resetFields()
    this.setState({
      renameFieldVisible: false
    })
  }
  private closeOrderModal = () => {
    this.orderFieldForm.props.form.resetFields()
    this.setState({
      orderFieldVisible: false
    })
  }

  // 列名更改
  private showRenameFieldModal = (flag) => {
    if (!flag) {
      // 如果是关闭弹窗，须交验数据
      this.renameFieldForm.props.form.validateFields((err, values) => {
        if (!err) {
          const { keys, names } = values;
          console.log(values, 'values')
          let renames = keys.map(key => names[key])
          this.viewChange("rename", JSON.stringify(renames))
          // console.log(this.renameFieldForm.state.files)
          this.setState({
            renameFieldVisible: flag
          })
        }
      })
    } else {
      //打开弹窗
      this.setState({
        renameFieldVisible: flag
      })
    }
  }
  //更改字段类型
  private showModifyTypeModal = (flag) => {
    const {onUpdateEditingViewInfo} = this.props
    // 显示
    flag && this.setState( {
      tempType: JSON.parse(JSON.stringify(this.props.editingViewInfo))
    })
    this.setState({
      modifyTypeVisible: flag
    })
  }


  //排序
  showOrderFieldModal = (flag)=>{
    if (!flag) {
      // 如果是关闭弹窗，须交验数据
      this.orderFieldForm.props.form.validateFields((err, values) => {
        if (!err) {
          let { keys, orders } = values;
          orders = keys.map(key => orders[key])
          console.log(orders, keys, '1111')
          let copyOrders = JSON.parse(JSON.stringify(orders))
          copyOrders = copyOrders.map(row => { return {column: row.field, direction: row.order}})
          // 排序也需要执行sql
          const newPageSize = {
            current:1,
            pageSize:this.sqlPreviewDom.state.pageSize
          }
          this.doExecuteSql(newPageSize, copyOrders, false)
          this.viewChange("order", JSON.stringify(orders))
          this.setState({
            orderFieldVisible: flag
          })
        }
      })
    } else {
      //打开弹窗
      this.setState({
        orderFieldVisible: flag
      })
    }
  }
  private cancelModifyTypeModal = () => {
    this.props.onUpdateEditingViewInfo(this.state.tempType)
    this.setState({modifyTypeVisible: false})
  }

  public render() {

    const {
      responseSources = {sources: []}, schema,
      sqlDataSource, sqlLimit, loading, projectRoles,
      channels, tenants, bizs,
      editingView, editingViewInfo,
      isLastExecuteWholeSql,
      onLoadSourceDatabases, onLoadDatabaseTables, onLoadTableColumns, onSetSqlLimit,
      onLoadDacTenants, onLoadDacBizs,
      statistics,
      isLoadTreeDataIng
    } = this.props

    const { currentStep, lastSuccessExecutedSql, sqlFragment } = this.state
    const { model, variable, roles: viewRoles } = editingViewInfo
    const sqlHints = this.getSqlHints(editingView.sourceId, schema, variable)
    const containerVisible = !currentStep
    const modelAuthVisible = !!currentStep
    const nextDisabled = (editingView.sourceSql !== lastSuccessExecutedSql)

    const { id: viewId } = editingView

    const steps = (
      <Steps size="small" current={this.state.currentStep} style={{ marginRight: 0,width:250 }}>
        <Step title="数据导入" />
        <Step title="数据设置" />
      </Steps>
    )

    const cardNav = (
      <div className={Styles.nav} onClick={() => this.goToViewList(false)}>
        <Icon type="arrow-left" />
        <span style={{paddingLeft: 10}}>{viewId ? '编辑数据' : '新增数据'}</span>
      </div>
    )

    return (
      <>
        <Helmet title="View" />
        <div className={Styles.viewEditorContainer} style={{ overflow: 'auto', position: "relative", display: 'flex', flexDirection: 'column', height: 'calc(100vh - 118px)', minHeight: 600 }}>
          <Card size="small" title={cardNav} extra={steps} style={{ flex: 1, height: '100%'}}>
            <div className={Styles.viewEditor}>
              {/* <div className={Styles.header}>
              新增数据
              <div className={Styles.steps}>
                <EditorSteps current={currentStep} />
              </div>
            </div> */}
              <EditorContainer
                visible={containerVisible}
                variable={variable}
                onVariableChange={this.variableChange}
              >
                {/* 左侧 */}
                <SourceTable
                  key="SourceTable"
                  view={editingView}
                  isLoadTreeDataIng={isLoadTreeDataIng}
                  sourceType={editingView.source ? editingView.source.type : ""}
                  sources={responseSources.sources}
                  schema={schema}
                  onViewChange={this.viewChange}
                  onSourceSelect={onLoadSourceDatabases}
                  onDatabaseSelect={onLoadDatabaseTables}
                  onTableSelect={onLoadTableColumns}
                />



                <SqlEditor key="SqlEditor" value={editingView.sourceSql} hints={sqlHints} onSqlChange={this.sqlChange} onSelect={this.sqlSelect} onCmdEnter={this.executeSql} executeSql={this.executeSql} />

                {/*数据统计*/}
                <SqlDataStatistics rename={editingView.rename} statistics={statistics} key='SqlDataStatistics' value={editingView.sourceSql}/>

                <SqlPreview key="SqlPreview"
                            ref={this.refHandles.sqlPreviewDom}
                            size="small" loading={loading.execute}
                  response={sqlDataSource}
                            rename={editingView.rename}
                  showModifyTypeModal={this.showModifyTypeModal}
                  showRenameFieldModal={this.showRenameFieldModal}
                  showOrderFieldModal={this.showOrderFieldModal}
                  fenyeExecuteSql={this.fenyeExecuteSql}
                />



                {/* <EditorBottom
                key="EditorBottom"
                sqlLimit={sqlLimit}
                loading={loading.execute}
                nextDisabled={nextDisabled}
                sqlFragment={sqlFragment}
                isLastExecuteWholeSql={isLastExecuteWholeSql}
                onSetSqlLimit={onSetSqlLimit}
                onExecuteSql={this.executeSql}
                onStepChange={this.stepChange}
              /> */}
                <ViewVariableList key="ViewVariableList" variables={variable} />
                <VariableModal
                  key="VariableModal"
                  channels={channels}
                  tenants={tenants}
                  bizs={bizs}
                  onLoadDacTenants={onLoadDacTenants}
                  onLoadDacBizs={onLoadDacBizs}
                />
              </EditorContainer>
              <ModelAuth
                visible={modelAuthVisible}
                model={model}
                view={editingView}
                onViewChange={this.viewChange}
                variable={variable}
                sqlColumns={sqlDataSource.columns}
                roles={projectRoles}
                viewRoles={viewRoles}
                onModelChange={this.modelChange}
                onViewRoleChange={this.viewRoleChange}
                onStepChange={this.stepChange}
                wrappedComponentRef={this.refHandles.nameDesFieldForm}
              />
            </div>

          </Card>
          <div>
            <EditorBottom
              key="EditorBottom"
              sqlLimit={sqlLimit}
              loading={loading.execute}
              nextDisabled={nextDisabled}
              sqlFragment={sqlFragment}
              isLastExecuteWholeSql={isLastExecuteWholeSql}
              onSetSqlLimit={onSetSqlLimit}
              onExecuteSql={this.executeSql}
              goBack={() => this.goToViewList(false)}
              onStepChange={this.stepChange}
              currentStep={this.state.currentStep}

            />
          </div>
        </div>

        <Modal
          visible={this.state.modifyTypeVisible}
          title={"更改字段类型"}
          okText={"确定"}
          cancelText={"取消"}
          onCancel={() => this.setState({modifyTypeVisible: false})}
          footer={
            <>
              <Button onClick={this.cancelModifyTypeModal}>取消</Button>
              <Button type="primary" onClick={() => this.showModifyTypeModal(false)}>确认</Button>
            </>
          }
        >
          <ModifyType
            model={model}
            view={editingView}
            onViewChange={this.viewChange}
            variable={variable}
            sqlColumns={sqlDataSource.columns}
            roles={projectRoles}
            viewRoles={viewRoles}
            onModelChange={this.modelChange}
            onViewRoleChange={this.viewRoleChange}
            onStepChange={this.stepChange}
          />
        </Modal>



{/* 之前的信息还要保留，因为文件上传可能会失败 */}
        <Modal
          visible={this.state.renameFieldVisible}

          title={"列名更改"}
          okText={"确认"}
          cancelText={"取消"}
          onCancel={() => this.closeRenameFieldModal()}
          maskClosable={false}
          footer={
            <>
              <Button onClick={() => this.closeRenameFieldModal()}>取消</Button>
              <Button type="primary" onClick={() => this.showRenameFieldModal(false)}>确认</Button>
            </>
          }
        >
          <RenameField
            wrappedComponentRef={this.refHandles.renameFieldForm}
            model={model}
            editingView={editingView}
          />
        </Modal>

{/* 排序 */}
        <Modal
          visible={this.state.orderFieldVisible}

          title={"排序"}
          okText={"确认"}
          cancelText={"取消"}
          onCancel={() => this.closeOrderModal()}
          maskClosable={false}
          footer={
            <>
              <Button onClick={() => this.closeOrderModal()}>取消</Button>
              <Button type="primary" onClick={() => this.showOrderFieldModal(false)}>确认</Button>
            </>
          }
        >
          <OrderField
            wrappedComponentRef={this.refHandles.orderFieldForm}
            model={model}
            editingView={editingView}
          />
        </Modal>





        {/* <div className={Styles.viewEditor}>
          <div className={Styles.header}>
            <div className={Styles.steps}>
              <EditorSteps current={currentStep} />
            </div>
          </div>
          <EditorContainer
            visible={containerVisible}
            variable={variable}
            onVariableChange={this.variableChange}
          >
            {/* 左侧 */}{/*
            <SourceTable
              key="SourceTable"
              view={editingView}
              sources={sources}
              schema={schema}
              onViewChange={this.viewChange}
              onSourceSelect={onLoadSourceDatabases}
              onDatabaseSelect={onLoadDatabaseTables}
              onTableSelect={onLoadTableColumns}
            />
            <SqlEditor key="SqlEditor" value={editingView.sql} hints={sqlHints} onSqlChange={this.sqlChange} onSelect={this.sqlSelect} onCmdEnter={this.executeSql} />

            <SqlPreview key="SqlPreview" size="small" loading={loading.execute} response={sqlDataSource} />
            <EditorBottom
              key="EditorBottom"
              sqlLimit={sqlLimit}
              loading={loading.execute}
              nextDisabled={nextDisabled}
              sqlFragment={sqlFragment}
              isLastExecuteWholeSql={isLastExecuteWholeSql}
              onSetSqlLimit={onSetSqlLimit}
              onExecuteSql={this.executeSql}
              onStepChange={this.stepChange}
            />
            <ViewVariableList key="ViewVariableList" variables={variable} />
            <VariableModal
              key="VariableModal"
              channels={channels}
              tenants={tenants}
              bizs={bizs}
              onLoadDacTenants={onLoadDacTenants}
              onLoadDacBizs={onLoadDacBizs}
            />
          </EditorContainer>
          <ModelAuth
            visible={modelAuthVisible}
            model={model}
            variable={variable}
            sqlColumns={sqlDataSource.columns}
            roles={projectRoles}
            viewRoles={viewRoles}
            onModelChange={this.modelChange}
            onViewRoleChange={this.viewRoleChange}
            onStepChange={this.stepChange}
          />
        </div> */}
      </>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  onLoadViewDetail: (viewId: number) => dispatch(ViewActions.loadViewsDetail([viewId], null, true)),
  onLoadSources: (tenantId) => dispatch(SourceActions.loadSources(tenantId)),
  onLoadSourceDatabases: (sourceId) => dispatch(SourceActions.loadSourceDatabases(sourceId)),
  onLoadDatabaseTables: (sourceId, databaseName) => dispatch(SourceActions.loadDatabaseTables(sourceId, databaseName)),
  onLoadTableColumns: (sourceId, databaseName, tableName) => dispatch(SourceActions.loadTableColumns(sourceId, databaseName, tableName)),
  onExecuteSql: (params, exeType = 0, isRunStatistics) => dispatch(ViewActions.executeSql(params, exeType, isRunStatistics)),
  onSetIsLastExecuteWholeSql: (isLastExecuteWholeSql: boolean) => dispatch(ViewActions.setIsLastExecuteWholeSql(isLastExecuteWholeSql)),
  onAddView: (view, resolve) => dispatch(ViewActions.addView(view, resolve)),
  onEditView: (view, resolve) => dispatch(ViewActions.editView(view, resolve)),
  onUpdateEditingView: (view) => dispatch(ViewActions.updateEditingView(view)),
  onUpdateEditingViewInfo: (viewInfo: IViewInfo) => dispatch(ViewActions.updateEditingViewInfo(viewInfo)),
  onSetSqlLimit: (limit: number) => dispatch(ViewActions.setSqlLimit(limit)),

  onLoadDacChannels: () => dispatch(ViewActions.loadDacChannels()),
  onLoadDacTenants: (channelName) => dispatch(ViewActions.loadDacTenants(channelName)),
  onLoadDacBizs: (channelName, tenantId) => dispatch(ViewActions.loadDacBizs(channelName, tenantId)),

  onResetState: () => dispatch(ViewActions.resetViewState()),
  onLoadProjectRoles: (projectId) => dispatch(OrganizationActions.loadProjectRoles(projectId))
})

const mapStateToProps = createStructuredSelector({
  editingView: makeSelectEditingView(),
  editingViewInfo: makeSelectEditingViewInfo(),
  sources: makeSelectSources(),
  responseSources: makeSelectSourcesResponse(),
  schema: makeSelectSchema(),
  sqlDataSource: makeSelectSqlDataSource(),
  sqlLimit: makeSelectSqlLimit(),
  sqlValidation: makeSelectSqlValidation(),
  loading: makeSelectLoading(),
  projectRoles: makeSelectProjectRoles(),
  isLoadTreeDataIng: makeSelectIsLoadingTreeDataIng(),
  channels: makeSelectChannels(),
  tenants: makeSelectTenants(),
  bizs: makeSelectBizs(),
  loginUser: makeSelectLoginUser(),

  isLastExecuteWholeSql: makeSelectIsLastExecuteWholeSql(),

  statistics: makeStatisticsData()
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'view', reducer })
const withSaga = injectSaga({ key: 'view', saga: sagas })
const withReducerSource = injectReducer({ key: 'source', reducer: reducerSource })
const withSagaSource = injectSaga({ key: 'source', saga: sagasSource })
const withReducerProject = injectReducer({ key: 'project', reducer: reducerProject })
const withSagaProject = injectSaga({ key: 'project', saga: sagasProject })

export default compose(
  withReducer,
  withReducerSource,
  withSaga,
  withSagaSource,
  withReducerProject,
  withSagaProject,
  withConnect
)(ViewEditor)
