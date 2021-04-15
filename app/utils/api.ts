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

import { API_HOST } from '../globalConstants'

export default {
  externalAuthProviders: `${API_HOST}/login/getOauth2Clients`,
  tryExternalAuth: `${API_HOST}/login/externalLogin`,
  login: `${API_HOST}/login`,
  group: `${API_HOST}/groups`,
  user: `${API_HOST}/users`,
  tenant: `${API_HOST}/tenant`,  //租户
  changepwd: `${API_HOST}/changepwd`,
  source: `${API_HOST}/sources`,
  view: `${API_HOST}/views`,
  dashboardsRefresh: `${API_HOST}/dashboardPortals/dashboards/widgetRefresh`,
  viewList: `${API_HOST}/views/queryList`,
  widgetList: `${API_HOST}/widgets/queryList`,
  sourceList: `${API_HOST}/sources/queryList`,
  widget: `${API_HOST}/widgets`,
  display: `${API_HOST}/displays`,
  getReleaseList: `${API_HOST}/release/getReleaseList`,
  releaseUpdate: `${API_HOST}/release/update`,
  share: `${API_HOST}/share`,
  checkName: `${API_HOST}/check`,
  projectsCheckName: `${API_HOST}/check/`,
  uploads: `${API_HOST}/uploads`,
  schedule: `${API_HOST}/cronjobs`,
  scheduleList: `${API_HOST}/cronjobs/queryList`,
  signup: `${API_HOST}/users`,
  signupExtra: `${API_HOST}/users/perfect`, //更新用户信息
  organizations: `${API_HOST}/organizations`,
  checkNameUnique: `${API_HOST}/check`,
  projects: `${API_HOST}/projects`,
  teams: `${API_HOST}/teams`,
  roles: `${API_HOST}/roles`,
  portal: `${API_HOST}/dashboardPortals`,
  portalList: `${API_HOST}/dashboardPortals/queryList`,
  portalRelease: `${API_HOST}/dashboardPortals/dashboards`,
  releaseDashboard: `${API_HOST}/release/share`,
  portalEdit: `${API_HOST}/dashboardPortals`,
  portalCopy: `${API_HOST}/dashboardPortals/copy`,
  portalAdd: `${API_HOST}/dashboardPortals`,
  star: `${API_HOST}/star`,
  download: `${API_HOST}/download`,
  downloadFile: `${API_HOST}/dashboardPortals/downloadDashboard`,
  buriedPoints: `${API_HOST}/statistic`,
  configurations: `${API_HOST}/configurations`,
  email: `${API_HOST}/email`, //用户邮件提醒有效期
  department: `${API_HOST}/department`, //用户邮件提醒有效期
  dict: `${API_HOST}/dict`, //用户邮件提醒有效期
  uploadRename: `${API_HOST}/views/uploadRenameFile` // 上传重命名模板
}
