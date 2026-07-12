const CLIPS = [
  // Page 1
  { file: 'Yozo_oneofus.mp3',         label: 'One Of Us' },
  { file: 'Yozo_whatdoyoumean01.mp3', label: 'What Do You Mean' },
  { file: 'Yozo_fuckthis.mp3',        label: 'Fuck This' },
  { file: 'Yozo_autism.mp3',          label: 'Autism' },
  // Page 2
  { file: 'Yozo_noooo.mp3',           label: 'Noooo' },
  { file: 'Yozo_special.mp3',         label: 'Special' },
  { file: 'Yozo_uuuuu.mp3',           label: 'Uuuuu' },
  { file: 'Yozo_wtf.mp3',             label: 'WTF' },
  // Page 3
  { file: 'Yozo_autism02.mp3',        label: 'Autism 02' },
  { file: 'Yozo_doyourjobteddy.mp3',  label: 'Do Your Job Teddy' },
  { file: 'Yozo_shutup.mp3',          label: 'Shut Up' },
  { file: 'Yozo_yozofault.mp3',       label: 'Yozo Fault' },
]

const PAGE_SIZE = 4

const CLASS = {
  grid:        'yozo-bits__grid',
  nav:         'yozo-bits__nav',
  navBtn:      'yozo-bits__nav-btn',
  counter:     'yozo-bits__counter',
  card:        'yozo-bit',
  cardPlaying: 'yozo-bit--playing',
  playBtn:     'yozo-bit__play',
  playIcon:    'yozo-bit__play-icon',
  body:        'yozo-bit__body',
  title:       'yozo-bit__title',
  track:       'yozo-bit__progress-track',
  bar:         'yozo-bit__progress-bar',
  time:        'yozo-bit__time',
}

export class YozoBits {
  #containerId = 'yozo-bits-container'
  #page = 0
  #active = null

  get #container() { return document.getElementById(this.#containerId) }
  get #totalPages() { return Math.ceil(CLIPS.length / PAGE_SIZE) }

  init() {
    if (!this.#container) return
    this.#render()
  }

  #render() {
    this.#container.replaceChildren()

    const grid = document.createElement('div')
    grid.className = CLASS.grid

    const pageClips = CLIPS.slice(this.#page * PAGE_SIZE, (this.#page + 1) * PAGE_SIZE)
    pageClips.forEach(clip => grid.appendChild(this.#createCard(clip)))
    this.#container.appendChild(grid)

    if (this.#totalPages > 1) {
      this.#container.appendChild(this.#createNav())
    }
  }

  #createNav() {
    const nav = document.createElement('div')
    nav.className = CLASS.nav

    const prev = this.#createNavBtn('/icon/arrow-left-solid-full.svg', 'Previous clips')
    const counter = document.createElement('span')
    counter.className = CLASS.counter
    counter.textContent = `${this.#page + 1} / ${this.#totalPages}`
    const next = this.#createNavBtn('/icon/arrow-right-solid-full.svg', 'Next clips')

    prev.addEventListener('click', () => {
      this.#stopActive()
      this.#page = (this.#page - 1 + this.#totalPages) % this.#totalPages
      this.#render()
    })
    next.addEventListener('click', () => {
      this.#stopActive()
      this.#page = (this.#page + 1) % this.#totalPages
      this.#render()
    })

    nav.append(prev, counter, next)
    return nav
  }

  #createNavBtn(iconSrc, label) {
    const btn = document.createElement('button')
    btn.className = CLASS.navBtn
    btn.setAttribute('aria-label', label)
    const img = document.createElement('img')
    img.src = iconSrc
    img.alt = label
    btn.appendChild(img)
    return btn
  }

  #createCard(clip) {
    const card = document.createElement('div')
    card.className = CLASS.card

    const audio = new Audio(`/audio/${clip.file}`)

    const playBtn = document.createElement('button')
    playBtn.className = CLASS.playBtn
    playBtn.setAttribute('aria-label', `Play ${clip.label}`)
    const playIcon = document.createElement('img')
    playIcon.className = CLASS.playIcon
    playIcon.src = '/icon/circle-play-solid-full.svg'
    playIcon.alt = 'Play'
    playBtn.appendChild(playIcon)

    const body = document.createElement('div')
    body.className = CLASS.body

    const title = document.createElement('p')
    title.className = CLASS.title
    title.textContent = clip.label

    const track = document.createElement('div')
    track.className = CLASS.track
    const bar = document.createElement('div')
    bar.className = CLASS.bar
    track.appendChild(bar)

    body.append(title, track)

    const time = document.createElement('span')
    time.className = CLASS.time
    time.textContent = '0:00'

    card.append(playBtn, body, time)

    playBtn.addEventListener('click', () => {
      if (this.#active && this.#active !== audio) {
        this.#active.pause()
        this.#container.querySelectorAll(`.${CLASS.playIcon}`).forEach(el => el.classList.remove('playing'))
        this.#container.querySelectorAll(`.${CLASS.card}`).forEach(el => el.classList.remove(CLASS.cardPlaying))
      }

      if (audio.paused) {
        audio.play()
        this.#active = audio
        playIcon.classList.add('playing')
        card.classList.add(CLASS.cardPlaying)
      } else {
        audio.pause()
        this.#active = null
        playIcon.classList.remove('playing')
        card.classList.remove(CLASS.cardPlaying)
      }
    })

    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return
      bar.style.width = `${(audio.currentTime / audio.duration) * 100}%`
      time.textContent = this.#formatTime(audio.currentTime)
    })

    audio.addEventListener('ended', () => {
      playIcon.classList.remove('playing')
      card.classList.remove(CLASS.cardPlaying)
      bar.style.width = '0%'
      time.textContent = '0:00'
      this.#active = null
    })

    track.addEventListener('click', e => {
      if (!audio.duration) return
      const rect = track.getBoundingClientRect()
      audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration
    })

    return card
  }

  #stopActive() {
    if (this.#active) {
      this.#active.pause()
      this.#active = null
    }
  }

  #formatTime(s) {
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  }
}