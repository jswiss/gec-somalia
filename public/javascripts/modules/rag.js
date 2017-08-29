import axios from 'axios';

function rag() {
	const radios = document.querySelector('.rag__radios');
	radios.addEventListener('change', function(rating) {
		const newRating = rating.target.value;
		console.log(newRating);

		// TODO: Add axios to post new stuffs
		// TODO: set the color of the table row bg to equal the color chosen
	});
}

export default rag;
