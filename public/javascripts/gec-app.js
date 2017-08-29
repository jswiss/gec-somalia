import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import rag from './modules/rag';

autocomplete(
	$('#address'),
	$('#lat'),
	$('#lng'),
	$('#village'),
	$('#district')
);

typeAhead($('.search'));

makeMap($('#map'));

rag($('.rag__radios'));
