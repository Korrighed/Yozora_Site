import './styles/main.css'
import { MobileMenu } from './components/MobileMenu.js'
import { NotificationManager } from './components/NotificationManager.js'
import { TimezoneBlock } from './components/TimezoneBlock.js'
import { TwitchIntegration } from './components/TwitchIntegration.js'
import { YozoBits } from './components/YozoBits.js'

// --------------- Notifications
NotificationManager.init()

// --------------- Mobile menu
const mobileMenu = new MobileMenu(null, [
  { label: 'Presentation', href: '#presentation' },
  { label: 'Twitch', href: '#twitch' },
  // { label: 'YouTube', href: '#youtube' },
  { label: 'Socials', href: '#socials' },
])
mobileMenu.init()

// Smooth scroll navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute('href'))
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  })
})


// --------------- Timezone management
TimezoneBlock.init()





// --------------- Yozo Bits audio player
new YozoBits('yozo-bits-container').init()

// Initialize Twitch integration
const twitch = new TwitchIntegration('stream-container', 'clips-container');
twitch.init();

