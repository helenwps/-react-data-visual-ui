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

import React, { FC, memo, useCallback } from 'react'
import ControlComponent from '../../Control'
import { Row, Col, Button } from 'antd'
import { IRenderTreeItem, IMapControlOptions, IControl } from '../../types'
import {
  DEFAULT_DASHBOARD_ITEM_CONTROL_GRID_WIDTH,
  ControlQueryMode
} from '../../constants'
import { getControlVisibility } from '../../util'
import styles from './Layouts.less'

interface IDashboardItemControlPanelLayoutProps {
  queryMode: ControlQueryMode
  renderTree: IRenderTreeItem[]
  formValues: object
  mapOptions: IMapControlOptions
  onChange: (control: IControl, val: any) => void
  onSearch: (changedValues?: object) => void
  onReset: () => void
}

const DashboardItemControlPanelLayout: FC<IDashboardItemControlPanelLayoutProps> = ({
  queryMode,
  renderTree,
  formValues,
  mapOptions,
  onChange,
  onSearch,
  onReset
}) => {
  const renderControlComponents = useCallback(
    (controlRenderTreeItems: IRenderTreeItem[], parents?: IControl[]) => {
      let components = []

      controlRenderTreeItems.forEach((control) => {
        const { key, width, children, ...rest } = control
        if (getControlVisibility(renderTree, control, formValues)) {
          const controlValue = formValues && formValues[`${control.key}`]
          const controlGridProps = width
            ? {
                lg: width,
                md: width < 8 ? 12 : 24
              }
            : DEFAULT_DASHBOARD_ITEM_CONTROL_GRID_WIDTH
          components = components.concat(
            <Col key={key} {...controlGridProps}>
              <ControlComponent
                queryMode={queryMode}
                control={control}
                value={controlValue}
                size="small"
                currentOptions={mapOptions[key]}
                onChange={onChange}
                onSearch={onSearch}
              />
            </Col>
          )
          if (children) {
            const controlWithOutChildren = { key, width, ...rest }
            components = components.concat(
              renderControlComponents(
                children,
                parents
                  ? parents.concat(controlWithOutChildren)
                  : [controlWithOutChildren]
              )
            )
          }
        }
      })
      return components
    },
    [renderTree, formValues, mapOptions]
  )

  const manualSearch = useCallback(() => {
    onSearch()
  }, [onSearch])

  return (
    <div className={styles.dashboardItemControlPanel}>
      <div className={styles.controls}>
        <Row gutter={8}>{renderControlComponents(renderTree)}</Row>
      </div>
      {queryMode === ControlQueryMode.Manually && (
        <div className={styles.actions}>
          <Button
            type="primary"
            icon="search"
            size="small"
            onClick={manualSearch}
          >
            查询
          </Button>
          <Button icon="reload" size="small" onClick={onReset}>
            重置
          </Button>
        </div>
      )}
    </div>
  )
}

export default memo(DashboardItemControlPanelLayout)
