import '../sass/style.scss'

import { $, $$ } from './modules/bling' // eslint-disable-line
import autoComplete from './modules/autoComplete'
import typeAhead from './modules/typeAhead'
import makeMap from './modules/map'
import ajaxHeart from './modules/heart'

autoComplete($('#address'), $('#lat'), $('#lng'))

typeAhead($('.search'))

makeMap($('#map'))

const heartForms = $$('form.heart')
heartForms.on('submit', ajaxHeart)
