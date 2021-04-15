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
import { connect } from 'react-redux'
import { Route, Switch, Redirect } from 'react-router-dom'
import AuthorizedRoute from './AuthorizedRoute'
import { RouteComponentWithParams } from 'utils/types'
import { createStructuredSelector } from 'reselect'

import Navigator from 'components/Navigator'

import { logged, logout, loadDownloadList } from '../App/actions'
import { makeSelectLogged, makeSelectNavigator, makeSelectOauth2Enabled } from '../App/selectors'
import { DOWNLOAD_LIST_POLLING_FREQUENCY, EXTERNAL_LOG_OUT_URL } from 'app/globalConstants'

import { Project, ProjectList } from 'containers/Projects/Loadable'

import { Sidebar } from './Loadable'
import Viz from 'containers/Viz/Loadable'
import DisPlayList from 'containers/Viz/Loadable'
import { Widget, Workbench } from 'containers/Widget/Loadable'
import Choose from 'containers/Widget/Choose'
import { View, ViewEditor } from 'containers/View/Loadable'
import { Source } from 'containers/Source/Loadable'
import { Schedule, ScheduleEditor } from 'containers/Schedule/Loadable'

import { Dashboard } from 'containers/Dashboard/Loadable'

import { Account } from 'containers/Account/Loadable'
import { Profile, UserProfile } from 'containers/Profile/Loadable'
import { Zuhus} from 'containers/Zuhus'
import { UserManage} from 'containers/UserManage'



import { ResetPassword } from 'containers/ResetPassword/Loadable'
import {
  OrganizationList,
  Organization
} from 'containers/Organizations/Loadable'

import RoleManage from 'containers/RoleManage/RoleManage'

import { NoAuthorization } from 'containers/NoAuthorization/Loadable'

import ProjectNav from 'containers/Main/ProjectNav'

const styles = require('./Main.less')

type MappedStates = ReturnType<typeof mapStateToProps>
type MappedDispatches = ReturnType<typeof mapDispatchToProps>
type IMainProps = MappedStates & MappedDispatches & RouteComponentWithParams

export class Main extends React.Component<IMainProps, {}> {
  private downloadListPollingTimer: number

  constructor(props: IMainProps & RouteComponentWithParams) {
    super(props)
    this.initPolling()
  }

  public componentWillUnmount() {
    if (this.downloadListPollingTimer) {
      clearInterval(this.downloadListPollingTimer)
    }
  }

  private initPolling = () => {
    this.props.onLoadDownloadList()
    this.downloadListPollingTimer = window.setInterval(() => {
      this.props.onLoadDownloadList()
    }, DOWNLOAD_LIST_POLLING_FREQUENCY)
  }

  private logout = () => {
    const { history, oauth2Enabled, onLogout } = this.props
    onLogout()
    if (oauth2Enabled) {
      history.replace(EXTERNAL_LOG_OUT_URL)
    } else {
      history.replace('/login')
    }
  }

  private renderAccount = () => (
    <Account>
      <Switch>
        <Redirect from="/account" exact to="/account/profile" />
        <Route path="/account/profile" component={Profile} />
        <Route path="/account/profile/:userId" component={UserProfile} />
        <Route path="/account/resetPassword" component={ResetPassword} />
        <Route path="/account/organizations" component={OrganizationList} />
        <Route path="/account/zuhus" component={Zuhus} />
        <Route path="/account/userManage" component={UserManage} />
        <Route path="/account/roleManage" component={RoleManage} />
        <Route
          path="/account/organization/:organizationId"
          component={Organization}
        />
      </Switch>
    </Account>
  )

  public render() {
    const { logged, navigator } = this.props

    return logged ? (
      <div className={styles.container}>
        <Navigator show={navigator} onLogout={this.logout} />
        <Sidebar>
          <Switch>
            <Route path="/project/:projectId">
              <Project>
                <ProjectNav>
                  <Switch>
                    <Route
                      path="/project/:projectId/vizs/portal/:portalId"
                      component={Dashboard}
                    />
                    <Route
                      exact
                      path="/project/:projectId/display/:displayId"
                      component={Viz}
                    />
                    <Route
                      exact
                      path="/project/:projectId/widget/:widgetId?"
                      component={Workbench}
                    />
                    <Route
                      exact
                      path="/project/:projectId/choose"
                      component={Choose}
                    />
                    <Route
                      exact
                      path="/project/:projectId/schedule/:scheduleId?"
                      component={ScheduleEditor}
                    />
                    <AuthorizedRoute
                      permission="vizPermission"
                      path='/project/:projectId/vizs'
                      component={Viz}
                    />
                    <AuthorizedRoute
                      permission="vizPermission"
                      path="/project/:projectId/display"
                      component={DisPlayList}
                    />
                    {/*图表组件*/}
                    <AuthorizedRoute
                      permission="widgetPermission"
                      path="/project/:projectId/widgets"
                      component={Widget}
                    />
                    {/*任务*/}
                    <AuthorizedRoute
                      permission="schedulePermission"
                      path="/project/:projectId/schedules"
                      component={Schedule}
                    />
                    <Redirect to="/project/:projectId/vizs" />
                  </Switch>
                </ProjectNav>
              </Project>
            </Route>
            <Route path="/account" render={this.renderAccount} />
            <Route path="/noAuthorization" component={NoAuthorization} />
            <Route path="/user">
              <Switch>
                <Route path='/user/project/:type' exact component={ProjectList}/>
                <Route path='/user/views' exact component={View}/>
                <Route
                  exact
                  path="/user/view/:viewId?"
                  component={ViewEditor}
                />
                <Route path='/user/sources' exact component={Source}/>
              </Switch>
            </Route>
            <Redirect to="/user/project/1" />
          </Switch>
        </Sidebar>
      </div>
    ) : (
      <div />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  logged: makeSelectLogged(),
  oauth2Enabled: makeSelectOauth2Enabled(),
  navigator: makeSelectNavigator(),
})

export function mapDispatchToProps(dispatch) {
  return {
    onLogged: (user) => dispatch(logged(user)),
    onLogout: () => dispatch(logout()),
    onLoadDownloadList: () => dispatch(loadDownloadList())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main)
