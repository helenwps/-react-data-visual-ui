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
  GET_DEPARTMENTS ,
  GET_DEPARTMENTS_SUCCESS,
  GET_DEPARTMENTS_FAIL,
  ADD_DEPARTMENT,
  DELETE_DEPARTMENT,
  EDIT_DEPARTMENT,
  GET_DEPARTMENT_USERS,
  GET_DEPARTMENT_USERS_SUCCESS,

  ADD_DEPARTMENT_USER,
  EDIT_DEPARTMENT_USER,
  DELETE_DEPARTMENT_USERS,
  GET_ALL_USER,
  GET_ROLES,
  GET_ROLES_SUCCESS
} from './constants'


import request from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'

export function* getDepartments (action) {
  console.log("getDepartments")
  const { id } = action.payload.formdata
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.department}/getDepTree?tenantId=${id}`,
    })
    const result = asyncData.payload
    
    if(asyncData.header.code == 200){
      console.log("asyncData",asyncData)
      yield put({
        type: GET_DEPARTMENTS_SUCCESS,
        payload: {
          result
        }
      })
    }
  } catch (err) {
    yield put({
      type: GET_DEPARTMENTS_FAIL
    })
    errorHandler(err)
  }
}


//添加组织
export function* addDepartment (action) {
  console.log("action",action)
  const { id } = action.payload.formdata
 
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.department}/insert`,
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

//编辑组织

export function* editDepartment (action) {
  console.log("action",action)
  const { id } = action.payload.formdata
 
  try {
    const asyncData = yield call(request, {
      method: 'put',
      url: `${api.department}/update`,
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

//删除组织
export function* deleteDepartment (action) {
  console.log("action",action)
  const { id } = action.payload.formdata
 
  try {
    const asyncData = yield call(request, {
      method: 'delete',
      url: `${api.department}/deleteDep/${id}`,
      // data: {
      //   ...action.payload.formdata,
      // }
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

//获取一个部门的用户
export function* getDepartmentUsers (action) {
  const { id } = action.payload

  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.user}/getUsers`,
      data: {
        ...action.payload.formdata
      }
    })
    const result = asyncData.payload
    yield put({
      type: GET_DEPARTMENT_USERS_SUCCESS,
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

//添加组织用户
export function* addDepartmentUser (action) {
  console.log("action",action)
  // const { id } = action.payload.formdata
 
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.user}/insert`,
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

//编辑组织用户

export function* editDepartmentUser (action) {
  console.log("action",action)
  const { id } = action.payload.formdata
 
  try {
    const asyncData = yield call(request, {
      method: 'put',
      url: `${api.user}/${id}`,
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


//批量删除组织用户
export function* deleteDepartmentUsers (action) {
  console.log("action",action)
  // const { id } = action.payload.formdata
 
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.user}/batchDelete`,
      data: [...action.payload.formdata]
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

//获取租户所有用户
export function* getAllUser (action) {
  console.log("action",action)
  // const { id } = action.payload.formdata
 
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.user}/getUsers`,
      data: {
        ...action.payload.formdata
      }
    })
    const code = asyncData.header.code

    if(code == 200){
      const result = asyncData.payload
      yield put({
        type: GET_DEPARTMENT_USERS_SUCCESS,
        payload: {
          result
        }
      })
      action.payload.resolve()
    }
  } catch (err) {
    // yield put({
    //   type: GET_USERS_FAIL
    // })
    errorHandler(err)
  }
}

//获取角色
export function* getRoles(action){
  console.log("action",action)
  const { orgId } = action.payload.formdata
 
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.organizations}/${orgId}/roles`,
      data: {
        ...action.payload.formdata
      }
    })
    const code = asyncData.header.code

    if(code == 200){
      const result = asyncData.payload
      yield put({
        type: GET_ROLES_SUCCESS,
        payload: {
          result
        }
      })
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
    takeLatest(GET_DEPARTMENTS, getDepartments as any),
    takeLatest(ADD_DEPARTMENT, addDepartment as any),
    takeLatest(DELETE_DEPARTMENT, deleteDepartment as any),
    takeLatest(EDIT_DEPARTMENT, editDepartment as any),
    
    takeLatest(GET_DEPARTMENT_USERS, getDepartmentUsers as any),
    takeLatest(ADD_DEPARTMENT_USER, addDepartmentUser as any),
    takeLatest(EDIT_DEPARTMENT_USER, editDepartmentUser as any),
    
    takeLatest(DELETE_DEPARTMENT_USERS, deleteDepartmentUsers as any),
    takeLatest(GET_ALL_USER, getAllUser as any),
    takeLatest(GET_ROLES, getRoles as any),
    
  ])
}

