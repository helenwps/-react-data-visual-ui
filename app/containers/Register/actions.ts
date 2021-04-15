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

import {
  SIGNUP,
  SIGNUPEXTRA,
  SIGNUP_SUCCESS,
  SIGNUPEXTRA_SUCCESS,
  SIGNUP_ERROR,
  SIGNUPEXTRA_ERROR,
  SEND_MAIL_AGAIN,
  SEND_MAIL_AGAIN_SUCCESS,
  SEND_MAIL_AGAIN_ERROR
} from './constants'

export function signup (formdata, resolve) {
  return {
    type: SIGNUP,
    payload: {
      formdata,
      resolve
    }
  }
}
//第二步补充额外信息
export function signupExtra (formdata,resolve) {
  return {
    type: SIGNUPEXTRA,
    payload: {
      formdata,
      resolve
    }
  }
}

export function signupSuccess () {
  return {
    type: SIGNUP_SUCCESS
  }
}

export function signupError () {
  return {
    type: SIGNUP_ERROR
  }
}
export function signupExtraSuccess () {
  return {
    type: SIGNUPEXTRA_SUCCESS
  }
}
export function signupExtraError () {
  return {
    type: SIGNUPEXTRA_ERROR
  }
}

export function sendMailAgain (email, resolve) {
  return {
    type: SEND_MAIL_AGAIN,
    payload: {
      email,
      resolve
    }
  }
}

export function sendMailAgainSuccess () {
  return {
    type: SEND_MAIL_AGAIN_SUCCESS
  }
}

export function sendMailAgainFail () {
  return {
    type: SEND_MAIL_AGAIN_ERROR
  }
}


