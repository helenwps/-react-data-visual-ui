import React from 'react'
import classnames from 'classnames'
import Helmet from 'react-helmet'
import { Link } from 'react-router-dom'

import { withRouter } from "react-router-dom";

import { compose } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import { checkNameUniqueAction } from '../App/actions'
import { ProjectActions } from '../Projects/actions'
import { VizActions } from '../Viz/actions'

import { makeSelectCurrentProject } from '../Projects/selectors'
import { makeSelectPortals, makeSelectDisplays } from '../Viz/selectors'

import { Icon, Row, Col, Breadcrumb } from 'antd'
import Box from 'components/Box'
import Container, { ContainerTitle, ContainerBody } from 'components/Container'
import PortalList from './components/PortalList'
import DisplayList from './components/DisplayList'

import { IProject } from '../Projects/types'
import { IPortal, Display, IDisplayFormed } from './types'

import styles from './Viz.less'
import utilStyles from 'assets/less/util.less'
import { RouteComponentWithParams } from 'utils/types'
import OrganizationActions from '../Organizations/actions'
enum ListType {
  'Viz', 'Display'
}

interface IVizProps {
  currentProject: IProject

  displays: any
  portals: IPortal[]

  onLoadDisplays: (projectId: number, page: number, pageSize: number) => void
  onAddDisplay: (display: IDisplayFormed, resolve: () => void) => void
  onEditDisplay: (display: IDisplayFormed, resolve: () => void) => void
  onDeleteDisplay: (displayId: number) => void
  onCopyDisplay: (display: IDisplayFormed, resolve: () => void) => void

  onLoadPortals: (projectId: number) => void
  onAddPortal: (portal: IPortal, resolve) => void
  onEditPortal: (portal: IPortal, resolve) => void
  onDeletePortal: (portalId: number) => void
  listType: ListType,
  onCheckUniqueName: (
    pathname: string,
    data: any,
    resolve: () => any,
    reject: (error: string) => any
  ) => any
  onLoadProjectRoles: (projectId: number) => void
  onExcludeRoles: (type: string, id: number, resolve?: any) => any
}

interface IVizStates {
  collapse: { dashboard: boolean; display: boolean }
}

export class DisPlayList extends React.Component<
  IVizProps & RouteComponentWithParams,
  IVizStates
  > {
  public state: Readonly<IVizStates> = {
    collapse: {
      dashboard: true,
      display: true
    }
  }

  public componentWillMount() {
    const { match, onLoadDisplays, onLoadPortals, onLoadProjectRoles } = this.props
    const projectId = +match.params.projectId
    onLoadDisplays(projectId, 1, 10)
    onLoadPortals(projectId)
    onLoadProjectRoles(projectId)
  }
  private goToPortal = (portalId: number) => () => {
    const { history, match } = this.props
    history.push(`/project/${match.params.projectId}/portal/${portalId}`)
  }

  private goToDisplay = (displayId: number) => () => {
    const {
      match,
      currentProject: {
        permission: { vizPermission }
      }
    } = this.props
    const projectId = match.params.projectId
    const isToPreview = vizPermission === 1
    const path = `/project/${projectId}/display/${displayId}${
      isToPreview ? '/preview' : ''
    }`
    this.props.history.push(path)
  }

  private onCollapseChange = (key: string) => () => {
    const { collapse } = this.state
    this.setState({
      collapse: {
        ...collapse,
        [key]: !collapse[key]
      }
    })
  }

  public render() {
    const {
      displays,
      match,
      onAddDisplay,
      onEditDisplay,
      onDeleteDisplay,
      onCopyDisplay,
      portals,
      onAddPortal,
      onEditPortal,
      onDeletePortal,
      currentProject,
      onCheckUniqueName,
      onLoadDisplays
    } = this.props
    const projectId = +match.params.projectId
    const isHideDashboardStyle = classnames({
      [styles.listPadding]: true,
      [utilStyles.hide]: !this.state.collapse.dashboard
    })
    const isHideDisplayStyle = classnames({
      [styles.listPadding]: true,
      [utilStyles.hide]: !this.state.collapse.display
    })
    return (
      
      <div>
      <DisplayList
        currentProject={currentProject}
        projectId={projectId}
        displays={displays.list}
        onDisplayClick={this.goToDisplay}
        onAdd={onAddDisplay}
        onEdit={onEditDisplay}
        onCopy={onCopyDisplay}
        onDelete={onDeleteDisplay}
        onCheckName={onCheckUniqueName}
        onExcludeRoles={this.props.onExcludeRoles}
        onLoadDisplays={onLoadDisplays}
      />
    </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  displays: makeSelectDisplays(),
  portals: makeSelectPortals(),
  currentProject: makeSelectCurrentProject()
})

export function mapDispatchToProps(dispatch) {
  return {
    onLoadDisplays: (projectId, page, pageSize) => dispatch(VizActions.loadDisplays(projectId, page, pageSize)),
    onAddDisplay: (display: IDisplayFormed, resolve) =>
      dispatch(VizActions.addDisplay(display, resolve)),
    onEditDisplay: (display: IDisplayFormed, resolve) =>
      dispatch(VizActions.editDisplay(display, resolve)),
    onDeleteDisplay: (id, resolve) => dispatch(VizActions.deleteDisplay(id, resolve)),
    onCopyDisplay: (display: IDisplayFormed, resolve) =>
      dispatch(VizActions.copyDisplay(display, resolve)),
    onLoadPortals: (projectId) => dispatch(VizActions.loadPortals(projectId)),
    onAddPortal: (portal, resolve) =>
      dispatch(VizActions.addPortal(portal, resolve)),
    onEditPortal: (portal, resolve) =>
      dispatch(VizActions.editPortal(portal, resolve)),
    onDeletePortal: (id) => dispatch(VizActions.deletePortal(id)),
    onCheckUniqueName: (pathname, data, resolve, reject) =>
      dispatch(checkNameUniqueAction(pathname, data, resolve, reject)),
    onLoadProjectRoles: (projectId) =>
      dispatch(OrganizationActions.loadProjectRoles(projectId)),
    onExcludeRoles: (type, id, resolve) =>
      dispatch(ProjectActions.excludeRoles(type, id, resolve))
  }
}


const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
)

export default compose(withRouter, withConnect)(DisPlayList)
