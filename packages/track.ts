import {
  write2Storage,
  clearStorage,
  getBaseInfo,
  getTemplateInfo,
  throttle,
  setTrackBaseInfo,
  DEDAULT_KEY
} from './utils'
import { LocalStorage } from './utils/storage'

// 下面的any主要是不想定义了
type anyMap = Indexable<any>
type Fn<V> = (...arg: unknown[]) => V
type listener = (e: Event) => void

export interface DirectiveBinding {
  name: string
  value?: any
  arg?: string
  oldArg?: string
  modifiers?: Indexable<boolean>
}

export class TrackPoint {
  defaultKey: string
  intervalTime: number
  eventMap: anyMap
  getTrackConfig: Fn<Indexable<string>>
  getUploadId: Fn<Indexable<string>>
  uploadTracks: Fn<void>
  customActionFn: Indexable<Fn<void>>
  trackList: anyMap[]
  baseInfo: TrackInfo
  userScrollDepth: number
  promiseQueue: Array<() => void>
  scrollCallback: Nullable<listener>

  constructor(options = {} as anyMap) {
    this.defaultKey = `${options.appId}_track`
    this.intervalTime = options.time || 60 * 1000
    this.getTrackConfig = options.getTrackConfig
    this.getUploadId = options.getUploadId || (() => ({}))
    this.uploadTracks = options.uploadTracks
    this.customActionFn = options.customActionFn || {}
    this.eventMap = {}
    this.trackList = []
    this.baseInfo = {}
    this.userScrollDepth = 0 // 用户屏幕滚动的深度
    this.promiseQueue = [] // Promise缓存队列
    this.scrollCallback = null // 监听滚动事件回调函数

    LocalStorage.set(DEDAULT_KEY, this.defaultKey)
    setTrackBaseInfo('appId', options.appId)
  }

  /**
   * 埋点轮训上传
   * @param immediate 是否立即上传历史埋点数据
   */
  init(immediate?: boolean): void {
    // setInterval会把this指向window
    const fn = this.getPermission.bind(this)
    setInterval(fn, this.intervalTime)
    if (immediate) fn()
  }

  // 缓存每一个绑定指令的Promise队列，队列为空则请求埋点配置接口
  getanyMapQueue(): Promise<void> {
    return new Promise((resolve) => {
      if (this.promiseQueue.length === 0) {
        this.getanyMap()
      }
      this.promiseQueue.push(resolve)
    })
  }

  // 请求埋点配置接口，请求成功执行所有缓存队列
  async getanyMap() {
    const resp = await this.getTrackConfig()
    this.eventMap = resp
    this.promiseQueue.forEach((resolve) => {
      resolve()
    })
    this.promiseQueue = []
  }

  // 获取获取上传埋点的权限
  async getPermission(): Promise<void> {
    const trackList = LocalStorage.get(this.defaultKey) || []
    if (trackList.length === 0) return
    this.trackList = trackList

    const { liftTime, uploadKey } = await this.getUploadId()
    if (liftTime) {
      clearStorage(this.defaultKey, +liftTime)
    }
    this.sendTrackInfo(uploadKey)
  }

  /**
   * 上传本地埋点数据
   * @param uploadKey getPermission返回
   */
  async sendTrackInfo(uploadKey: string): Promise<void> {
    this.baseInfo = getBaseInfo()
    await this.uploadTracks(this.trackList, this.baseInfo, uploadKey)
    clearStorage(this.defaultKey)
  }

  // 组装当前埋点数据
  getTrackInfo(
    el: HTMLElement,
    binding: DirectiveBinding,
  ): Indexable<string> {
    // eslint-disable-next-line prefer-const
    let { id, eventResource } = binding.value
    const { track } = el.dataset
    if (track) eventResource = track
    // 埋点信息合并
    const trackInfo = Object.assign({}, getTemplateInfo(), this.eventMap[id] || {})
    trackInfo.eventResource = eventResource
    return trackInfo
  }

  // 埋点事件绑定
  async handleBindEvent(
    el: HTMLElement,
    binding: DirectiveBinding,
  ): Promise<void> {
    if (!binding.value) return
    // 没有获取到埋点配置内容需进入队列等待
    if (Object.keys(this.eventMap).length === 0) {
      await this.getanyMapQueue()
    }
    const { id } = binding.value
    const { action } = this.eventMap[id] || {}
    const trackInfo = this.getTrackInfo(el, binding)

    if (action === 'click') {
      this.addClickTrigger(el, trackInfo, action)
    } else if (action === 'scroll_up') {
      this.addScrollTrigger(el, trackInfo)
    } else if (action === 'stay') {
      this.addStayTrigger(trackInfo)
    } else if (this.customActionFn[action]) {
      // 为保证自定义埋点的灵活性，采用回调函数进行
      const cb = (info: TrackInfo) => {
        write2Storage(this.defaultKey, info)
      }
      this.customActionFn[action](trackInfo, cb, el)
    } else {
      write2Storage(this.defaultKey, trackInfo)
    }
  }

  // 添加点击、鼠标进过事件监听
  addClickTrigger(
    el: HTMLElement,
    trackInfo: TrackInfo,
    action: string,
  ): void {
    const clickFn = () => {
      write2Storage(this.defaultKey, trackInfo)
    }
    el.addEventListener(action, throttle(clickFn, 300), false)
  }

  // 添加页面停留监听
  addStayTrigger(trackInfo: TrackInfo): void {
    LocalStorage.set('enter_time', Date.now())
    window.addEventListener('beforeunload', () => {
      const now = Date.now()
      trackInfo.stayTime = now - LocalStorage.get('enter_time')
      write2Storage(this.defaultKey, trackInfo)
    })
  }

  // 添加滚动事件监听
  addScrollTrigger(el: HTMLElement, trackInfo: TrackInfo): void {
    const scrollFn = () => {
      const contentHeight = el.offsetHeight
      const contentTop = el.getBoundingClientRect().top
      const bodyClientHeight = document.documentElement.clientHeight
      const scrollDepth = (
        ((bodyClientHeight - contentTop) / contentHeight) *
        100
      ).toFixed(2)
      if (this.userScrollDepth < +scrollDepth) {
        this.userScrollDepth = +scrollDepth
      }
    }
    this.scrollCallback = throttle(scrollFn, 100)
    window.addEventListener('scroll', this.scrollCallback)
    window.addEventListener('beforeunload', () => {
      this.saveScrollTrack(trackInfo)
    })
  }

  // 保存滚动事件埋点数据
  saveScrollTrack(trackInfo: TrackInfo): void {
    trackInfo.scrollDepth = this.userScrollDepth
    write2Storage(this.defaultKey, trackInfo)
    this.userScrollDepth = 0
  }

  // 埋点事件取消绑定
  handleUnBindEvent(el: HTMLElement, binding: DirectiveBinding): void {
    if (!binding.value) return
    const { id } = binding.value
    const { action } = this.eventMap[id] || {}

    if (['scroll_up', 'stay'].includes(action)) return
    const trackInfo = this.getTrackInfo(el, binding)
    if (action === 'stay') {
      write2Storage(this.defaultKey, trackInfo)
    } else {
      this.saveScrollTrack(trackInfo)
      window.removeEventListener('scroll', this.scrollCallback as listener)
    }
  }
}