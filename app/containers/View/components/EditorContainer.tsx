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
import { uuid } from 'utils/util'
import { IViewVariable } from '../types'
import { Resizable, ResizeCallbackData } from 'libs/react-resizable'

import { ISqlEditorProps } from './SqlEditorByAce'
import { IViewVariableListProps } from './ViewVariableList'
import { IVariableModalProps } from './VariableModal'
import { ISqlPreviewProps } from './SqlPreview'

import Styles from '../View.less'
import { Tabs } from 'antd';
const { TabPane } = Tabs;

type TEditorSubComponents = 'SourceTable' | 'SqlEditor' | 'ViewVariableList' | 'VariableModal' | 'SqlPreview' | 'EditorBottom' | 'SqlDataStatistics'
interface IEditorContainerProps {
  visible: boolean
  variable: IViewVariable[]
  children?: React.ReactNode
  onVariableChange: (variable: IViewVariable[]) => void
}

interface IEditorContainerStates {
  editorHeight: number
  siderWidth: number
  previewHeight: number
  variableModalVisible: boolean
  editingVariable: IViewVariable
}

export class EditorContainer extends React.Component<IEditorContainerProps, IEditorContainerStates> {

  private editor = React.createRef<HTMLDivElement>()
  public static SiderMinWidth = 250
  public static EditorMinHeight = 100
  public static DefaultPreviewHeight = (document.body.clientHeight - 121) / 2 + 50

  public state: Readonly<IEditorContainerStates> = {
    editorHeight: 200,
    siderWidth: EditorContainer.SiderMinWidth,
    previewHeight: EditorContainer.DefaultPreviewHeight,
    variableModalVisible: false,
    editingVariable: null
  }

  public componentDidMount() {
    window.addEventListener('resize', this.setEditorHeight, false)
    // @FIX for this init height, 64px is the height of the hidden navigator in Main.tsx
    // const editorHeight = this.editor.current.clientHeight
    const editorHeight = document.body.clientHeight - 121
    console.log(editorHeight, 'editorHeight')
    this.setState({
      editorHeight
    })
  }
  public componentWillUnmount() {
    window.removeEventListener('resize', this.setEditorHeight, false)
  }

  public setEditorHeight = () => {
    const editorHeight = this.editor.current.clientHeight
    const { previewHeight, editorHeight: oldEditorHeight } = this.state
    const newPreviewHeight = Math.min(Math.floor(previewHeight * (editorHeight / oldEditorHeight)), editorHeight)
    this.setState({
      editorHeight,
      previewHeight: newPreviewHeight
    })
  }

  private siderResize = (_: any, { size }: ResizeCallbackData) => {
    const { width } = size
    this.setState({ siderWidth: width })
  }

  private previewResize = (_: any, { size }: ResizeCallbackData) => {
    const { height } = size
    this.setState(({ editorHeight }) => ({ previewHeight: editorHeight - height }))
  }

  private addVariable = () => {
    this.setState({
      editingVariable: null,
      variableModalVisible: true
    })
  }

  private saveVariable = (updatedVariable: IViewVariable) => {
    const { variable, onVariableChange } = this.props
    const updatedViewVariables = [...variable]
    if (!updatedVariable.key) {
      updatedVariable.key = uuid(5)
      updatedViewVariables.push(updatedVariable)
    } else {
      const idx = variable.findIndex((v) => v.key === updatedVariable.key)
      updatedViewVariables[idx] = updatedVariable
    }
    onVariableChange(updatedViewVariables)
    this.setState({
      variableModalVisible: false
    })
  }

  private deleteVariable = (key: string) => {
    const { variable, onVariableChange } = this.props
    const updatedViewVariables = variable.filter((v) => v.key !== key)
    onVariableChange(updatedViewVariables)
  }

  private editVariable = (variable: IViewVariable) => {
    this.setState({
      editingVariable: variable,
      variableModalVisible: true
    })
  }

  private variableNameValidate = (key: string, name: string, callback: (msg?: string) => void) => {
    const { variable } = this.props
    const existed = variable.findIndex((v) => ((!key || v.key !== key) && v.name === name)) >= 0
    if (existed) {
      callback('名称不能重复')
      return
    }
    callback()
  }

  private closeVariableModal = () => {
    this.setState({ variableModalVisible: false })
  }

  private getChildren = (props: IEditorContainerProps, state: IEditorContainerStates) => {
    const obj = {}
    React.Children.forEach(props.children, (child: React.ReactElement<any>) => {
      const name = child.key as TEditorSubComponents
      if (name === 'ViewVariableList') {
        obj[name] = React.cloneElement<IViewVariableListProps>(child, {
          className: Styles.viewVariable,
          onAdd: this.addVariable,
          onDelete: this.deleteVariable,
          onEdit: this.editVariable
        })
      } else if (name === 'VariableModal') {
        const { variableModalVisible, editingVariable } = this.state
        obj[name] = React.cloneElement<IVariableModalProps>(child, {
          visible: variableModalVisible,
          variable: editingVariable,
          nameValidator: this.variableNameValidate,
          onCancel: this.closeVariableModal,
          onSave: this.saveVariable
        })
      } else if (name === 'SqlPreview') {
        const { previewHeight } = state
        obj[name] = React.cloneElement<ISqlPreviewProps>(child, { height: previewHeight })
      } else if (name === 'SqlEditor') {
        const { previewHeight } = state
        obj[name] = React.cloneElement<ISqlEditorProps>(child, { sizeChanged: previewHeight })
      } else if (name === 'SqlDataStatistics') {
        // const {value} = state
        obj[name] = child
      } else {
        obj[name] = child
      }
    })
    return obj as Record<TEditorSubComponents, React.ReactElement<any>>
  }

  public render() {
    const { visible } = this.props
    const {
      editorHeight, siderWidth, previewHeight } = this.state
    const style = visible ? {} : { display: 'none' }
    const { SourceTable, SqlEditor, SqlDataStatistics, SqlPreview, EditorBottom, ViewVariableList, VariableModal } = this.getChildren(this.props, this.state)

    return (
      <>
        <div className={Styles.containerVertical} style={style}>
          <div className={Styles.sider} style={{ width: siderWidth }}>
            <Resizable
              axis="x"
              width={siderWidth}
              height={0}
              minConstraints={[EditorContainer.SiderMinWidth, 0]}
              maxConstraints={[EditorContainer.SiderMinWidth * 2, 0]}
              onResize={this.siderResize}
            >
              <div>{SourceTable}</div>
            </Resizable>
          </div>
          <div className={Styles.containerHorizontal}>
            <div className={Styles.containerHorizontal} ref={this.editor}>
              <div className={Styles.right} style={{ height: editorHeight - previewHeight }}>
                <Resizable
                  axis="y"
                  width={0}
                  height={editorHeight - previewHeight}
                  minConstraints={[0, EditorContainer.EditorMinHeight]}
                  maxConstraints={[0, editorHeight - 370]}
                  onResize={this.previewResize}
                >
                  <div className={Styles.containerVertical}>
                    {SqlEditor}
                    {/* {ViewVariableList} */}
                  </div>
                </Resizable>
              </div>
              <div className={Styles.preview} style={{ height: previewHeight,overflow:'auto' }}>
                <Tabs defaultActiveKey="1" style={{height: '100%'}} onChange={() => { }}
                  animated={false}

                >
                  <TabPane tab="数据预览" key="1">
                    {SqlPreview}
                  </TabPane>
                  <TabPane tab="数据统计" key="2">
                    {SqlDataStatistics}
                  </TabPane>

                </Tabs>

              </div>
            </div>
            {EditorBottom}
          </div>
        </div>
        {VariableModal}
      </>
    )
  }
}

export default EditorContainer
