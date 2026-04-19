export const AVAILABILITY = ['Available', 'On delivery', 'Off duty']
export const ACCOUNT_STATUS = ['Active', 'Inactive', 'Pending']

export function createSeedState() {
  const riders = [
    {
      id: 'r1',
      name: 'Juan Dela Cruz',
      phone: '+63 917 111 2233',
      email: 'juan.delacruz@email.com',
      barangay: 'Poblacion',
      availability: 'Available',
      accountStatus: 'Active',
    },
    {
      id: 'r2',
      name: 'Maria Santos',
      phone: '+63 918 444 5566',
      email: 'maria.santos@email.com',
      barangay: 'San Jose',
      availability: 'On delivery',
      accountStatus: 'Active',
    },
    {
      id: 'r3',
      name: 'Pedro Reyes',
      phone: '+63 919 777 8899',
      email: 'pedro.reyes@email.com',
      barangay: 'Santa Mesa',
      availability: 'Off duty',
      accountStatus: 'Inactive',
    },
    {
      id: 'r4',
      name: 'Ana Garcia',
      phone: '+63 920 333 4455',
      email: 'ana.garcia@email.com',
      barangay: 'Poblacion',
      availability: 'Available',
      accountStatus: 'Pending',
    },
  ]

  const orders = [
    {
      id: 'o-p1',
      riderId: 'r2',
      status: 'pending',
      serviceType: 'Food delivery',
      customerName: 'Liza M.',
      address: '12 Mabini St., San Jose',
      date: '2026-04-01',
      orderRef: 'ORD-10042',
      details:
        '2x Burger meals, 1x Iced tea. Pickup: Grill House San Jose. ETA 25 min.',
    },
    {
      id: 'o-c1',
      riderId: 'r1',
      status: 'completed',
      serviceType: 'Goods',
      customerName: 'Roberto Cruz',
      address: '45 Rizal Ave., Poblacion',
      date: '2026-03-30',
      orderRef: 'ORD-09912',
      details: "Parcel from Shaw's Delivery hub to customer. Signed received.",
    },
    {
      id: 'o-c2',
      riderId: 'r1',
      status: 'completed',
      serviceType: 'Bills payment',
      customerName: 'Carmen D.',
      address: '8 Luna St., Poblacion',
      date: '2026-03-28',
      orderRef: 'ORD-09880',
      details: 'Meralco bill payment — receipt uploaded.',
    },
    {
      id: 'o-x1',
      riderId: 'r3',
      status: 'cancelled',
      serviceType: 'Food delivery',
      customerName: 'Guest User',
      address: 'Unknown block, Santa Mesa',
      date: '2026-03-27',
      orderRef: 'ORD-09801',
      details: 'Cancelled by customer before pickup.',
    },
    {
      id: 'o-d1',
      riderId: 'r2',
      status: 'declined',
      serviceType: 'Other services',
      customerName: 'Miguel T.',
      address: '22 Bonifacio Rd.',
      date: '2026-03-26',
      orderRef: 'ORD-09755',
      details: 'Rider declined — distance exceeded preferred zone.',
    },
    {
      id: 'o-d2',
      riderId: 'r1',
      status: 'declined',
      serviceType: 'Goods',
      customerName: 'Shop X',
      address: 'Warehouse district',
      date: '2026-03-25',
      orderRef: 'ORD-09720',
      details: 'Rider unavailable at requested time.',
    },
  ]

  return { riders, orders }
}
