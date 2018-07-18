import axios from 'axios'
import { $ } from './bling'

/**
 * Performs ajax POST to hearts API.
 * - Updates User hearts on icon click
 * - Performs animation when store is hearted and updates heart icon count
 * - On error: console.error
 *
 * @param {Object} e Event Object from event listener ('submit')
 */
function ajaxHeart(e) {
  // prevent form from refreshing and changing page
  e.preventDefault()

  axios
    .post(this.action)
    .then((res) => {
      // this.heart = any child element with name attribute heart
      const isHearted = this.heart.classList.toggle('heart__button--hearted')

      // update heart count on page
      $('.heart-count').textContent = res.data.hearts.length

      // Add css animation on click if hearted
      if (isHearted) {
        this.heart.classList.add('heart__button--float')
        // Remove class after 2.5 seconds so we can re-animate again
        setTimeout(
          () => this.heart.classList.remove('heart__button--float'),
          2500
        )
      }
    })
    .catch(console.error)
}

export default ajaxHeart
