import axios from 'axios';
import { $ } from './bling';

const mapOptions = {
  center: { lat: 7.8457807, lng: 45.1235531, },
  zoom: 7,
};

function loadPlaces(map, lat = 7.8457807, lng = 45.1235531) {
  axios.get(`/api/v1/schools/near?lat=${lat}&lng=${lng}`)
    .then(res => {
      const schools = res.data;
      console.log(schools);
      if (!schools.length) {
        alert('no schools here!');
        return;
      }

      // create a boundary area
      const bounds = new google.maps.LatLngBounds();
      const infoWindow = new google.maps.InfoWindow();

      const markers = places.map(place => {
        const [placeLng, placeLat] = place.location.coordinates;
        const position = { lat: placeLat, lng: placeLng };
        bounds.extend(position);
        const marker = new google.maps.Marker({
          map: map,
          position: position
        });
        marker.place = place;
        return marker;
      });

      // When someone clicks on a marker, show the details of that place
      markers.forEach(marker => marker.addListener('click', function() {
        const html = `
          <div class="popup">
            <a href="/store/${this.school.slug}">
              <img src="/uploads/${this.school.photo || 'store.png'}" alt="${this.school.name}" />
              <p><strong>${this.school.name}</strong> -  ${this.school.location.address}</p>
            </a>
          </div>
        `;
        infoWindow.setContent(html);
        infoWindow.open(map, this);
      }));

      // zoom the map to fit the boundary area
      map.setCenter(bounds.getCenter());
      map.fitBounds(bounds);
    });
}

// pass input to Google Maps Autocomplete!
function makeMap(mapDiv) {
  if (!mapDiv) return;
  // make our map
  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);
  const input = $('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
  });
}

export default makeMap;
