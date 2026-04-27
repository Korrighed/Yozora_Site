export class MobileMenu {
  #panel = null
  #isOpen = false
  #toggle = null

  constructor(toggleSelector, links) {
    this.links = links
  }

  #createToggle() {
    const btn = document.createElement('button')
    btn.className = 'mobile-burger-btn'
    btn.setAttribute('aria-label', 'Toggle navigation')
    btn.setAttribute('aria-expanded', 'false')
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><path stroke="#FEF2CA" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2" d="M4 7h22M4 15h22M4 23h22"/></svg>`
    document.body.appendChild(btn)
    this.#toggle = btn
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
    this.#createToggle()
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
