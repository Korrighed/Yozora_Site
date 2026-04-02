import './styles/main.css'
import { TimezoneBlock } from './components/TimezoneBlock.js'
import { ImageAnimation } from './components/Animation.js'
import { TwitchIntegration } from './components/TwitchIntegration.js'
import { MobileMenu } from './components/MobileMenu.js'

// --------------- Mobile menu
const mobileMenu = new MobileMenu('.navbar-toggler', [
  { label: 'Presentation', href: '#presentation' },
  { label: 'Twitch', href: '#twitch' },
  // { label: 'YouTube', href: '#youtube' },
  { label: 'Socials', href: '#socials' },
])
mobileMenu.init()

// --------------- Style management
// Apply the yozora-container class to the presentation section
const presentationSection = document.querySelector('#presentation .container')
if (presentationSection) {
  presentationSection.classList.add('yozora-container')
}

// Apply TextBlock styling to all elements with the class (if needed)
const textBlockElements = document.querySelectorAll('.text-blocks-container')
textBlockElements.forEach(element => {

  element.classList.add('text-block')
})

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
const timezoneCalc = TimezoneBlock.create('Pacific/Auckland') // NZT
const scheduleCalc = TimezoneBlock.create('America/Los_Angeles') // PST — schedule image is in PST

// Schedule diff: PST vs browser
scheduleCalc.updateScheduleContent('#schedule-timezone')

// Usual stream start: NZT vs browser
timezoneCalc.updateUsualStreamContent('#ussual-timezone', 13)





// Initialize Twitch integration
const twitch = new TwitchIntegration('stream-container', 'clips-container');
twitch.init();

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}