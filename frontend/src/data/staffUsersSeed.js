export const STAFF_ROLES = ['IT Admin', 'Admin Manager', 'Owner']

export function createStaffUsersSeed() {
  return [
    {
      id: 'u1',
      name: 'Alex Rivera',
      phone: '+63 917 555 0101',
      email: 'alex.rivera@shaws.local',
      role: 'IT Admin',
    },
    {
      id: 'u2',
      name: 'Patricia Lim',
      phone: '+63 918 555 0202',
      email: 'patricia.lim@shaws.local',
      role: 'Admin Manager',
    },
    {
      id: 'u3',
      name: 'Jordan Cruz',
      phone: '+63 919 555 0303',
      email: 'jordan.cruz@shaws.local',
      role: 'Owner',
    },
  ]
}
