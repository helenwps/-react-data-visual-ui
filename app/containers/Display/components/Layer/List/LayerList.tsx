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

import React, { useEffect, useState, useMemo } from 'react'
import { Card } from 'antd'

import CommandList from './CommandList'
import { LayerRadioGroup, LayerRadio } from './LayerRadio'
import { LayerOperations } from '../../constants'
import { LayerBase } from '../../types'
import { LayerSelectionInfo } from './types'
import styles from './LayerList.less'
interface ILayerListProps {
  layers: LayerBase[]
  selection: LayerSelectionInfo
  onCommand: (operation: LayerOperations) => void
  onSelectionChange: (
    layerId: number,
    checked: boolean,
    exclusive: boolean
  ) => void
}
import {LayerCommands} from 'app/containers/Display/components/constants.ts'
interface ButtonsProps {
  onCommand: (operation: LayerOperations) => void
}
const Buttons:React.FC<ButtonsProps> = (props) => {
  const click = (type) => () => {
    props.onCommand(type)
  }
  const [{operation: up}, {operation: down}, {operation: toUp}, {operation: toDown}] = useMemo(() => LayerCommands, [])
  return (
    <div className={styles.headerButtons}>
      <div onClick={click(up)}>
        <p><i className="iconfont">&#xe72a;</i><br />
        上移
        </p>
      </div>
      <div onClick={click(down)}>
        <p>
          <i className="iconfont">&#xe72b;</i><br />
          下移
        </p>
      </div>
      <div onClick={click(toUp)}>
        <p>
          <i className="iconfont">&#xe729;</i><br />
          置顶
        </p>
      </div>
      <div onClick={click(toDown)}>
        <p>
          <i className="iconfont">&#xe728;</i><br />
          置底
        </p>
      </div>
    </div>
  )
}
const LayerList: React.FC<ILayerListProps> = (props) => {
  const { layers, selection, onCommand, onSelectionChange } = props
  const [selected, setSeleted] = useState(true)
  useEffect(() => {
    setSeleted(Object.values(selection).some(selected => selected))
  }, [selection])
  return (
    // <Card
    //   className="display-layer-list"
    //   size="small"
    //   title={
    //     <CommandList className="display-layer-command" onCommand={onCommand} />
    //   }
    // >
    <div className={styles.layerList}>
      <Buttons onCommand={onCommand} />
      <LayerRadioGroup>
        {layers.map((layer) => (
          <LayerRadio
            key={layer.id}
            id={layer.id}
            checked={selection[layer.id].selected}
            onChange={onSelectionChange}
          >
            {layer.name}
          </LayerRadio>
        ))}
      </LayerRadioGroup>
    </div>
      
    // </Card>
  )
}

export default React.memo(LayerList)
