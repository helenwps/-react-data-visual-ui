import React, { useCallback, useState } from 'react'
import { WidgetActions } from 'containers/Widget/actions'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { makeSelectCurrentProject } from 'containers/Projects/selectors'
import { getDefaultLayerSetting } from '../components/util'
import { GRID_ITEM_MARGIN } from 'app/globalConstants'
import DisplayActions from '../actions'
import { makeSelectCurrentLayersMaxIndex } from '../selectors'
import { uuid } from 'utils/util'
import styles from '../Display.less'
import classnames from 'classnames'
import {
    GraphTypes,
    SecondaryGraphTypes,
    LayerOperations,
    slideSettings
  } from '../components/constants'
import {
    makeSelectCurrentDisplay,
    makeSelectCurrentSlide
} from 'containers/Viz/selectors'
const SecondaryGraphIcons = [
    {
      name: '图片',
      icon: <i className='iconfont'>&#xe76d;</i>,
      type: SecondaryGraphTypes.Rectangle
    },
    {
      name: '文本',
      icon: <i className='iconfont'>&#xe73b;</i>,
      type: SecondaryGraphTypes.Label
    },
    {
      name: '视频',
      icon: <i className='iconfont'>&#xe72d;</i>,
      type: SecondaryGraphTypes.Video
    },
    {
      name: '时间器',
      icon: <i className='iconfont' >&#xe79d;</i>,
      type: SecondaryGraphTypes.Timer
    }
  ]
export default (props) => {
    const dispatch = useDispatch()
    const { id: projectId } = useSelector(makeSelectCurrentProject())
    const currentDisplay = useSelector(makeSelectCurrentDisplay())
    const [mode, setMode] = useState(1)
    const {
        id: currentDisplayId,
        name,
        config: { displayParams }
    } = currentDisplay
    const {
        id: slideId,
        config: {
            slideParams: { width: slideWidth, height: slideHeight }
        }
    } = useSelector(makeSelectCurrentSlide())
  const maxLayerIndex = useSelector(makeSelectCurrentLayersMaxIndex())
  const overlay = (
    <ul className={styles.importList}>
      {SecondaryGraphIcons.map(({ name, icon, type }) => (
        <li key={type} onClick={() => addGraph(GraphTypes.Secondary, +type as SecondaryGraphTypes)}>
          {icon}{name}
        </li>
      ))}
    </ul>
  )
    const addGraph = useCallback((type: GraphTypes, subType?: SecondaryGraphTypes) => {
        dispatch(
            DisplayActions.addSlideLayers(currentDisplayId, slideId, [
                {
                    displaySlideId: slideId,
                    index: maxLayerIndex + 1,
                    name: `${slideSettings[subType].title}_${uuid(5)}`,
                    type: GraphTypes.Secondary,
                    subType,
                    params: {
                        ...getDefaultLayerSetting(GraphTypes.Secondary, subType),
                        positionX: GRID_ITEM_MARGIN,
                        positionY: GRID_ITEM_MARGIN
                    }
                }
            ])
        )
    }, [projectId])
    const changeMode = (type) => setMode(type) 
    return (
        <div>
            <div className={styles.radio}>
              <button className={classnames({
                [styles.selected]: mode == 1
              })}
                onClick={() => changeMode(1)}
              >自创组件</button>
              <button className={classnames({
                [styles.selected]: mode == 2
              })}
              onClick={() => changeMode(2)}
              >系统组件</button>
            </div>
            <div style={{padding: '10px'}}>
                {overlay}
            </div>
        </div>
    )
}