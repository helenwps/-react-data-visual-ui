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

import { createTypes } from 'utils/redux'

enum Types {
  LOAD_PORTALS = 'davinci/Viz/LOAD_PORTALS',
  LOAD_PORTALS_SUCCESS = 'davinci/Viz/LOAD_PORTALS_SUCCESS',
  LOAD_PORTALS_FAILURE = 'davinci/Viz/LOAD_PORTALS_FAILURE',

  ADD_PORTAL = 'davinci/Viz/ADD_PORTAL',
  ADD_PORTAL_SUCCESS = 'davinci/Viz/ADD_PORTAL_SUCCESS',
  ADD_PORTAL_FAILURE = 'davinci/Viz/ADD_PORTAL_FAILURE',

  DELETE_PORTAL = 'davinci/Viz/DELETE_PORTAL',
  DELETE_PORTAL_SUCCESS = 'davinci/Viz/DELETE_PORTAL_SUCCESS',
  DELETE_PORTAL_FAILURE = 'davinci/Viz/DELETE_PORTAL_FAILURE',

  EDIT_PORTAL = 'davinci/Viz/EDIT_PORTAL',
  EDIT_PORTAL_SUCCESS = 'davinci/Viz/EDIT_PORTAL_SUCCESS',
  EDIT_PORTAL_FAILURE = 'davinci/Viz/EDIT_PORTAL_FAILURE',

  COPY_PORTAL = 'davinci/Viz/COPY_PORTAL',
  COPY_PORTAL_SUCCESS = 'davinci/Viz/COPY_PORTAL_SUCCESS',
  COPY_PORTAL_FAILURE = 'davinci/Viz/COPY_PORTAL_FAILURE',

  LOAD_PORTAL_DASHBOARDS = 'davinci/Viz/LOAD_PORTAL_DASHBOARDS',
  LOAD_PORTAL_DASHBOARDS_SUCCESS = 'davinci/Viz/LOAD_PORTAL_DASHBOARDS_SUCCESS',
  LOAD_PORTAL_DASHBOARDS_FAILURE = 'davinci/Viz/LOAD_PORTAL_DASHBOARDS_FAILURE',

  LOAD_DISPLAYS = 'davinci/Viz/LOAD_DISPLAYS',
  LOAD_DISPLAYS_SUCCESS = 'davinci/Viz/LOAD_DISPLAYS_SUCCESS',
  LOAD_DISPLAYS_FAILURE = 'davinci/Viz/LOAD_DISPLAYS_FAILURE',

  UPDATE_CURRENT_DISPLAY = 'davinci/Viz/UPDATE_CURRENT_DISPLAY',

  LOAD_DISPLAY_SLIDES = 'davinci/Viz/LOAD_DISPLAY_SLIDES',
  LOAD_DISPLAY_SLIDES_SUCCESS = 'davinci/Viz/LOAD_DISPLAY_SLIDES_SUCCESS',
  LOAD_DISPLAY_SLIDES_FAILURE = 'davinci/Viz/LOAD_DISPLAY_SLIDES_FAILURE',

  ADD_DISPLAY = 'davinci/Viz/ADD_DISPLAY',
  ADD_DISPLAY_SUCCESS = 'davinci/Viz/ADD_DISPLAY_SUCCESS',
  ADD_DISPLAY_FAILURE = 'davinci/Viz/ADD_DISPLAY_FAILURE',

  EDIT_DISPLAY = 'davinci/Viz/EDIT_DISPLAY',
  EDIT_DISPLAY_SUCCESS = 'davinci/Viz/EDIT_DISPLAY_SUCCESS',
  EDIT_DISPLAY_FAILURE = 'davinci/Viz/EDIT_DISPLAY_FAILURE',

  DELETE_DISPLAY = 'davinci/Viz/DELETE_DISPLAY',
  DELETE_DISPLAY_SUCCESS = 'davinci/Viz/DELETE_DISPLAY_SUCCESS',
  DELETE_DISPLAY_FAILURE = 'davinci/Viz/DELETE_DISPLAY_FAILURE',

  COPY_DISPLAY = 'davinci/Viz/COPY_DISPLAY',
  COPY_DISPLAY_SUCCESS = 'davinci/Viz/COPY_DISPLAY_SUCCESS',
  COPY_DISPLAY_FAILURE = 'davinci/Viz/COPY_DISPLAY_FAILURE',

  ADD_DASHBOARD = 'davinci/Viz/ADD_DASHBOARD',
  ADD_DASHBOARD_SUCCESS = 'davinci/Viz/ADD_DASHBOARD_SUCCESS',
  ADD_DASHBOARD_FAILURE = 'davinci/Viz/ADD_DASHBOARD_FAILURE',

  EDIT_DASHBOARD = 'davinci/Viz/EDIT_DASHBOARD',
  EDIT_DASHBOARD_SUCCESS = 'davinci/Viz/EDIT_DASHBOARD_SUCCESS',
  EDIT_DASHBOARD_FAILURE = 'davinci/Viz/EDIT_DASHBOARD_FAILURE',

  EDIT_CURRENT_DASHBOARD = 'davinci/Viz/EDIT_CURRENT_DASHBOARD',
  EDIT_CURRENT_DASHBOARD_SUCCESS = 'davinci/Viz/EDIT_CURRENT_DASHBOARD_SUCCESS',
  EDIT_CURRENT_DASHBOARD_FAILURE = 'davinci/Viz/EDIT_CURRENT_DASHBOARD_FAILURE',

  DELETE_DASHBOARD = 'davinci/Viz/DELETE_DASHBOARD',
  DELETE_DASHBOARD_SUCCESS = 'davinci/Viz/DELETE_DASHBOARD_SUCCESS',
  DELETE_DASHBOARD_FAILURE = 'davinci/Viz/DELETE_DASHBOARD_FAILURE',

  ADD_SLIDE = 'davinci/Viz/ADD_SLIDE',
  ADD_SLIDE_SUCCESS = 'davinci/Viz/ADD_SLIDE_SUCCESS',
  ADD_SLIDE_FAILURE = 'davinci/Viz/ADD_SLIDE_FAILURE',

  EDIT_SLIDES = 'davinci/Viz/EDIT_SLIDES',
  EDIT_SLIDES_SUCCESS = 'davinci/Viz/EDIT_SLIDES_SUCCESS',
  EDIT_SLIDES_FAILURE = 'davinci/Viz/EDIT_SLIDES_FAILURE',
  EDIT_CURRENT_SLIDE_PARAMS = 'davinci/Viz/EDIT_CURRENT_SLIDE_PARAMS',

  DELETE_SLIDES = 'davinci/Viz/DELETE_SLIDES',
  DELETE_SLIDES_SUCCESS = 'davinci/Viz/DELETE_SLIDES_SUCCESS',
  DELETE_SLIDES_FAILURE = 'davinci/Viz/DELETE_SLIDES_FAILURE',
  // 发布
  RELEASE_DASHBOARD = 'davinci/Viz/RELEASE_DASHBOARD',
  RELEASE_DASHBOARD_SUCCESS = 'davinci/Viz/RELEASE_DASHBOARD_SUCCESS',
  RELEASE_DASHBOARD_FAILURE = 'davinci/Viz/RELEASE_DASHBOARD_FAILURE',
  // 发布列表,下架
  RELEASE_GET_LIST = 'davinci/Viz/RELEASE_GET_LIST',
  RELEASE_GET_LIST_SUCCESS = 'davinci/Viz/RELEASE_GET_LIST_SUCCESS',
  RELEASE_GET_LIST_Fail = 'davinci/Viz/RELEASE_GET_LIST_Fail',
  RELEASE_OFFLINE = 'davinci/Viz/RELEASE_OFFLINE',
  RELEASE_OFFLINE_SUCCESS = 'davinci/Viz/RELEASE_OFFLINE_SUCCESS',
  RELEASE_OFFLINE_Fail = 'davinci/Viz/RELEASE_OFFLINE_Fail'
}

export { DashboardTypes } from 'app/containers/Dashboard/constants'

export const ActionTypes = createTypes(Types)
