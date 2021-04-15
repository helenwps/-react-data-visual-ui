// // /*
// //  * <<
// //  * Davinci
// //  * ==
// //  * Copyright (C) 2016 - 2017 EDP
// //  * ==
// //  * Licensed under the Apache License, Version 2.0 (the "License");
// //  * you may not use this file except in compliance with the License.
// //  * You may obtain a copy of the License at
// //  *
// //  *      http://www.apache.org/licenses/LICENSE-2.0
// //  *
// //  * Unless required by applicable law or agreed to in writing, software
// //  * distributed under the License is distributed on an "AS IS" BASIS,
// //  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// //  * See the License for the specific language governing permissions and
// //  * limitations under the License.
// //  * >>
// //  */
// //
// import React from 'react'
// import { Switch, Route } from 'react-router-dom'
// import { useInjectReducer } from 'utils/injectReducer'
// import { useInjectSaga } from 'utils/injectSaga'
//
// import reducer from './reducer'
// import saga from './sagas'
//
//
// import { compose } from 'redux'
// import { connect } from 'react-redux'
// import { createStructuredSelector } from 'reselect'
// import injectReducer from 'utils/injectReducer'
// import injectSaga from 'utils/injectSaga'
// import displayReducer from '../Display/reducer'
// import displaySaga from '../Display/sagas'
// import viewReducer from '../View/reducer'
// import viewSaga from '../View/sagas'
// import widgetReducer from 'containers/Widget/reducer'
// import rootWidgetSaga from 'containers/Widget/sagas'
//
//
// export default () => {
//   useInjectReducer({ key: 'viz', reducer })
//   useInjectSaga({ key: 'viz', saga })
//   useInjectReducer({key: 'view', viewReducer})
//   return (
//     <Switch>
//       <Route path="/project/:projectId/vizs" exact component={VizList} />
//       <Route path="/project/:projectId/vizs/portal/:portalId" component={PortalIndex} />
//       <Route path="/project/:projectId/display" exact component={DisPlayList} />
//       <Route path="/project/:projectId/display/:displayId" component={VizDisplay} />
//     </Switch>
//   )
// }
//

import * as React from 'react'

import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import displayReducer from '../Display/reducer'
import displaySaga from '../Display/sagas'
import viewReducer from '../View/reducer'
import viewSaga from '../View/sagas'
import widgetReducer from 'containers/Widget/reducer'
import rootWidgetSaga from 'containers/Widget/sagas'
import { VizList, PortalIndex, VizDisplay, DisPlayList } from './Loadable'
import vizReducer from './reducer'
import rootVizSaga from './sagas'
import { Route, Switch } from 'react-router-dom'


export class Viz extends React.Component<{}> {

  constructor (props) {
    super(props)
  }

  public render () {
    return (
      <Switch>
      <Route path="/project/:projectId/vizs" exact component={VizList} />
      <Route path="/project/:projectId/vizs/portal/:portalId" component={PortalIndex} />
      <Route path="/project/:projectId/display" exact component={DisPlayList} />
      <Route path="/project/:projectId/display/:displayId" component={VizDisplay} />
    </Switch>
    )
  }
}

const withDisplayReducer = injectReducer({ key: 'display', reducer: displayReducer })
const withDisplaySaga = injectSaga({ key: 'display', saga: displaySaga })
const withReducerView = injectReducer({ key: 'view', reducer: viewReducer })
const withSagaView = injectSaga({ key: 'view', saga: viewSaga })
const withReducerWidget = injectReducer({ key: 'widget', reducer: widgetReducer })
const withSagaWidget = injectSaga({ key: 'widget', saga: rootWidgetSaga })
const withReducerViz = injectReducer({ key: 'viz', reducer: vizReducer })
const withSagaViz = injectSaga({ key: 'viz', saga: rootVizSaga })

export default compose(
  withDisplayReducer,
  withDisplaySaga,
  withReducerView,
  withSagaView,
  withReducerWidget,
  withSagaWidget,
  withReducerViz,
  withSagaViz
)(Viz)

