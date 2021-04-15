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

import React, {
  useMemo,   //缓存值   避免函数重复调用   只有依赖的值变化时才调用生成新的值
  useEffect,
  useState,
  ReactElement,
  useCallback, //缓存函数
  useRef,
  useImperativeHandle, useContext, createContext
} from 'react'
import classnames from 'classnames'
import { connect } from 'react-redux'
import { Row, Col, Tooltip, Popconfirm, Icon, Modal, Button, Menu, Card, Dropdown } from 'antd'


const styles = require('../Organizations/Project.less')

import saga from './sagas'
import reducer from './reducer'
import { compose } from 'redux'
import { makeSelectLoginUser } from '../App/selectors'
import {
  makeSelectProjects, //所有项目
  makeSelectSearchProject,  //搜索的项目
  makeSelectStarUserList, //star
  makeSelectCollectProjects   //收藏  心型图标的    不在需求中的逻辑不看
} from './selectors'
import { ProjectActions } from './actions'
import injectReducer from 'utils/injectReducer'
import { createStructuredSelector } from 'reselect'

import injectSaga from 'utils/injectSaga'
import ProjectsForm, { EnhanceButton } from './component/ProjectForm'
import reducerOrganization from '../Organizations/reducer'   //组织reduce
import { IOrganization } from '../Organizations/types'
import sagaOrganization from '../Organizations/sagas'    //组织sagas
import { OrganizationActions } from '../Organizations/actions'
import { makeSelectOrganizations } from '../Organizations/selectors'
import { checkNameUniqueAction } from '../App/actions'
import ComponentPermission from '../Account/components/checkMemberPermission'
import Star from 'components/StarPanel/Star'

const StarUserModal = Star.StarUser
import HistoryStack from '../Organizations/component/historyStack'

const historyStack = new HistoryStack()
import { RouteComponentWithParams } from 'utils/types'
import {
  IProject,
  IProjectFormFieldProps,
  IProjectsProps,
  projectType,
  IProjectType,
  IToolbarProps,
  projectTypeSmall
} from './types'
import AntdFormType, { FormComponentProps } from 'antd/lib/form/Form'
import { uuid } from 'app/utils/util'
import { useResize } from './hooks/useResize'
import ProjectItem from './component/ProjectItem'    //一个项目卡

import ProjectEditForm, { saveEdit } from 'app/containers/Organizations/component/Project'
import { TextOverflow } from 'components/hook/usePublic'
import SourceStyles from 'containers/View/Source.less'
import { ScheduleActions } from 'containers/Schedule/actions'

function enhanceInput(props, ref) {
  const inputRef = useRef(null)
  useImperativeHandle(ref, () => ({}))

  return <input {...props} ref={inputRef} />
}

// React.forwardRef 将父组件的 ref 透传过来，通过 useImperativeHandle 方法来自定义开放给父组件的 current
// https://blog.csdn.net/weixin_43720095/article/details/104967478
const EnhanceInput = React.forwardRef(enhanceInput)


//搜索顶部栏  这块定义在projects组件中使用
const Toolbar: React.FC<IToolbarProps> = React.memo(
  // pType  项目类型   默认all
  // setPType   设置项目类型
  // setKeywords  关键词搜索项目
  // searchKeywords 搜索词
  // showProForm 项目表单 添加  修改
  ({ pType, setPType, setKeywords, searchKeywords, showProForm }) => {
    const searchRef = useRef(null)    //没啥用
    const documentWidth = useResize()   // 浏览器缩放

    //选择项目类型
    const checkoutType = useCallback(
      (type) => {
        return () => {
          if (setPType) {
            setPType(type)
          }
        }
      },
      [pType]
    )

    const menus = useMemo(() => {
      const types = ['all', 'join', 'create', 'favorite', 'history']
      return types.map((t: IProjectType) => {
        const classNames = classnames({
          [styles.selectMenu]: pType === t,
          [styles.menuitem]: true
        })
        return (
          <p key={t} className={classNames} onClick={checkoutType(t)}>
            {documentWidth <= 1200 ? projectTypeSmall[t] : projectType[t]}
          </p>
        )
      })
    }, [pType, documentWidth])

    const getKeywords = useCallback(
      (e) => {
        setKeywords(e.target.value)
      },
      [setKeywords]
    )

    const addPro = useCallback(
      (e) => {
        if (showProForm) {
          showProForm('add', {}, e)
        }
      },
      [showProForm]
    )

    return (
      <div className={styles.toolbar}>
        <div className={styles.menu}>{menus}</div>
        <div className={styles.searchs}>
          <EnhanceInput
            type='text'
            ref={searchRef}
            val={searchKeywords}
            onChange={getKeywords}
            placeholder='查找您的项目'
          />
          <span className={styles.searchButton}>
            <i className='iconfont icon-search' />
          </span>
        </div>
        <div className={styles.create}>
          <Button icon='plus' type='primary' shape='round' onClick={addPro}>
            {documentWidth < 860 ? '' : '创建'}
          </Button>
        </div>
      </div>
    )
  }
)


//阻止冒泡
function stopPPG(e: React.MouseEvent<HTMLElement> | Event) {
  if (e) {
    e.stopPropagation()
  }
  return
}

let settingFormRef: AntdFormType = null

//项目列表
const Projects: React.FC<IProjectsProps & RouteComponentWithParams> = React.memo(
  ({
     projects,   //项目
     onLoadProjects,
     onLoadOrganizations,
     organizations,  //组织
     loginUser,
     onLoadCollectProjects,   //获取收藏  即喜欢的项目
     collectProjects,
     history,    //操作项目的历史
     onAddProject,   //添加项目
     onCheckUniqueName,   //检查项目唯一名
     onTransferProject,  // 移交项目
     onDeleteProject,  // 删除项目
     onClickCollectProjects, //收藏项目
     starUserList,   //  点star的用户
     onStarProject,  // star  unstar项目
     onGetProjectStarUser,  //获取点star的用户
     onEditProject,   //编辑项目
     location,
     onLoadVizs,
     onSetCurrentProject,
     onLoadOrganizationProjects,
     onLoadOrganizationRole,
     onLoadOrganizationMembers,
     onLoadOrganizationDetail
   }) => {
    console.log(location, history, '1212')
    const { pathname } = location
    console.log(pathname, 'pathname')
    // 获取类型，1：我的项目，2：我授权的项目
    const type = pathname?.split('/')[pathname?.split('/').length - 1]
    const [formKey, setFormKey] = useState(() => uuid(8, 16))
    console.log(formKey)
    const [projectType, setProjectType] = useState('all')

    const [formVisible, setFormVisible] = useState(false)   //添加修改项目的表单
    const [settingFormVisible, setSettingFormVisible] = useState(false)   //项目设置的表单


    const [formType, setFormType] = useState('add')

    const [mode, setMode] = useState('basic')

    const [currentPro, setCurrentPro] = useState<IProject>()

    const [modalLoading, setModalLoading] = useState(false)

    const [searchKeywords, setKeywords] = useState('')

    // 竖线分割的  左侧是点击取消star请求点赞接口  右侧获取点赞的用户接口
    const [starModalVisble, setStarModalVisble] = useState(false)

    const onCloseStarModal = useCallback(() => {
      setStarModalVisble(false)
    }, [starModalVisble])

    const getStarProjectUserList = useCallback(
      (id) => () => {
        if (onGetProjectStarUser) {
          onGetProjectStarUser(id)
        }
        setStarModalVisble(true)
      },
      [setStarModalVisble, onGetProjectStarUser]
    )

    let proForm: FormComponentProps<IProjectFormFieldProps> = null

    useEffect(() => {
      if (onLoadProjects) {
        onLoadProjects()
      }
      if (onLoadOrganizations) {
        onLoadOrganizations()
      }
      if (onLoadCollectProjects) {
        onLoadCollectProjects()
      }
      const { orgId } = loginUser
      const organizationId = +orgId
      console.log('run')
      onLoadOrganizationProjects({ id: organizationId })

      onLoadOrganizationMembers(organizationId)
      onLoadOrganizationDetail(organizationId)
      onLoadOrganizationRole(organizationId)

    }, ['nf'])

    useEffect(() => {
      if (projects) {
        historyStack.init(projects)   //初始化浏览历史的项目
      }
    }, [projects])


    const loginUserId = useMemo(() => {
      return loginUser && loginUser.id
    }, [loginUser])

    // const checkoutFormVisible = useCallback(() => {
    //   setFormVisible(true)
    // }, [formVisible])

    const hideProForm = useCallback(() => {
      // 清除数据
      console.log(proForm, 'proFormproFormproForm')
      proForm?.form.resetFields()
      setFormVisible(false)
    }, [formVisible, proForm])

    const hideSettingProForm = useCallback(() => {
      setSettingFormVisible(false)
    }, [formVisible])

    const afterProjectEditFormClose = () => {
      settingFormRef.props.form.resetFields()
    }

    const onModalOkSet = () => {
      try {
        settingFormRef.props.form.validateFields((err, values) => {
          console.log(err, values, 'val')
          if (!err) {
            setModalLoading(true)
            values.visibility = values.visibility === 'true'
            onEditProject({ ...values, ...{ orgId: Number(values.orgId) } }, () => {
              hideSettingProForm()
              onLoadProjects()
              setModalLoading(false)
              const newFormKey = uuid(8, 16)
              setFormKey(newFormKey)
            })
          }
        })
      } catch (e) {
        console.log(e, 'e')
      }

    }


    const settingTabsChange = (mode) => {
      setMode(mode)
      console.log('settingTabsChange', mode)
      if (mode === 'basic') {
        const {
          orgId,
          id,
          name,
          pic,
          description,
          visibility
        } = currentPro
        settingFormRef.props.form.setFieldsValue({
          orgId: `${orgId}`,
          id,
          name,
          pic,
          description,
          visibility: `${visibility}`
        })
      }
    }


    const showEditProjectForm1 = (formType, option) => (e) => {
      const { orgId, id, name, pic, description, visibility } = option
      console.log(formType, 'arg', option, id, settingFormRef)
      try {
        onLoadVizs(Number(id))
        setCurrentPro(option)
        setFormType(formType)
        onSetCurrentProject(option)
        setSettingFormVisible(true)
        setTimeout(() => {
          settingFormRef?.props?.form.setFieldsValue({
            orgId: `${orgId}`,
            id,
            name,
            pic,
            description,
            visibility: `${visibility}`
          })
        }, 100)
      } catch (e) {
        console.log(e, 'e')
      }
    }


    const showProjectForm = useCallback((type: string) => (e) => {
      e.stopPropagation()
      setFormType(type)
      setSettingFormVisible(true)
    }, [type])

    const deletePro = useCallback(
      (proId: number, isFavorite: boolean) => {
        if (onDeleteProject) {
          onDeleteProject(proId, () => {
            // isFavorite  如果项目是收藏的  喜欢  点心的
            if (isFavorite) {
              if (onLoadCollectProjects) {
                onLoadCollectProjects()
              }
            }
            if (onLoadProjects) {
              onLoadProjects()
            }
          })
        }
      },
      [formVisible]
    )

    const favoritePro = useCallback(
      (proId: number, isFavorite: boolean) => {
        if (onClickCollectProjects) {
          onClickCollectProjects(isFavorite, proId, () => {
            if (onLoadCollectProjects) {
              onLoadCollectProjects()
            }
            if (onLoadProjects) {
              onLoadProjects()
            }
          })
        }
      },
      [formVisible]
    )


    const showProForm = useCallback(
      (formType, project: IProject, e: React.MouseEvent<HTMLElement> | Event) => {
        stopPPG(e)
        setCurrentPro(project)
        setFormType(formType)
        setFormVisible(true)
      },
      [formVisible, formType, currentPro]
    )

    const addPro = useCallback(
      (e) => {
        if (showProForm) {
          showProForm('add', {userId: loginUser.id}, e)
        }
      },
      [showProForm]
    )


    // 发送数据到后端
    const onModalOk = useCallback(() => {
      proForm.form.validateFieldsAndScroll(
        (err, values: IProjectFormFieldProps) => {
          console.log(err, values, proForm, '1`1212121221')
          if (!err) {

            setModalLoading(true)

            values = { ...values, orgId: loginUser.orgId }

            const successCall = () => {
              hideProForm()
              onLoadProjects()
              setModalLoading(false)
              const newFormKey = uuid(8, 16)
              setFormKey(newFormKey)
            }
            const errorCall = () => {
              setModalLoading(false)
            }

            if (formType === 'add') {
              onAddProject(
                {
                  ...values,
                  visibility: true,
                  pic: `${Math.ceil(Math.random() * 19)}`
                },
                successCall, errorCall
              )
            } else {
              onEditProject(
                { ...values, ...{ orgId: Number(values.orgId) } },
                successCall, errorCall
              )
            }
          }
        }
      )
    }, [formVisible, formType, setFormKey, proForm])

    // 不用
    const onTransfer = useCallback(() => {
      proForm.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          setModalLoading(true)
          const { id, orgId } = values
          onTransferProject(id, Number(orgId))
          hideProForm()
          const newFormKey = uuid(8, 16)
          setFormKey(newFormKey)
        }
      })
    }, [formVisible, setFormKey])


    //  检测项目名重复   提交表单时会对各个字段校验
    const checkNameUnique = useCallback(
      (rule, value = '', callback) => {
        console.log('check', value)
        try {
          const formObj = proForm?.form
          const fieldsValue = formObj.getFieldsValue()
          const { id } = fieldsValue
          onCheckUniqueName(
            'project',
            {
              name: value,
              orgId: loginUser.orgId,
              id
            },
            () => {
              callback()
            },
            (err) => {
              callback(err)
            }
          )
        } catch (e) {
          console.log(e, 'e')
        }

      },
      [formVisible, formType]
    )

    // 根据搜索 获取项目  项目列表也是用这个函数获得的
    const getProjectsBySearch = useMemo(() => {
      const { proIdList } = historyStack.getAll()

      // 搜索
      function filterByKeyword(arr: IProject[]) {
        return (
          Array.isArray(arr) &&
          arr.filter(
            (pro: IProject) =>
              pro.name.toUpperCase().indexOf(searchKeywords.toUpperCase()) > -1
          )
        )
      }

      //根据tab类型
      function filterByProjectType(arr: IProject[]) {
        if (Array.isArray(arr)) {
          switch (projectType) {
            case 'create':
              return arr.filter(
                (pro) => pro.createBy && pro.createBy.id === loginUserId
              )
            case 'join':
              return arr.filter(
                (pro) => pro.createBy && pro.createBy.id !== loginUserId
              )
            case 'favorite':
              return arr.filter((pro) => pro.isFavorites)
            case 'history':
              return proIdList.reduce((iteratee, pid) => {
                const pl = arr.find((pro) => pro.id === pid)
                if (pl) {
                  iteratee.push(pl)
                }
                return iteratee
              }, [])
            case 'all':
              return arr
            default:
              return []
          }
        }
      }

      //添加收藏喜欢的标志
      function pushForkTagProjects(arr: IProject[]) {
        const favoriteProjectsId =
          Array.isArray(collectProjects) &&
          collectProjects.length > 0 &&
          collectProjects.map((col) => col.id)
        return Array.isArray(arr)
          ? arr.map((pro) => {
            return favoriteProjectsId.includes &&
            favoriteProjectsId.includes(pro.id)
              ? { ...pro, isFavorites: true }
              : pro
          })
          : []
      }

      //组合  对projects 依次调用以上方法
      return compose(
        filterByProjectType,
        filterByKeyword,
        pushForkTagProjects
      )(projects)

    }, [projects, projectType, searchKeywords, loginUserId, collectProjects])


    const ProjectItems: ReactElement[] = useMemo(() => {

      const items = Array.isArray(projects)
        ? projects.filter((pro) => type === '1' ? !!(pro?.createBy.id === loginUserId) : !(pro?.createBy.id === loginUserId)).map((pro: IProject, index) => {
          const {
            pic,
            name,
            description,
            createBy,
            isStar,
            isFavorites,
            createTime,
            id,
            starNum,
            updateTime,
            orgId
          } = pro

          //是不是我的项目
          const isMimePro = !!(createBy && createBy.id === loginUserId)
          pro.isMinePro = isMimePro
          const getTagType = (function(mime, favorite) {
            const tagType = []

            if (mime) {
              tagType.push({
                text: '创建',
                color: '#108EE9'
              })
            } else {
              tagType.push({
                text: '参与',
                color: '#FA8C15'
              })
            }
            return tagType
          })(isMimePro, isFavorites)

          //点击star
          const starProject = (id) => () => {
            onStarProject(id, () => {
              if (onLoadProjects) {
                onLoadProjects()
              }
            })
          }

          //前往项目详情
          const toProject = () => {
            console.log('click', `/project/${id}`)
            history.push(`/project/${id}/vizs`)
            saveHistory(pro)
          }

          const saveHistory = (pro) => historyStack.pushNode(pro)

          const currentOrganization: IOrganization = organizations.find(
            (org) => org.id === orgId
          )

          //有没有权限创建项目
          const CreateButton = ComponentPermission(
            currentOrganization,
            ''
          )(Icon)

          const isHistoryType = !!(projectType && projectType === 'history')

          const favoriteProject = (e: React.MouseEvent<HTMLElement>) => {
            const { id, isFavorites } = pro
            stopPPG(e)
            if (favoritePro) {
              favoritePro(id, isFavorites)
            }
          }

          const transferPro = (e: React.MouseEvent<HTMLElement>) => {
            stopPPG(e)
            if (showProForm) {
              showProForm('transfer', pro, e)
            }
          }

          //项目编辑
          const editPro = (e: React.MouseEvent<HTMLElement> | Event) => {
            stopPPG(e)
            console.log('e', e, pro, '1111')
            if (showProForm) {
              showProForm('edit', pro, e)
            }
          }

          //项目设置
          const settingPro = (e: React.MouseEvent<HTMLElement> | Event) => {
            stopPPG(e)
            setCurrentPro(pro)
            setSettingFormVisible(true)
          }

          const deleteProject = (e: React.MouseEvent<HTMLElement> | Event) => {
            const { id, isFavorites } = pro
            if (deletePro) {
              deletePro(id, isFavorites)
            }
            stopPPG(e)
          }

          const { Favorite, Transfer, Edit, Delete, Setting } = (function() {
            const favoriteClassName = classnames({
              [styles.ft16]: true,
              [styles.mainColor]: isFavorites
            })

            const themeFavorite = isFavorites ? 'filled' : 'outlined'

            const Favorite = !isMimePro ? (
              <Tooltip title='收藏'>
                <Icon
                  type='heart'
                  theme={themeFavorite}
                  className={favoriteClassName}
                  onClick={favoriteProject}
                />
              </Tooltip>
            ) : (
              []
            )

            const Transfer = (
              <Tooltip title='移交'>
                <CreateButton
                  type='swap'
                  className={styles.ft16}
                  onClick={transferPro}
                />
              </Tooltip>
            )

            const Edit = (
              <Tooltip title='编辑'>
                <CreateButton
                  type='form'
                  className={styles.ft16}
                  onClick={editPro}
                />
              </Tooltip>
            )

            const Setting = (
              <Tooltip title='设置'>
                <CreateButton
                  type='form'
                  className={styles.ft16}
                  onClick={settingPro}
                />
              </Tooltip>
            )

            const Delete = (
              <Popconfirm
                title='确定删除？'
                placement='bottom'
                onCancel={stopPPG}
                onConfirm={deleteProject}
              >
                <Tooltip title='删除'>
                  <CreateButton
                    type='delete'
                    className={styles.ft16}
                    onClick={stopPPG}
                  />
                </Tooltip>
              </Popconfirm>
            )

            return {
              Edit,
              Favorite,
              Transfer,
              Delete,
              Setting
            }
          })()


          const showDeleteDialog = (domEvent: Event | React.MouseEvent<HTMLElement>) => {
            return (
              Modal.confirm({
                title: '确认要删除吗?',
                content: '删除后将无法恢复，请知悉！',
                onOk: () => {
                  deleteProject(domEvent)
                },
                onCancel() {
                }
              })
            )
          }

          const menu = () => (
            <Menu>
              {!isHistoryType && <Menu.Item key='1' onClick={({ domEvent }) => editPro(domEvent)}>编辑</Menu.Item>}
              <Menu.Item key='2' onClick={showEditProjectForm1('edit', pro)}>设置</Menu.Item>
              {!isHistoryType &&
              <Menu.Item key='4' onClick={({ domEvent }) => showDeleteDialog(domEvent)}>删除</Menu.Item>}
            </Menu>
          )

          let styObj = {}

          if (type === '2' && !index) {
            styObj = {
              marginLeft: 0
            }
          }

          return (
            <Card className={SourceStyles['content-card']} style={styObj} key={pro.id}>
              <div className={SourceStyles.innerBody} onClick={toProject}>
                <p className={SourceStyles['inner-img']}><img src={require('assets/images/folder.png')} /></p>
                <div className={SourceStyles['inner-name']}>
                  <TextOverflow text={name} />
                </div>
                <div className={SourceStyles.description}><TextOverflow text={description} /></div>
                <p className={SourceStyles['inner-time']}>
                  {type === '2' && pro?.createBy.username + ' | '}
                  <Tooltip title={createTime}>
                   创建时间
                  </Tooltip>
                  {updateTime && <Tooltip title={updateTime}> | 更新时间</Tooltip>}
                </p>
              </div>
              <p className={SourceStyles['inner-footer']}>
                {/*<Dropdown*/}
                {/*  overlay={menu()}*/}
                {/*  trigger={['click']}*/}
                {/*  overlayClassName='inner-dropdown'*/}
                {/*  placement='bottomRight'*/}
                {/*>*/}
                {/*  <i className='iconfont' style={{ cursor: 'pointer' }}>&#xe6e8;</i>*/}
                {/*</Dropdown>*/}
                <Tooltip title="设置">
                  <i className='iconfont' onClick={showEditProjectForm1('edit', pro)}>&#xe724;</i>
                </Tooltip>
                <Tooltip title="编辑">
                  {!isHistoryType && <i className='iconfont' onClick={domEvent  => editPro(domEvent)}>&#xe715;</i>}
                </Tooltip>
                <Tooltip title="删除">
                  {!isHistoryType &&<i className='iconfont' onClick={domEvent  => showDeleteDialog(domEvent)}>&#xe710;</i>}
                </Tooltip>
              </p>
            </Card>
          )
        })
        : []

      return items
    }, [
      getProjectsBySearch,
      projectType,
      projects,
      onLoadProjects,
      onStarProject,
      onGetProjectStarUser,
      loginUserId,
      organizations,
      type
    ])

    console.log(ProjectItems, 'ProjectItems')


    const props = useContext(createContext(null))
    return (
      <div className={styles.wrapper}>
        {/*<Toolbar*/}
        {/*  pType={projectType}*/}
        {/*  showProForm={showProForm}*/}
        {/*  setPType={setProjectType}*/}
        {/*  setKeywords={setKeywords}*/}
        {/*  searchKeywords={searchKeywords}*/}
        {/*// setFormVisible={checkoutFormVisible}   没用*/}
        {/*/>*/}
        <div className={styles.content + ' ' + SourceStyles.sourceRoot}>
          <React.Fragment>
            <div className={SourceStyles.mainTitle}>{type === '1' ? '我创建的项目' : '授权我的项目'}</div>
            <Row>
              <Col span={24} className={SourceStyles['flex-wrapper']}>
                {
                  type === '1' &&
                  <div
                    className={SourceStyles.createCard}
                    onClick={addPro}
                  >
                    <div style={{ transform: 'translateY(-50%)', marginTop: '92px', textAlign: 'center' }}>
                      <div className={SourceStyles['inner-text-add']}>
                        <i className='iconfont add-icon'>&#xe6e7;</i>
                      </div>
                      <div className={SourceStyles['inner-text']}>创建项目</div>
                    </div>
                  </div>
                }
                {ProjectItems}
                {!ProjectItems.length && type === '2' && <span>暂无数据！</span>}
              </Col>
            </Row>
          </React.Fragment>
        </div>
        <Modal
          title={formType === 'add' ? '新建项目' : '编辑项目'}
          footer={
            <>
              <Button
                onClick={hideProForm}
              >
                取消
              </Button>
              <EnhanceButton
                type={formType}
                modalLoading={modalLoading}
                onModalOk={onModalOk}
                onTransfer={onTransfer}
              />
            </>
          }
          visible={formVisible}
          onCancel={hideProForm}
          key={`modal${formKey}key`}
        >
          <ProjectsForm
            key={`form${formKey}key`}
            type={formType}
            onTransfer={onTransfer}
            currentPro={currentPro}
            modalLoading={modalLoading}
            organizations={organizations}
            onCheckUniqueName={checkNameUnique}
            wrappedComponentRef={(ref) => {
              proForm = ref
            }}
          />
        </Modal>


        <Modal
          wrapClassName='ant-modal-large ant-modal-center'
          title='项目设置'
          visible={settingFormVisible}
          footer={
            mode === 'basic' &&
            <>
              <Button
                onClick={hideSettingProForm}
              >
                取消
              </Button>
              {saveEdit({disabled: settingFormRef?.state?.disabled, onModalOk: onModalOk})}
            </>
          }
          onCancel={hideSettingProForm}
          afterClose={afterProjectEditFormClose}
        >
          <ProjectEditForm
            type={formType}
            onTabsChange={settingTabsChange}
            modalLoading={modalLoading}
            onModalOk={onModalOkSet}
            deleteProject={onDeleteProject}
            currentProject={currentPro}
            onCancel={hideSettingProForm}
            onCheckUniqueName={checkNameUnique}
            // showEditProjectForm={showProjectForm('transfer')}
            showEditProjectForm={showEditProjectForm1('transfer', currentPro)}
            wrappedComponentRef={ref => {
              console.log(ref, 'ref')
              settingFormRef = ref
            }}
          />
        </Modal>


        <StarUserModal
          visible={starModalVisble}
          starUser={starUserList}
          closeUserListModal={onCloseStarModal}
        />
      </div>
    )
  }
)

const mapStateToProps = createStructuredSelector({
  projects: makeSelectProjects(),
  loginUser: makeSelectLoginUser(),
  starUserList: makeSelectStarUserList(),
  organizations: makeSelectOrganizations(),
  searchProject: makeSelectSearchProject(),
  collectProjects: makeSelectCollectProjects()
})

export function mapDispatchToProps(dispatch) {
  return {
    onLoadOrganizationRole: (orgId) => dispatch(OrganizationActions.loadOrganizationRole(orgId)),
    onLoadOrganizationMembers: (id) => dispatch(OrganizationActions.loadOrganizationMembers(id)),
    onLoadOrganizationDetail: (id) => dispatch(OrganizationActions.loadOrganizationDetail(id)),
    onLoadOrganizationProjects: (param) =>
      dispatch(OrganizationActions.loadOrganizationProjects(param)),
    onLoadVizs: (projectId) => dispatch(ScheduleActions.loadVizs(projectId)),
    onLoadProjects: () => dispatch(ProjectActions.loadProjects()),
    onSetCurrentProject: (option) =>
      dispatch(OrganizationActions.setCurrentProject(option)),
    // onSearchProject: (param) => dispatch(ProjectActions.searchProject(param)),
    onLoadProjectDetail: (id) => dispatch(ProjectActions.loadProjectDetail(id)),
    onLoadCollectProjects: () => dispatch(ProjectActions.loadCollectProjects()),
    onLoadOrganizations: () =>
      dispatch(OrganizationActions.loadOrganizations()),
    onGetProjectStarUser: (id) =>
      dispatch(ProjectActions.getProjectStarUser(id)),
    onStarProject: (id, resolve) =>
      dispatch(ProjectActions.unStarProject(id, resolve)),
    onTransferProject: (id, orgId) =>
      dispatch(ProjectActions.transferProject(id, orgId)),
    onDeleteProject: (id, resolve) =>
      dispatch(ProjectActions.deleteProject(id, resolve)),
    onAddProject: (project, resolve, reject) =>
      dispatch(ProjectActions.addProject(project, resolve, reject)),
    onEditProject: (project, resolve, reject) =>
      dispatch(ProjectActions.editProject(project, resolve, reject)),
    onCheckUniqueName: (pathname, data, resolve, reject) =>
      dispatch(checkNameUniqueAction(pathname, data, resolve, reject)),
    onClickCollectProjects: (isFavorite, proId, result) =>
      dispatch(ProjectActions.clickCollectProjects(isFavorite, proId, result))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'project', reducer })
const withSaga = injectSaga({ key: 'project', saga })
const withOrganizationReducer = injectReducer({
  key: 'organization',
  reducer: reducerOrganization
})
const withOrganizationSaga = injectSaga({
  key: 'organization',
  saga: sagaOrganization
})

export default compose(
  withReducer,
  withOrganizationReducer,
  withSaga,
  withOrganizationSaga,
  withConnect
)(Projects)
