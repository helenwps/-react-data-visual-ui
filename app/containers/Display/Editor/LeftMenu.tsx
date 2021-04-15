import React from 'react';
import { Menu, Icon } from 'antd';
import styles from 'app/containers/Viz/Viz.less'
import classnames from 'classnames';
import {DisplayActions} from 'app/containers/Display/actions.ts'
import {makeSelectCurrentTab} from 'app/containers/Display/selectors.ts'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

interface inintalState {
    currentTab: number
} 
interface inintalProps {
    onchange: (tab: number) => void
}
class LeftMenu extends React.Component<inintalProps, inintalState> {
    constructor(props) {
        super(props)
        this.state = {
            currentTab: 1
        }
    }
    private changeTab (e, currentTab) {
        this.setState({currentTab})
        this.props.onchange(currentTab)
    }

    public render() {
        const {currentTab} = this.state
        const classNames = (type) => classnames({
            [styles.selected]: currentTab == type
        })
        return (
                <ul className={styles.leftMenu}>
                    <li key="1" className={classNames(1)} onClick={(e) => this.changeTab(e, 1)}>
                        <i className="iconfont">&#xe71c;</i>
                        <span>概览设置</span>
                            
                    </li>
                    <li key="2" className={classNames(2)} onClick={(e) => this.changeTab(e, 2)}>
                        <i className="iconfont">&#xe727;</i>
                        <span>图表组件导入</span>
                    </li>
                    <li key="3" className={classNames(3)} onClick={(e) => this.changeTab(e, 3)}>
                        <i className="iconfont">&#xe63f;</i>
                        <span>模块设置</span>
                    </li>
                </ul>
        )
    }
}
function mapDispatchToProps (dispatch) {
    return {
      onchange: (tab) => dispatch(DisplayActions.changeTab(tab))
    }
  }
const mapStateToProps = createStructuredSelector({
    currentTab: makeSelectCurrentTab()
})

export default connect(mapStateToProps, mapDispatchToProps)(LeftMenu)
