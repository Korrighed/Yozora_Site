import './styles/main.css'
import { TimezoneBlock } from './components/TimezoneBlock.js'
import { ImageAnimation } from './components/Animation.js'
import { TwitchIntegration } from './components/TwitchIntegration.js'
import { MobileMenu } from './components/MobileMenu.js'

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
// Initialize timezone calculator
const timezoneCalc = TimezoneBlock.create('America/New_York')

timezoneCalc.updateUsualStreamContent('#ussual-timezone', 17)
timezoneCalc.updateScheduleContent('#schedule-timezone')





// Initialize Twitch integration
const twitch = new TwitchIntegration('stream-container', 'clips-container');
twitch.init();

