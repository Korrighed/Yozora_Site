export class MobileMenu {
  #panel = null
  #isOpen = false
  #toggle = null

  constructor(toggleSelector, links) {
    this.#toggle = document.querySelector(toggleSelector)
    this.links = links // [{ label, href }]
  }

  #createPanel() {
    const panel = document.createElement('div')
    panel.className = 'mobile-menu-panel'
    panel.setAttribute('aria-hidden', 'true')

    const list = document.createElement('ul')
    list.className = 'mobile-menu-list'

    this.links.forEach((link, index) => {
      const item = document.createElement('li')
      item.className = 'mobile-menu-item'

      const a = document.createElement('a')
      a.href = link.href
      a.textContent = link.label
      a.className = 'mobile-menu-link nav-link'
      a.addEventListener('click', () => this.close())
      item.appendChild(a)
      list.appendChild(item)

      if (index < this.links.length - 1) {
        const sep = document.createElement('li')
        sep.className = 'mobile-menu-separator'
        sep.setAttribute('aria-hidden', 'true')
        list.appendChild(sep)
      }
    })

    panel.appendChild(list)
    document.body.appendChild(panel)
    this.#panel = panel
  }

  open() {
    this.#panel.classList.add('is-open')
    this.#panel.setAttribute('aria-hidden', 'false')
    this.#toggle.setAttribute('aria-expanded', 'true')
    this.#isOpen = true
  }

  close() {
    this.#panel.classList.remove('is-open')
    this.#panel.setAttribute('aria-hidden', 'true')
    this.#toggle.setAttribute('aria-expanded', 'false')
    this.#isOpen = false
  }

  init() {
    this.#createPanel()

    this.#toggle.addEventListener('click', () => {
      this.#isOpen ? this.close() : this.open()
    })

    // Fermer si clic en dehors
    document.addEventListener('click', (e) => {
      if (this.#isOpen && !this.#panel.contains(e.target) && !this.#toggle.contains(e.target)) {
        this.close()
      }
    })

    // Fermer si redimensionnement vers desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 992 && this.#isOpen) this.close()
    })
  }
}
