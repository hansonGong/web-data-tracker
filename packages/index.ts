import {
  manualBurying,
  throttle,
  setTrackBaseInfo,
} from './utils'
import { TrackPoint, DirectiveBinding } from './track'

export default {
  install(Vue: any, configs: Indexable<string | boolean>): void {
    const Track = new TrackPoint(configs)
    Track.init(configs.immediate as boolean)
    // 兼容vue 3.0
    const isVueNext = Vue.version.split('.')[0] === '3'
    const bindKey = isVueNext ? 'beforeMount' : 'bind'
    const unbindKey = isVueNext ? 'beforeUnmount' : 'unbind'
    Vue.directive('track', {
      [bindKey](el: HTMLElement, binding: DirectiveBinding) {
        Track.handleBindEvent(el, binding)
      },
      [unbindKey](el: HTMLElement, binding: DirectiveBinding) {
        Track.handleUnBindEvent(el, binding)
      },
    })
  },
}

export {
  manualBurying,
  throttle,
  setTrackBaseInfo
}