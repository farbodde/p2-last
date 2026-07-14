// P2 Player admin navigation. Every item is CASL-gated on the 'AdminPanel'
// subject; the admin role has `manage all` so it sees everything, while other
// roles see nothing and are bounced by the ACL middleware.
const acl = { action: 'read', subject: 'AdminPanel' }

export default [
  {
    title: 'Dashboard',
    icon: { icon: 'tabler-smart-home' },
    to: 'admin-dashboard',
    ...acl,
  },
  {
    title: 'Users',
    icon: { icon: 'tabler-users' },
    to: 'admin-users',
    ...acl,
  },
  {
    title: 'Reports',
    icon: { icon: 'tabler-flag' },
    to: 'admin-reports',
    ...acl,
  },
  {
    title: 'Games Catalog',
    icon: { icon: 'tabler-device-gamepad-2' },
    ...acl,
    children: [
      { title: 'Games', to: 'admin-games-games', ...acl },
      { title: 'Platforms', to: 'admin-games-platforms', ...acl },
      { title: 'Categories', to: 'admin-games-categories', ...acl },
      { title: 'Items', to: 'admin-games-items', ...acl },
    ],
  },
  {
    title: 'Filter Categories',
    icon: { icon: 'tabler-filter' },
    to: 'admin-filter-categories',
    ...acl,
  },
  {
    title: 'Feedback',
    icon: { icon: 'tabler-message-report' },
    to: 'admin-feedback',
    ...acl,
  },
  {
    title: 'Notifications',
    icon: { icon: 'tabler-bell' },
    to: 'admin-notifications',
    ...acl,
  },
]
