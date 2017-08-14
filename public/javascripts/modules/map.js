import axios from 'axios';
import { $ } from './bling';

const mapOptions = {
	center: { lat: 9.257857, lng: 47.805819 },
	zoom: 7,
};

function loadPlaces(map, lat = 9.257857, lng = 47.805819) {
	axios.get(`/api/v1/schools/map`).then(res => {
		const places = res.data;
		console.log(places);
		// console.log(places);
		if (!places.length) {
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
			place.count = place.students.reduce((n, b) => {
				return n + (b.bursary.supported === true);
			}, 0);
			console.log(place.count);
			const marker = new google.maps.Marker({
				map: map,
				icon: place.markerColor,
				position: position,
			});
			marker.place = place;
			return marker;
		});

		// When someone clicks on a marker, show the details of that place
		markers.forEach(marker =>
			marker.addListener('click', function() {
				const html = `
          <div class="popup">
            <a href="/school/${this.place.slug}">
              <img src="/uploads/${this.place.photo ||
								'school.png'}" alt="${this.place.name}" />
              <p><strong>${this.place.name}</strong> -  ${this.place.location
					.village}, ${this.place.location.district}</p>
						</a>
						<p>Project: ${this.place.project}</p>
						<p>Number of Students: ${this.place.students.length}</p>
						<p>Bursary Students: ${this.place.count}</p>
          </div>
        `;
				infoWindow.setContent(html);
				infoWindow.open(map, this);
			})
		);

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
	// const input = $('[name="geolocate"]');
	// const autocomplete = new google.maps.places.Autocomplete(input);
	// autocomplete.addListener('place_changed', () => {
	// 	const place = autocomplete.getPlace();
	// 	loadPlaces(
	// 		map,
	// 		place.geometry.location.lat(),
	// 		place.geometry.location.lng()
	// 	);
	// });
}

export default makeMap;
