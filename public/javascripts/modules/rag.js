function rag() {
	const radios = document.querySelector('.rag__radios');
	radios.addEventListener('change', function(a, b) {
		const checked = this;
		console.log(a.target.value);
	});
}

export default rag;
