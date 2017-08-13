function autocomplete(input, latInput, lngInput, villageInput, districtInput) {
	console.log(input, latInput, lngInput, villageInput, districtInput);
	if (!input) return;
	const dropdown = new google.maps.places.Autocomplete(input);

	dropdown.addListener('place_changed', () => {
		const place = dropdown.getPlace();
		console.log(place);
		latInput.value = place.geometry.location.lat();
		lngInput.value = place.geometry.location.lng();
		villageInput.value = place.address_components[0].long_name;
		districtInput.value = place.address_components[1].long_name;
		console.log(place);
	});

	// Disable auto form send if someone hits enter
	input.on('keydown', e => {
		if (e.keyCode === 13) e.preventDefault();
	});
}

export default autocomplete;
