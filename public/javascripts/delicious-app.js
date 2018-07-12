import '../sass/style.scss'

import { $, $$ } from './modules/bling' // eslint-disable-line
import autoComplete from './modules/autoComplete'

autoComplete($('#address'), $('#lat'), $('#lng'))
