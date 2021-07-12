export class LocalStorage {
  static set(sName: string, value: any): void {
    if (!sName) return
    if (typeof value !== 'string') {
      value = JSON.stringify(value)
    }
    window.localStorage.setItem(sName, value)
  }
  static get(sName: string): any {
    let info = window.localStorage.getItem(sName) || ''
    try {
      info = JSON.parse(info)
    } finally {
      return info
    }
  }
  static remove(sName: string): void {
    if (!sName) return
    window.localStorage.removeItem(sName)
  }
}
