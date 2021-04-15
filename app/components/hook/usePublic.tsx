import classnames from 'classnames'
import React, {useEffect, useState} from 'react'
import styles from 'app/containers/Widget/Widget.less'
import {Modal, Icon, Menu, Card, Tooltip, Dropdown, Pagination} from 'antd'

interface changeViewProps {
  onChange: (type: number) => void
}
interface changeViewState {
  currentButton: number
}
export class ChangeView extends React.Component<changeViewProps, changeViewState> {
  constructor (props: changeViewProps) {
    super(props)
    this.state = {
      currentButton: 1
    }
  }
  private changeView (type) {
    const _self = this
    return function () {
      _self.setState({currentButton: type}, () => {
        _self.props.onChange(type)
      })
    }
  }
  
  public render () {
    const {currentButton} = this.state
    const classNames = (type) => classnames({
      [styles.selected]: currentButton == type,
      [styles.headerButton]: true
    })
    return (
      <div className={styles.changeView}>
        <button className={classNames(1)} onClick={this.changeView(1)}>
          <i className="iconfont">&#xe71c;</i>
        </button>
        <button className={classNames(2)} onClick={this.changeView(2)}>
          <i className="iconfont">&#xe71e;</i>
        </button>
      </div>
    )
  }
}
export const useChangeView = (props) => {
    const [currentButton, setChange] = useState(1)
    const classNames = (type) => classnames({
      [styles.selected]: currentButton == type,
      [styles.headerButton]: true
    })
    const changeView = (type) => () => {
      setChange(type)
      props(type)
    }
    return (
      [<div className={styles.changeView}>
        <button className={classNames(1)} onClick={changeView(1)}>
          <i className="iconfont">&#xe71c;</i>
        </button>
        <button className={classNames(2)} onClick={changeView(2)}>
          <i className="iconfont">&#xe71e;</i>
        </button>
      </div>, setChange]
    )
  }
  export class TextOverflow extends React.Component<any, any> {
    constructor (props) {
      super(props)
      this.state = {
        showTooltip: false
      }
    }
    private contentRef
  
    public componentDidMount () {
      const ele = this.contentRef
      this.setState({
        showTooltip: ele.offsetWidth < ele.scrollWidth 
      })
    }
    render () {
      const {showTooltip} = this.state
      const {text} = this.props
      return (
        <div ref={(f) => this.contentRef = f} style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {showTooltip && 
          <Tooltip placement="topLeft" title={text}>
            <span>{text}</span>
          </Tooltip> || 
          <span>{text}</span>
          }
        </div>
      )
    }
  }
  export const CardList = (props) => {
    const { filterWidgets: list, openCopyModal, toWorkbench, onDeleteWidget, ...rest } = props
    const confirmDelete = (id) => {
      Modal.confirm({
        title: '确定要删除吗？',
        content: '删除后，该数据无法恢复。',
        okText: '确认',
        cancelText: '取消',
        icon: <Icon type="info-circle" />,
        onOk:  ()=> {
          onDeleteWidget(id)(rest.onLoadDisplays && rest.onLoadDisplays())
        }
      });
    }
    const menu = (record) => (
      <Menu>
        <Menu.Item key="1" onClick={openCopyModal(record)}>复制</Menu.Item>
        <Menu.Item key="2" onClick={toWorkbench(record.id)}>修改</Menu.Item>
        <Menu.Item key="4" onClick={() => confirmDelete(record.id)}>删除</Menu.Item>
      </Menu>
    )
    return (
      <div>
        <div className={styles['flex-wrapper']}>
          {list.map(x => {
            const { name, description, createTime, updateTime } = x
            return (
              <Card className={styles['content-card']} key={x.id} data-v-widget>
                <p className={styles['inner-img']}><img src={require('assets/images/folder.png')} /></p>
                <div className={styles['inner-name']}>
                  <TextOverflow text={name} />
                </div>
                <p className={styles.description}>{description}</p>
                <p className={styles['inner-time']}>
                  <Tooltip title={createTime}>
                    创建时间
             </Tooltip>
                  {updateTime && <Tooltip title={updateTime}> | 更新时间</Tooltip>}
                </p>
                <p className={styles['inner-footer']}>
                 {!rest.hideMenu && <Dropdown
                    overlay={menu(x)}
                    trigger={['click']}
                    overlayClassName='inner-dropdown'
                    placement="bottomRight"
                  >
                    <i className="iconfont" style={{ cursor: 'pointer' }}>&#xe6e8;</i>
                  </Dropdown> || ''} 
                </p>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }
  export const usePagination = (props) => {
    const pageSizeOptions = ['10', '20', '30', '40']
    const {total, changePage} = props
    const pageOption = {
      total,
      showTotal (total) {
        return `共${total}条`
      },
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions,
      onChange (page, pageSize) {
        changePage(page,pageSize)
      },
      onShowSizeChange (current, size) {
        changePage(1, size)
      }
    }
    return (
      <div style={{textAlign: 'right'}}>
        <Pagination {...pageOption} />
      </div>
    )
  }

  