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

import { call, put, all, takeLatest } from 'redux-saga/effects'
import { message } from 'antd';
import { 
  GET_USERS ,
  GET_USERS_SUCCESS,
  GET_USERS_FAIL,
  ADD_ZHUHU,
  EDIT_ZHUHU,
  GET_INDUSTRYS,
  GET_INDUSTRY_SUCCESS,
  GET_EMAIL_NOTICE,
  GET_VALID_NOTICE_SUCCESS,
  EDIT_VALID_NOTICE
} from './constants'


import request from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'

export function* getUsers (action) {
  const { id } = action.payload
  const {companyName,zuhuType} = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.tenant}/getTenants`,
      data: {
        name:companyName,
        tenantType:zuhuType,
      }
    })
    const result = asyncData.payload
    // message.success('操作成功');
    yield put({
      type: GET_USERS_SUCCESS,
      payload: {
        result
      }
    })
  } catch (err) {
    yield put({
      type: GET_USERS_FAIL
    })
    errorHandler(err)
  }
}


//添加租户
export function* addZhuhu (action) {
  console.log("action",action)
  const { id } = action.payload.formdata
  if(action.payload.formdata.industry){
    action.payload.formdata.industry = Number(action.payload.formdata.industry)
  }
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.tenant}/insertTenant`,
      data: {
        ...action.payload.formdata,
      }
    })
    const code = asyncData.header.code
    if(code == 200){
      message.success('操作成功');
      action.payload.resolve()
    }
  } catch (err) {
    // yield put({
    //   type: GET_USERS_FAIL
    // })
    errorHandler(err)
  }
}

//修改租户
export function* editZhuhu (action) {
  console.log("action",action)
  const { id } = action.payload.formdata
  if(action.payload.formdata.industry){
    action.payload.formdata.industry = Number(action.payload.formdata.industry)
  }
  try {
    const asyncData = yield call(request, {
      method: 'put',
      url: `${api.tenant}/update`,
      data: {
        ...action.payload.formdata,
      }
    })
    const code = asyncData.header.code
    if(code == 200){
      message.success('操作成功');
      action.payload.resolve()
    }
  } catch (err) {
    // yield put({
    //   type: GET_USERS_FAIL
    // })
    errorHandler(err)
  }
}
//获取行业列表

export function* getIndustrys (action) {
  console.log("action",action)
  const { id } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.dict}/getDictByType/industry`,
      data: {
      }
    })
    const result = asyncData.payload

    yield put({
      type: GET_INDUSTRY_SUCCESS,
      payload: {
        result
      }
    })
  } catch (err) {
    // yield put({
    //   type: GET_USERS_FAIL
    // })
    errorHandler(err)
  }
}

//获取租户邮件提醒详情
export function* getEmailNotice (action) {
  console.log("action",action)
  const { id } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.email}/getValidityRemind/${id}`,
      data: {
      }
    })
    const result = asyncData.payload
    yield put({
      type: GET_VALID_NOTICE_SUCCESS,
      payload: {
        validNoticeDetail:result
      }
    })
  } catch (err) {
    // yield put({
    //   type: GET_USERS_FAIL
    // })
    errorHandler(err)
  }
}

//修改有效期提醒

export function* editValidNotice (action) {
  console.log("action",action)
  // return
  const formdata = action.payload.formdata
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.email}/insert`,
      data: {
        ...formdata
      }
    })
    const code = asyncData.header.code
    if(code == 200){
      message.success('操作成功');
      action.payload.resolve()
    }
  } catch (err) {
    // yield put({
    //   type: GET_USERS_FAIL
    // })
    errorHandler(err)
  }
}



export default function* rootGroupSaga () {
  yield all([
    takeLatest(GET_USERS, getUsers as any),
    takeLatest(ADD_ZHUHU, addZhuhu as any),
    takeLatest(EDIT_ZHUHU, editZhuhu as any),
    takeLatest(GET_INDUSTRYS, getIndustrys as any),
    takeLatest(GET_EMAIL_NOTICE, getEmailNotice as any),
    takeLatest(EDIT_VALID_NOTICE, editValidNotice as any),
  ])
}

