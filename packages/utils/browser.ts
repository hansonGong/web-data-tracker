/**
 * 获取设备操作系统
 */
export function getOS(): string {
  const userAgent = window.navigator.userAgent
  const platform = window.navigator.platform
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K']
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
  const iosPlatforms = ['iPhone', 'iPad', 'iPod']
  let os = ''
  if (~macosPlatforms.indexOf(platform)) {
    os = 'Mac OS'
  } else if (~iosPlatforms.indexOf(platform)) {
    os = 'iOS'
  } else if (~windowsPlatforms.indexOf(platform)) {
    os = 'Windows'
  } else if (/Android/.test(userAgent)) {
    os = 'Android'
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux'
  }
  return os
}

/**
 * 获取浏览器信息
 */
export function getBrowserInfo(): string {
  const agent = navigator.userAgent.toLowerCase()
  let regArray: Nullable<RegExpMatchArray>
  if (agent.indexOf('msie') > 0) {
    const regStr_ie = /msie [\d.]+;/gi
    regArray = agent.match(regStr_ie)
  } else if (agent.indexOf('firefox') > 0) {
    const regStr_ff = /firefox\/[\d.]+/gi
    regArray = agent.match(regStr_ff)
  } else if (agent.indexOf('chrome') > 0) {
    const regStr_chrome = /chrome\/[\d.]+/gi
    regArray = agent.match(regStr_chrome)
  } else if (agent.indexOf('safari') > 0 && agent.indexOf('chrome') < 0) {
    const regStr_saf = /safari\/[\d.]+/gi
    regArray = agent.match(regStr_saf)
  } else {
    regArray = null
  }
  return regArray ? regArray[0] : 'other'
}

/**
 * 获取设备操作系统版本
 */
export function getOSVersion(): string {
  let os = getOS()
  const nVer = navigator.appVersion
  const nAgt = navigator.userAgent
  let regArray: Nullable<RegExpExecArray>
  if (/Windows/.test(os)) {
    regArray = /Windows (.*)/.exec(nAgt)
    os = 'Windows'
  }
  switch (os) {
    case 'Mac OS':
    case 'Mac OS X':
      regArray = /Mac OS X ([._\d]+)/.exec(nAgt)
      break
    case 'Android':
      regArray = /Android ([._\d]+)/.exec(nAgt)
      break
    case 'iOS':
      regArray = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer)
      return regArray
        ? `${regArray[1]}.${regArray[2]}.${regArray[3] ? regArray[3] : 0}`
        : 'other'
    default:
      regArray = null
      break
  }
  return regArray ? regArray[1] : 'other'
}
