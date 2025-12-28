import './styles/main.scss'
import { TimezoneBlock } from './components/TimezoneBlock.js'
import { ImageAnimation } from './components/Animation.js'
import { TwitchIntegration } from './components/TwitchIntegration.js';

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

// Chibi image animation
ImageAnimation.create(
  '#chibi-dance',
  ['/Chibi_Zo_Left.svg', '/Chibi_Zo_Right.svg'],
  1500
);




// --------------- Timezone management
// Initialize timezone calculator
const timezoneCalc = TimezoneBlock.create('America/New_York') // Or 'America/Los_Angeles' for PST

// Update the schedule timezone message
timezoneCalc.updateScheduleContent('#schedule-timezone')

// Update the usual stream times (example: streams from 7pm to 11pm EST)
timezoneCalc.updateUsualStreamContent('#ussual-timezone', 19, 23) // 19 = 7pm, 23 = 11pm





// Initialize Twitch integration when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const twitch = new TwitchIntegration('stream-container', 'clips-container');
  twitch.init();

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
});