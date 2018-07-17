import '../sass/style.scss'

import { $, $$ } from './modules/bling' // eslint-disable-line
import autoComplete from './modules/autoComplete'
import typeAhead from './modules/typeAhead'

autoComplete($('#address'), $('#lat'), $('#lng'))

typeAhead($('.search'))
