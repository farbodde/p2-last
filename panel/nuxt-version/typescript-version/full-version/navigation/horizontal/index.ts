import admin from '../vertical/admin'
import type { HorizontalNavItems } from '@layouts/types'

// Mirror the vertical admin navigation for the (optional) horizontal layout.
export default [...admin] as HorizontalNavItems
