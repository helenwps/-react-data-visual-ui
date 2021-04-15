import React from 'react'
import classnames from 'classnames'
import styles from './style.less'
interface SwitchCardAndListProps {
  changeViewCallback?: (type: SwitchType) => void,
  switch?: SwitchType
}
enum SwitchType {
  'card' = 1, 'list' = 2
}

interface SwitchCardAndListState {
  switch: SwitchType
}
class SwitchCardAndList extends React.Component<SwitchCardAndListProps, SwitchCardAndListState> {
  public state: Readonly<SwitchCardAndListState> = {
    switch: this.props.switch || 1
  }
  private classNames = (type) => classnames({
    [styles.selected]: this.state.switch == type,
    [styles.headerButton]: true
  })

  private changeView = (type) => () => {
    this.setState({
      switch: type
    })
    this.props?.changeViewCallback(type)
  }

  render() {
    return (
      <div className={styles.changeView}>
        <button className={this.classNames(1)} onClick={this.changeView(1)}>
          <i className="iconfont">&#xe71c;</i>
        </button>
        <button className={this.classNames(2)} onClick={this.changeView(2)}>
          <i className="iconfont">&#xe71e;</i>
        </button>
      </div>
    )
  }
}


export default SwitchCardAndList
