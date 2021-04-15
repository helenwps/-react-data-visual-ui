import {
  SIGNUP,
  SIGNUPEXTRA, 
  SEND_MAIL_AGAIN,
  GET_INDUSTRY,
  GET_INDUSTRY_SUCCESS
} from './constants'
import { 
  signupSuccess, 
  signupError, 
  signupExtraSuccess, 
  signupExtraError, 
  sendMailAgainSuccess, 
  sendMailAgainFail 
} from './actions'
import request from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'

import { call, put, all, takeLatest } from 'redux-saga/effects'

export function* signup (action) {
  const {formdata, resolve} = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.signup,
      data: {
        ...formdata,
        userType:2 //2是租户类别   3是普通用户  租户创建   1是超级管理员
      }
    })
    const resPayload = asyncData.payload
    yield put(signupSuccess())
    resolve(resPayload)
  } catch (err) {
    yield put(signupError())
    errorHandler(err)
  }
}
//补充额外信息
export function* signupExtra (action) {
  console.log("action",action)
  const {formdata, resolve} = action.payload
  let UserRegisterToken = localStorage.getItem("UserRegisterToken")
  UserRegisterToken = `Bearer ${UserRegisterToken}`

  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.tenant}/completeInformation`,
      headers:{Authorization:UserRegisterToken},
      data: {
        ...formdata
      }
    })
    yield put(signupExtraSuccess())
    setTimeout(()=>{
      // localStorage.removeItem("TOKEN")
      // localStorage.removeItem("TOKEN_EXPIRE")
    })
    
    resolve()
  } catch (err) {
    yield put(signupExtraError())
    errorHandler(err)
  }
}

export function* sendMailAgain (action) {
  const {email, resolve} = action.payload
  let id = localStorage.getItem("idRegisterTemp")
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.user}/registerSendMail/${id}`,
      data: {
        email
      }
    })
    const msg = asyncData.header.msg
    yield put(sendMailAgainSuccess())
    resolve(msg)
  } catch (err) {
    yield put(sendMailAgainFail())
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



export default function* rootGroupSaga () {
  yield all([
    takeLatest(SIGNUP, signup as any),
    takeLatest(SIGNUPEXTRA, signupExtra as any),
    takeLatest(SEND_MAIL_AGAIN, sendMailAgain as any),
    takeLatest(GET_INDUSTRY, getIndustrys as any)
  ])
}
