export const CUSTOMER_STATUS = ['Active', 'Suspended', 'Inactive']
export const CUSTOMER_SEX = ['Male', 'Female', 'Other']

export function createCustomersSeedState() {
  const customers = [
    {
      id: 'c1',
      name: 'Liza Montoya',
      phone: '+63 917 100 2001',
      email: 'liza.m@email.com',
      sex: 'Female',
      birthdate: '1992-03-15',
      address: '12 Mabini St., San Jose',
      status: 'Active',
    },
    {
      id: 'c2',
      name: 'Roberto Cruz',
      phone: '+63 918 200 3002',
      email: 'roberto.c@email.com',
      sex: 'Male',
      birthdate: '1988-11-02',
      address: '45 Rizal Ave., Poblacion',
      status: 'Active',
    },
    {
      id: 'c3',
      name: 'Carmen Diaz',
      phone: '+63 919 300 4003',
      email: 'carmen.d@email.com',
      sex: 'Female',
      birthdate: '1995-07-22',
      address: '8 Luna St., Poblacion',
      status: 'Suspended',
    },
    {
      id: 'c4',
      name: 'Miguel Torres',
      phone: '+63 920 400 5004',
      email: 'miguel.t@email.com',
      sex: 'Male',
      birthdate: '1990-01-10',
      address: '22 Bonifacio Rd., Santa Mesa',
      status: 'Active',
    },
  ]

  const customerOrders = [
    {
      id: 'co-p1',
      customerId: 'c1',
      status: 'pending',
      serviceType: 'Food delivery',
      riderName: 'Maria Santos',
      address: '12 Mabini St., San Jose',
      date: '2026-04-01',
      orderRef: 'ORD-10042',
      details:
        '2x Burger meals, 1x Iced tea. Pickup: Grill House. ETA 25 min.',
    },
    {
      id: 'co-c1',
      customerId: 'c2',
      status: 'completed',
      serviceType: 'Goods',
      riderName: 'Juan Dela Cruz',
      address: '45 Rizal Ave., Poblacion',
      date: '2026-03-30',
      orderRef: 'ORD-09912',
      details: 'Parcel delivery — signed received.',
    },
    {
      id: 'co-c2',
      customerId: 'c1',
      status: 'completed',
      serviceType: 'Bills payment',
      riderName: 'Juan Dela Cruz',
      address: '12 Mabini St., San Jose',
      date: '2026-03-28',
      orderRef: 'ORD-09880',
      details: 'Meralco bill — receipt uploaded.',
    },
    {
      id: 'co-x1',
      customerId: 'c3',
      status: 'cancelled',
      serviceType: 'Food delivery',
      riderName: 'Pedro Reyes',
      address: '8 Luna St., Poblacion',
      date: '2026-03-27',
      orderRef: 'ORD-09801',
      details: 'Cancelled by customer before pickup.',
    },
    {
      id: 'co-x2',
      customerId: 'c1',
      status: 'cancelled',
      serviceType: 'Other services',
      riderName: 'Ana Garcia',
      address: '12 Mabini St., San Jose',
      date: '2026-03-25',
      orderRef: 'ORD-09790',
      details: 'Errand cancelled — slot unavailable.',
    },
  ]

  return { customers, customerOrders }
}
