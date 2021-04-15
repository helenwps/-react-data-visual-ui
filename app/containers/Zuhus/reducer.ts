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

import produce from 'immer'
import {
  GET_USERS,
  GET_USERS_SUCCESS,
  GET_USERS_FAIL,
  GET_INDUSTRY_SUCCESS,
  GET_VALID_NOTICE_SUCCESS
} from './constants'


export const initialState = {
  users: [],
  loading: false, //表格加载的loading
  validNoticeDetail:{}, //有效期提醒详情
  industrys:[]
}

const profileReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case GET_USERS:
        draft.loading = true
        break

      case GET_USERS_SUCCESS:
        draft.loading = false
        draft.users = action.payload.result
        break
      case GET_INDUSTRY_SUCCESS:
        // draft.loading = false
        draft.industrys = action.payload.result
        break
      case GET_VALID_NOTICE_SUCCESS:
        draft.validNoticeDetail = action.payload.validNoticeDetail
        break
    }
  })

export default profileReducer
