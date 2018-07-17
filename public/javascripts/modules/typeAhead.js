import axios from 'axios'
import dompurify from 'dompurify' // sanitize html from XSRF

/**
 * Returns HTML string of anchor elements <a> for each store
 *
 * @param {Array} stores Array of stores
 * @returns HTML string of anchor elements for each store
 */
function searchResultsHTML(stores) {
  return stores
    .map((store) => {
      return `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `
    })
    .join('')
}

/**
 * Handles store search interface for search box.
 * - Makes ajax requests to retrieve stores searched by user
 * - Displays results to user or message with none found
 * - Handles keyboard inputs to allow user to use keyboard instead of mouse
 *
 * @param {DOM Element} search Search box DOM element
 */
function typeAhead(search) {
  if (!search) {
    return
  }

  const searchInput = search.querySelector('input[name="search"]')
  const searchResults = search.querySelector('.search__results')

  searchInput.on('input', function() {
    // if there is no value, quit it
    if (!this.value) {
      searchResults.style.display = 'none'
      return
    }

    // Show search results
    searchResults.style.display = 'block'

    axios
      .get(`/api/search?q=${this.value}`)
      .then((res) => {
        if (res.data.length) {
          const html = searchResultsHTML(res.data)
          searchResults.innerHTML = dompurify.sanitize(html)
          return
        }

        // Tell user nothing came back
        searchResults.innerHTML = dompurify.sanitize(
          `<div class="search__result">No results for ${
            this.value
          } found.</div>`
        )
      })
      .catch((err) => {
        console.error(err)
      })
  })

  // handle keyboard inputs
  searchInput.on('keyup', (e) => {
    // if they aren't pressing up, down or enter, skip!
    if (![38, 40, 13].includes(e.keyCode)) {
      return
    }
    const activeClass = 'search__result--active'
    const current = search.querySelector(`.${activeClass}`)
    const items = search.querySelectorAll('.search__result')
    let next

    if (e.keyCode === 40 && current) {
      // if user presses down and we're on the current item
      // next will be the next sibling or the first item if current is last item
      next = current.nextElementSibling || items[0]
    } else if (e.keyCode === 40) {
      // if user presses down (first time - nothing selected), next = first item
      // https://github.com/prettier/prettier/issues/736#issuecomment-291934981
      // eslint-disable-next-line
      ;[next] = items // equivalent -> next = items[0]
    } else if (e.keyCode === 38 && current) {
      // if user presses up and we're on the current item
      // next will be the previous sibling or the last item if current is first item
      next = current.previousElementSibling || items[items.length - 1]
    } else if (e.keyCode === 38) {
      // if user presses up (first time - nothing selected), next = last item
      next = items[items.length - 1]
    } else if (e.keyCode === 13 && current.href) {
      // if user presses enter and we're on current item with href link
      // then take them there
      window.location = current.href
      return
    }

    if (current) {
      // Remove current element active class to apply to next element
      current.classList.remove(activeClass)
    }
    next.classList.add(activeClass)
  })
}

export default typeAhead
