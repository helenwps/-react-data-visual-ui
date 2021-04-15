import React from 'react'
import { Link } from 'react-router-dom'
import { Icon, Tabs, Breadcrumb } from 'antd'
import Box from 'components/Box'
const styles = require('./Organization.less')

import RoleList from './component/RoleList'

import { connect } from 'react-redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducerProject from './reducerProject'
import sagaProject from './sagasProject'
import { compose } from 'redux'
import { OrganizationActions } from './actions'
import { makeSelectLoginUser } from 'containers/App/selectors'
import {
  makeSelectCurrentOrganizations,

  makeSelectCurrentOrganizationRole,
  makeSelectCurrentOrganizationMembers,

} from './selectors'
import { createStructuredSelector } from 'reselect'

import { RouteComponentWithParams } from 'utils/types'
import { IOrganization, IOrganizationProps } from './types'



export class Organization extends React.PureComponent<IOrganizationProps & RouteComponentWithParams, {}> {
  constructor(props) {
    super(props)
  }


  public componentWillMount() {
    const {
      onLoadOrganizationMembers,
      onLoadOrganizationDetail,
      // onLoadOrganizationRole,
      
    } = this.props
    const organizationId = +this.props.loginUser.orgId
    onLoadOrganizationMembers(organizationId)
    onLoadOrganizationDetail(organizationId)
    // onLoadOrganizationRole(organizationId)
  }

  

  public render() {
    const {
      loginUser,
      currentOrganization,
      currentOrganizationMembers,
    } = this.props

    if (!currentOrganization) { return null }
    
    return (
          <RoleList
            isLoginUserOwner={true}
            // onLoadOrganizationDetail={this.props.onLoadOrganizationDetail}
            organizations={[]}
            organizationMembers={currentOrganizationMembers}
            currentOrganization={this.props.currentOrganization}
          />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  loginUser: makeSelectLoginUser(),
 
 
  currentOrganization: makeSelectCurrentOrganizations(),
  currentOrganizationRole: makeSelectCurrentOrganizationRole(),
  currentOrganizationMembers: makeSelectCurrentOrganizationMembers(),
})

export function mapDispatchToProps(dispatch) {
  return {
    
    onLoadOrganizationRole: (orgId) => dispatch(OrganizationActions.loadOrganizationRole(orgId)),
    onLoadOrganizationMembers: (id) => dispatch(OrganizationActions.loadOrganizationMembers(id)),
    onLoadOrganizationDetail: (id) => dispatch(OrganizationActions.loadOrganizationDetail(id)),
    
    onChangeOrganizationMemberRole: (id, role, resolve) => dispatch(OrganizationActions.changeOrganizationMemberRole(id, role, resolve)),
    
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withProjectReducer = injectReducer({ key: 'roleManage', reducer: reducerProject })
const withProjectSaga = injectSaga({ key: 'roleManage', saga: sagaProject })
export default compose(
  withProjectReducer,
  withProjectSaga,
  withConnect
)(Organization)





