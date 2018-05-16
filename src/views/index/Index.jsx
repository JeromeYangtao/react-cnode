import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import './style.scss'
import API_CONFIG from '../../api'
import Sidebar from '../../components/sidebar/Sidebar'
import { querystring } from '../../utils'
import { Pagination } from 'antd'
import List from '../../components/topics-list/TopicsList'

/* eslint-disable */
class HomePage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      page: 1,        // 当前页
      total: 9999,    // 总条数
      topics: [],     // 主题列表
      mark: false
    }
  }

  componentDidMount () {
    this.setState({
      page: parseInt(querystring(this.props.location.search).page) || 1,
    }, () => {
      this.fetchTopics().catch()
    })
  }

  componentDidUpdate (prevProps, prevState, prevContext) {
    if (this.props.location !== prevProps.location) {
      var page = parseInt(querystring(this.props.location.search).page)
      if (!page) {
        this.setState({page: 1}, () => {
          this.fetchTopics().catch()
        })
        return
      }
      this.fetchTopics().catch()
    }
  }

  /**
   * @func 获取主题列表
   */
  fetchTopics = async () => {
    this.setState({
      mark: true,
    })
    var beforeTime = Date.now()
    let res = await axios.get(API_CONFIG.topics, {
      params: {
        limit: 40,
        mdrender: false,
        tab: querystring(this.props.location.search).tab || 'all',
        page: this.state.page,
      }
    })

    var afterTime = Date.now() - beforeTime
    if (afterTime <= 300) {
      setTimeout(() => {
        this.setState({
          mark: false,
        })
      }, 300 - afterTime)
    } else {
      this.setState({
        mark: false,
      })
    }
    if (res.data.success) {
      this.setState({
        topics: res.data.data
      })
    }

  }

  isActive (tabVal) {
    return this.props.location.search === tabVal.slice(1)
  }

  currentChange = (page) => {
    this.setState({
      page,
    })
    var tab = querystring(this.props.location.search).tab || 'all'
    this.props.history.push({
      pathname: '/',
      search: `?tab=${tab}&page=${page}`,
    })
    window.scrollTo(0, 0)
  }

  render () {
    let navList = [
      {link: '/', text: '全部'},
      {link: '/?tab=good', text: '精华'},
      {link: '/?tab=share', text: '分享'},
      {link: '/?tab=ask', text: '问答'},
      {link: '/?tab=job', text: '招聘'},
      {link: '/?tab=dev', text: '客户端测试'},
    ]
    return (
      <section className="index-section">
        <div className="topics-container index-container">
          {/* 导航 */}
          <nav className="nav">
            {navList.map((nav) => {
              return <NavLink to={nav.link} isActive={this.isActive.bind(this, nav.link)}
                              key={nav.link}>{nav.text}</NavLink>
            })}
          </nav>
          <div className="topics-list">
            <div className="mark-box" style={{display: !this.state.mark ? 'none' : ''}}>
              <div className="mark-line"></div>
              <div className="mark-line"></div>
              <div className="mark-line"></div>
            </div>
            <List topics={this.state.topics}/>
          </div>
          <div className="pagination-box">
            <Pagination
              current={this.state.page}
              onChange={this.currentChange}
              total={this.state.total}
              pageSize={40}/>
          </div>
        </div>
        {/* 侧边栏 */}
        <Sidebar/>
      </section>
    )
  }
}

export default HomePage