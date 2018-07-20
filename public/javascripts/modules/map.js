import axios from 'axios'
import { $ } from './bling'

let mapOptions = {
  center: {
    lat: 43.2,
    lng: -79.8,
  },
  zoom: 11,
}

/**
 * Promise based navigator.geolocation.getCurrentPosition()
 *
 * @returns Promise based getCurrentPosition() Geolocation API
 */
function getCurrentPosition() {
  // Check if geolocation is supported by browser
  if (navigator.geolocation) {
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    )
  } else {
    return new Promise((resolve) => resolve({}))
  }
}

/**
 * Loads places on google map with markers and info window.
 * - Calls api to query db for stores near given lat/lng (alerts if none)
 * - Places markers on map which are clickable and display info windows
 * - Zooms map accordingly to fit all markers on map
 *
 * @param {Object} map Google map object
 * @param {number} [lat=43.2] Latitude coordinate
 * @param {number} [lng=-79.8] Longitude coordinate
 */
function loadPlaces(map, lat = 43.2, lng = -79.8) {
  const mapError = $('.mapError')

  axios
    .get(`/api/stores/near?lat=${lat}&lng=${lng}`)
    .then((res) => {
      const places = res.data

      // If no places, show error message
      if (!places.length) {
        const errorMsg = `
          <div class="flash flash--error">
            <p class="flash__text">Sorry 😅 We can't find any stores near your location. Try a different location using the search box. 💪</p>
            <button class="flash__remove" onClick="this.parentElement.remove()">x</button>
          </div>
        `

        mapError.innerHTML = errorMsg
        return
      }

      mapError.innerHTML = ''

      // create bounds
      const bounds = new google.maps.LatLngBounds()

      // info window
      const infoWindow = new google.maps.InfoWindow()

      // markers
      const markers = places.map((place) => {
        const [placeLng, placeLat] = place.location.coordinates
        const position = { lat: placeLat, lng: placeLng }
        bounds.extend(position)
        const marker = new google.maps.Marker({ map, position })
        marker.place = place
        return marker
      })

      // when someone clicks on a marker, show details of that place
      markers.forEach((marker) =>
        marker.addListener('click', function() {
          const { slug, name, photo, location } = this.place
          const html = `
          <div class="popup">
            <a href="/store/${slug}">
              <img src="/uploads/${photo || 'store.png'}" alt="${name}" />
              <p>${name} - ${location.address}</p>
            </a>
          </div>
        `

          infoWindow.setContent(html)
          infoWindow.open(map, this)
        })
      )

      // zoom the map to fit all markers perfectly
      map.setCenter(bounds.getCenter())
      map.fitBounds(bounds)
    })
    .catch(console.error)
}

/**
 * Creates Google map
 * - Calls loadPlaces() which handles creating markers and setting bounds dynamically
 * - Adds google places autocomplete search functionality
 *
 * @param {NodeElement} mapDiv DOM Element where map will be placed
 * @param {Number} lat Latitude value
 * @param {Number} lng Longitude value
 */
function addMap(mapDiv, lat, lng) {
  const map = new google.maps.Map(mapDiv, mapOptions)

  // load map based on user location if we have their coordinates
  if (lat && lng) {
    loadPlaces(map, lat, lng)
  } else {
    loadPlaces(map)
  }

  // Add google places autocomplete into search box
  const input = $('[name="geolocate"]')
  const autocomplete = new google.maps.places.Autocomplete(input)
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    const { lat, lng } = place.geometry.location
    loadPlaces(map, lat(), lng())
  })
}

/**
 * Creates Google map based on user location (if found) and displays it on screen
 * - Calls addMap() which creates map, markers and fixes zoom dynamically
 * - If location not found, displays map at pre-configured location
 *
 * @param {NodeElement} mapDiv DOM Element where map will be placed
 */
function makeMap(mapDiv) {
  if (!mapDiv) return

  // Find user location based on device position
  getCurrentPosition()
    .then(({ coords }) => {
      // location servies is granted -> we have cooridinates
      const lat = coords.latitude
      const lng = coords.longitude

      // Change mapOptions coordinates to user location
      mapOptions = Object.assign({}, mapOptions, { center: { lat, lng } })

      return { lat, lng }
    })
    .then(({ lat, lng }) => {
      // Display map with users location
      addMap(mapDiv, lat, lng)
    })
    .catch((error) => {
      // Oh no.. User disabled location services
      // log error and fallback to map with pre-configured location
      console.warn(error)
      alert(
        'You must turn on location tracking, so we can automatically find stores near you.'
      )
      addMap(mapDiv)
    })
}

export default makeMap
