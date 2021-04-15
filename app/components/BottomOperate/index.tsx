import React from 'react'
import style from './style.less'
export default class BottomOperate extends React.Component<{}> {
  render() {
    return (
      <div className={style.bottomOperate}>
        {this.props.children}
      </div>
    )
  }
}
