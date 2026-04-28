export class NotificationManager {
  static async requestPermission() {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      } catch (e) {
        console.error('Notification permission request failed:', e)
        return false
      }
    }
    return false
  }

  static send(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options)
    }
  }

  static init() {
    this.requestPermission()
  }
}