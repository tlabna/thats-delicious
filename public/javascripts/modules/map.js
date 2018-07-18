import axios from 'axios'
import { $ } from './bling'

const mapOptions = {
  center: {
    lat: 43.2,
    lng: -79.8,
  },
  zoom: 11,
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
  axios
    .get(`/api/stores/near?lat=${lat}&lng=${lng}`)
    .then((res) => {
      const places = res.data
      if (!places.length) {
        alert('no places found!')
        return
      }

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
 * Creates Google map and displays on screen
 * - Calls loadPlaces() which handles creating markers and fixes zoom dynamically
 * - Adds google places autocomplete search functionality
 *
 * @param {NodeElement} mapDiv DOM Element where map will be placed
 */
function makeMap(mapDiv) {
  if (!mapDiv) return

  // make map
  const map = new google.maps.Map(mapDiv, mapOptions)
  loadPlaces(map)

  const input = $('[name="geolocate"]')
  const autocomplete = new google.maps.places.Autocomplete(input)
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    const { lat, lng } = place.geometry.location
    loadPlaces(map, lat(), lng())
  })
}

export default makeMap
