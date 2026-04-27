export class TimezoneBlock {
  constructor(streamTimezone = 'America/New_York') {
    this.streamTimezone = streamTimezone
  }

  _getOffsetMinutes(date, timezone) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).formatToParts(date)
    const get = t => parseInt(parts.find(p => p.type === t).value)
    const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
    return Math.round((asUTC - date.getTime()) / 60000)
  }

  _toLocalTime(streamHour, streamMinute = 0) {
    const now = new Date()
    const streamOffset = this._getOffsetMinutes(now, this.streamTimezone)
    const localOffset = -now.getTimezoneOffset()
    const localMinutes = streamHour * 60 + streamMinute - streamOffset + localOffset
    const wrapped = ((localMinutes % 1440) + 1440) % 1440
    const result = new Date(now)
    result.setHours(Math.floor(wrapped / 60), wrapped % 60, 0, 0)
    return result
  }

  _formatTime(date) {
    let h = date.getHours()
    const m = date.getMinutes()
    const ampm = h >= 12 ? 'pm' : 'am'
    h = h % 12 || 12
    return `${h}${m > 0 ? `:${String(m).padStart(2, '0')}` : ''} ${ampm}`
  }

  _diffHours() {
    const now = new Date()
    const streamOffset = this._getOffsetMinutes(now, this.streamTimezone)
    const localOffset = -now.getTimezoneOffset()
    return Math.round((localOffset - streamOffset) / 60)
  }

  updateUsualStreamContent(selector, startHour, startMinute = 0) {
    const el = document.querySelector(selector)
    if (el) el.innerHTML = `Streams usually start at <strong>${this._formatTime(this._toLocalTime(startHour, startMinute))}</strong> for your timezone`
  }

  updateScheduleContent(selector) {
    const el = document.querySelector(selector)
    if (!el) return
    const diff = this._diffHours()
    if (diff === 0) {
      el.innerHTML = 'This week schedule<br>Same time as you'
    } else {
      const dir = diff > 0 ? 'later' : 'earlier'
      el.innerHTML = `This week schedule<br><strong>${Math.abs(diff)} hours</strong> ${dir} for you`
    }
  }

  static create(streamTimezone) {
    return new TimezoneBlock(streamTimezone)
  }
}