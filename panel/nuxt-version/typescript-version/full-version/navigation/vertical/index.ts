import admin from './admin'
import type { VerticalNavItems } from '@layouts/types'

// P2 Player admin panel navigation. The demo template sections
// (apps-and-pages, ui-elements, forms, charts, others, dashboard) are retained
// in the repo for reference but are intentionally not mounted in the sidebar.
export default [...admin] as VerticalNavItems
