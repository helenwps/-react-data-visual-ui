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

import { call, put, all, takeLatest, takeEvery } from 'redux-saga/effects'
import { ActionTypes } from './constants'
import { ViewActions, ViewActionType } from './actions'
import omit from 'lodash/omit'

import axios, { AxiosResponse, AxiosError, CancelTokenSource } from 'axios'
import request, { IDavinciResponse } from 'utils/request'
import api from 'utils/api'
import { errorHandler, getErrorMessage } from 'utils/util'

import {
  IViewBase,
  IView,
  IExecuteSqlResponse,
  IViewVariable,
  IExcuteSqlStatisticsResponse,
  statisticsResponseData
} from './types'
import { EExecuteType } from './Editor'

export function* getViews (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_VIEWS) { return }
  const { payload } = action
  const {tenantId, projectId, page, pageSize, rest = []} = payload
  const { viewsLoaded, loadViewsFail } = ViewActions
  const requestBody: any = {
    projectId,
    tenantId,
    ...(rest.length && {status: rest [0]}),
    ...(page && {page}),
    ...(pageSize && {pageSize})
  }
  let views: IViewBase[]
  console.log(requestBody, rest, '111')
  try {
    const asyncData = yield call(request, {
      url: `${api.viewList}`,
      method: 'post',
      data: requestBody
    })
    views = asyncData.payload
    console.log(views, '222')
    yield put(viewsLoaded(views))
  } catch (err) {
    yield put(loadViewsFail())
    errorHandler(err)
  } finally {
    if (payload.resolve) {
      payload.resolve(views)
    }
  }
}

//获取数据视图详情
export function* getViewsDetail (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_VIEWS_DETAIL) { return }
  const { payload } = action
  const { viewsDetailLoaded, loadViewsDetailFail } = ViewActions
  const { viewIds, resolve, isEditing } = payload
  try {
    // @FIXME make it be a single request
    const asyncData = yield all(viewIds.map((viewId) => (call(request, `${api.view}/${viewId}`))))
    const views: IView[] = asyncData.map((item) => item.payload)
    yield put(viewsDetailLoaded(views, isEditing))
    if (resolve) { resolve(views) }
  } catch (err) {
    yield put(loadViewsDetailFail())
    errorHandler(err)
  }
}

export function* addView (action: ViewActionType) {
  if (action.type !== ActionTypes.ADD_VIEW) { return }
  const { payload } = action
  const { view, resolve } = payload
  const { viewAdded, addViewFail } = ViewActions

  let formData = new FormData()
    Object.entries(view).forEach(([fieldName, fieldValue]) => {
      if (fieldValue || fieldValue === 0) {
        if(["source","roles"].includes(fieldName)){
          fieldValue = JSON.stringify(fieldValue)
        }
        if(["source","roles"].includes(fieldName)){
          return
        }
        formData.append(fieldName, fieldValue)
      }
    })
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.view,
      data: formData
    })
    yield put(viewAdded(asyncData.payload))
    resolve()
  } catch (err) {
    yield put(addViewFail())
    errorHandler(err)
  }
}

export function* editView (action: ViewActionType) {
  if (action.type !== ActionTypes.EDIT_VIEW) { return }
  const { payload } = action
  const { view, resolve } = payload
  const { viewEdited, editViewFail } = ViewActions

  let formData = new FormData()
    Object.entries(view).forEach(([fieldName, fieldValue]) => {
      if (fieldValue || fieldValue === 0) {
        if(["source","roles"].includes(fieldName)){
          fieldValue = JSON.stringify(fieldValue)
        }
        if(["source","roles"].includes(fieldName)){
          return
        }
        formData.append(fieldName, fieldValue)
      }
    })


  try {
    yield call(request, {
      method: 'post',
      url: `${api.view}/update/${view.id}`,
      data: formData
    })
    yield put(viewEdited(view))
    resolve()
  } catch (err) {
    yield put(editViewFail())
    errorHandler(err)
  }
}

export function* deleteView (action: ViewActionType) {
  if (action.type !== ActionTypes.DELETE_VIEW) { return }
  const { payload } = action
  const { viewDeleted, deleteViewFail } = ViewActions
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.view}/${payload.id}`
    })
    yield put(viewDeleted(payload.id))
    payload.resolve(payload.id)
  } catch (err) {
    yield put(deleteViewFail())
    errorHandler(err)
  }
}

export function* copyView (action: ViewActionType) {
  if (action.type !== ActionTypes.COPY_VIEW) { return }
  const { view, resolve } = action.payload
  const { viewCopied, copyViewFail } = ViewActions
  try {
    const fromViewResponse = yield call(request, `${api.view}/${view.id}`)
    const fromView = fromViewResponse.payload
    const copyView: IView = { ...fromView, name: view.name, description: view.description }
    const asyncData = yield call(request, {
      method: 'post',
      url: api.view,
      data: copyView
    })
    yield put(viewCopied(fromView.id, asyncData.payload))
    resolve()
  } catch (err) {
    yield put(copyViewFail())
    errorHandler(err)
  }
}

let cancelTokenSource = null as CancelTokenSource

export function* executeSql (action: ViewActionType) {
  console.log(action, 'ViewActionType', cancelTokenSource)
  if (action.type !== ActionTypes.EXECUTE_SQL) { return }
  const { sqlExecuted, executeSqlFail, executeSqlCancel, setIsLastExecuteWholeSql } = ViewActions
  // if (cancelTokenSource) {
  //   cancelTokenSource.cancel('cancel execute')
  //   yield put(executeSqlCancel())
  //   return cancelTokenSource = null
  // }
  cancelTokenSource = axios.CancelToken.source()
  const { params, exeType, isRunStatistics } = action.payload
  const { variables, ...rest } = params
  const sql = rest.sourceSql || params.sql
  const omitKeys: Array<keyof IViewVariable> = ['key', 'alias', 'fromService']
  const variableParam = Array.from(variables).map((v) => omit(v, omitKeys))
  try {
    const asyncData: IDavinciResponse<IExecuteSqlResponse> = yield call(request, {
      method: 'post',
      url: `${api.view}/executesql`,
      data: {
        ...rest,
        sql,
        variables: variableParam
      },
      cancelToken: cancelTokenSource.token
    })
    console.log(asyncData, 'asyncData')
    yield put(sqlExecuted(asyncData))
    const isLastExecuteWholeSql = exeType === EExecuteType.whole ? true : false
    yield put(setIsLastExecuteWholeSql(isLastExecuteWholeSql))
    cancelTokenSource = null
    if (isRunStatistics) {
      let nextAction = JSON.parse(JSON.stringify(action))
      nextAction.type = ActionTypes.GET_STATISTICS_DATA
      yield getStatisticsData(nextAction)
    }
  } catch (err) {
    const { response } = err as AxiosError
    const { data } = response as AxiosResponse<IDavinciResponse<any>>
    yield put(executeSqlFail(data.header))
    cancelTokenSource = null
  }
}

// 查询统计
export function* getStatisticsData (action: ViewActionType) {
  console.log('once', arguments, '123')
  if (action.type !== ActionTypes.GET_STATISTICS_DATA) { return }
  const { setStatisticsData } = ViewActions
  try {
    cancelTokenSource = axios.CancelToken.source()
    const {sourceId, sourceSql} = action.payload.params
    if (sourceId) {
      yield put(setStatisticsData({
        status: 0,
        data: null
      }))
      const asyncData: IDavinciResponse<IExcuteSqlStatisticsResponse<statisticsResponseData>> = yield call(request, {
        method: 'get',
        url: `${api.view}/getStatistical/${sourceId}/${sourceSql}`,
        data: {},
        cancelToken: cancelTokenSource.token
      })
      yield put(setStatisticsData(asyncData.payload))
      cancelTokenSource = null
    }
  } catch (err) {
    console.log(err, 'err')
    cancelTokenSource = null
  }
}


/** View sagas for external usages */
export function* getViewData (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_VIEW_DATA) { return }
  const { id, requestParams, resolve, reject } = action.payload
  const { viewDataLoaded, loadViewDataFail } = ViewActions
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.view}/${id}/getdata`,
      data: requestParams
    })
    yield put(viewDataLoaded())
    asyncData.payload.resultList = asyncData.payload.resultList || []
    resolve(asyncData.payload)
  } catch (err) {
    const { response } = err as AxiosError
    const { data } = response as AxiosResponse<IDavinciResponse<any>>
    yield put(loadViewDataFail(err))
    reject(data.header)
  }
}

export function* getSelectOptions (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_SELECT_OPTIONS) {
    return
  }
  const { selectOptionsLoaded, loadSelectOptionsFail } = ViewActions
  try {
    const {
      controlKey,
      requestParams,
      itemId,
      cancelTokenSource
    } = action.payload
    const requests = Object.entries(requestParams).map(([viewId, params]) => {
      const { columns, filters, variables, cache, expired } = params
      return call(request, {
        method: 'post',
        url: `${api.view}/${viewId}/getdistinctvalue`,
        data: {
          columns,
          filters,
          params: variables,
          cache,
          expired
        },
        cancelToken: cancelTokenSource.token
      })
    })
    const results: Array<IDavinciResponse<object[]>> = yield all(requests)
    yield put(selectOptionsLoaded(
      controlKey,
      results.reduce((arr, result) => arr.concat(result.payload), []),
      itemId
    ))
  } catch (err) {
    yield put(loadSelectOptionsFail(err))
  }
}

export function* getColumnDistinctValue(action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_COLUMN_DISTINCT_VALUE) {
    return
  }
  const { paramsByViewId, callback } = action.payload

  try {
    const requests = Object.entries(paramsByViewId).map(([viewId, params]) => {
      return call(request, {
        method: 'post',
        url: `${api.view}/${viewId}/getdistinctvalue`,
        data: {
          ...params,
          cache: false,
          expired: 0,
          columns: params.columns
        }
      })
    })
    const results: Array<IDavinciResponse<object[]>> = yield all(requests)
    callback(results.reduce((arr, result) => arr.concat(result.payload), []))
  } catch (err) {
    callback()
    errorHandler(err)
  }
}

export function* getViewDataFromVizItem (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM) { return }
  const { renderType, itemId, viewId, requestParams, vizType, cancelTokenSource } = action.payload
  const { viewDataFromVizItemLoaded, loadViewDataFromVizItemFail } = ViewActions
  const {
    filters,
    tempFilters,  // @TODO combine widget static filters with local filters
    linkageFilters,
    globalFilters,
    variables,
    linkageVariables,
    globalVariables,
    pagination,
    drillStatus,
    groups,
    ...rest
  } = requestParams
  const { pageSize, pageNo } = pagination || { pageSize: 0, pageNo: 0 }

  let searchFilters = filters.concat(tempFilters).concat(linkageFilters).concat(globalFilters)
  if (drillStatus && drillStatus.filters) {
    searchFilters = searchFilters.concat(drillStatus.filters)  // 改成 drillStatus.filters
  }

  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.view}/${viewId}/getdata`,
      data: {
        ...omit(rest, 'customOrders'),
        groups:  drillStatus && drillStatus.groups ? drillStatus.groups : groups,
        filters: searchFilters,
        params: variables.concat(linkageVariables).concat(globalVariables),
        pageSize,
        pageNo
      },
      cancelToken: cancelTokenSource.token
    })
    asyncData.payload = asyncData.payload || {}
    const { payload } = asyncData
    payload.resultList = payload.resultList || []
    yield put(viewDataFromVizItemLoaded(renderType, itemId, requestParams, asyncData.payload, vizType, action.statistic))
  } catch (err) {
    yield put(loadViewDataFromVizItemFail(itemId, vizType, getErrorMessage(err)))
  }
}
/** */

/** View sagas for fetch external authorization variables values */
export function* getDacChannels (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_DAC_CHANNELS) { return }
  const { dacChannelsLoaded, loadDacChannelsFail } = ViewActions
  try {
    const asyncData = yield call(request, `${api.view}/dac/channels`)
    const channels = asyncData.payload
    yield put(dacChannelsLoaded(channels))
  } catch (err) {
    yield put(loadDacChannelsFail())
    errorHandler(err)
  }
}
export function* getDacTenants (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_DAC_TENANTS) { return }
  const { dacTenantsLoaded, loadDacTenantsFail } = ViewActions
  const { channelName } = action.payload
  try {
    const asyncData = yield call(request, `${api.view}/dac/${channelName}/tenants`)
    const tenants = asyncData.payload
    yield put(dacTenantsLoaded(tenants))
  } catch (err) {
    yield put(loadDacTenantsFail())
    errorHandler(err)
  }
}
export function* getDacBizs (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_DAC_BIZS) { return }
  const { dacBizsLoaded, loadDacBizsFail } = ViewActions
  const { channelName, tenantId } = action.payload
  try {
    const asyncData = yield call(request, `${api.view}/dac/${channelName}/tenants/${tenantId}/bizs`)
    const bizs = asyncData.payload
    yield put(dacBizsLoaded(bizs))
  } catch (err) {
    yield put(loadDacBizsFail())
    errorHandler(err)
  }
}
/** */

export default function* rootViewSaga () {
  yield all([
    takeLatest(ActionTypes.LOAD_VIEWS, getViews),
    takeEvery(ActionTypes.LOAD_VIEWS_DETAIL, getViewsDetail),
    takeLatest(ActionTypes.ADD_VIEW, addView),
    takeEvery(ActionTypes.EDIT_VIEW, editView),
    takeEvery(ActionTypes.DELETE_VIEW, deleteView),
    takeEvery(ActionTypes.COPY_VIEW, copyView),
    takeLatest(ActionTypes.EXECUTE_SQL, executeSql),
    takeLatest(ActionTypes.GET_STATISTICS_DATA, getStatisticsData),

    takeEvery(ActionTypes.LOAD_VIEW_DATA, getViewData),
    takeEvery(ActionTypes.LOAD_SELECT_OPTIONS, getSelectOptions),
    takeEvery(ActionTypes.LOAD_COLUMN_DISTINCT_VALUE, getColumnDistinctValue),
    takeEvery(ActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM, getViewDataFromVizItem),

    takeEvery(ActionTypes.LOAD_DAC_CHANNELS, getDacChannels),
    takeEvery(ActionTypes.LOAD_DAC_TENANTS, getDacTenants),
    takeEvery(ActionTypes.LOAD_DAC_BIZS, getDacBizs)
  ])
}
