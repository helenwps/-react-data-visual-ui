import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useHistory } from 'react-router-dom'
import style from './Widget.less'
import { Steps, Icon } from 'antd';
import IconFont from 'app/components/IconFont';
import { useDispatch, useSelector } from 'react-redux'
export const Navigate = () => {
    const history = useHistory()
    const dispatch = useDispatch()
    useEffect(() => {
    }, [])
    return (
        <div className={style.headerContent}>
            <span className={style.title}>
              <Icon type="arrow-left" style={{marginRight: '6px', cursor: 'pointer'}} onClick={() => history.goBack()} />
              新建图表组件</span>
            <div>
                <div className={style.iconStep}>
                    <span>1</span>
                </div>
                <div className={style.stepText1}>选择数据</div>
                <div className={style.icon}>
                    <i className="iconfont">&#xe6fa;</i>
                </div>
                <div className={style.iconStep2}>
                    <span>2</span>
                </div>
                <div className={style.stepText2}>可视化配置</div>
            </div>

        </div>
    )
}
const { Step } = Steps;
export default (props) => {
    const { projectId } = props.match.params
    const [current, setCurrent] = useState(1)
    return (
        <div className={style.main}>

            <Navigate />
            <div className={style.chooseData}>
                <Link to={`/project/${projectId}/widget`}>
                    <div className={style.item}>
                        <img src={require('assets/images/xuanzeshuju.png')} />
                        <div className={style.note}>
                            <p>选择已有数据</p>
                            <p>可以选择自己已创建，处理过的数据，也可以选择授权给你的数据</p>
                        </div>
                    </div>

                </Link>
                <Link to={`/project/${projectId}/widgets/views`}>
                    <div className={style.item}>
                        <img src={require('assets/images/xinzenshuju.png')} />
                        <div className={style.create}>
                            <p>新增数据</p>
                            <p>可以选择自己新增数据，并进行处理后进行可视化</p>
                        </div>
                    </div>
                </Link>
            </div>

        </div>
    )
}
