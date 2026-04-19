import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminAccountSettings from './pages/AdminAccountSettings.jsx'
import AdminAboutUs from './pages/AdminAboutUs.jsx'
import AdminBanners from './pages/AdminBanners.jsx'
import AdminContactUs from './pages/AdminContactUs.jsx'
import AdminCustomerOrderHistory from './pages/AdminCustomerOrderHistory.jsx'
import AdminCustomers from './pages/AdminCustomers.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminForgotPassword from './pages/AdminForgotPassword.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminMyAccount from './pages/AdminMyAccount.jsx'
import AdminDeliveryServices from './pages/AdminDeliveryServices.jsx'
import AdminRestaurantBanners from './pages/AdminRestaurantBanners.jsx'
import AdminRiderHistory from './pages/AdminRiderHistory.jsx'
import AdminRiders from './pages/AdminRiders.jsx'
import AdminSystemSettings from './pages/AdminSystemSettings.jsx'
import AdminUserAccount from './pages/AdminUserAccount.jsx'
import { CustomerProtectedLayout } from './components/customer/CustomerProtectedLayout.jsx'
import CustomerAbout from './pages/CustomerAbout.jsx'
import CustomerContact from './pages/CustomerContact.jsx'
import CustomerDashboard from './pages/CustomerDashboard.jsx'
import CustomerDeliveryServices from './pages/CustomerDeliveryServices.jsx'
import CustomerFeedback from './pages/CustomerFeedback.jsx'
import CustomerMyAccount from './pages/CustomerMyAccount.jsx'
import CustomerOrderHistory from './pages/CustomerOrderHistory.jsx'
import HowToOrder from './pages/HowToOrder.jsx'
import PublicAbout from './pages/PublicAbout.jsx'
import PublicContact from './pages/PublicContact.jsx'
import PublicHome from './pages/PublicHome.jsx'
import { RiderProtectedLayout } from './components/rider/RiderProtectedLayout.jsx'
import RiderAbout from './pages/RiderAbout.jsx'
import RiderContact from './pages/RiderContact.jsx'
import RiderDashboard from './pages/RiderDashboard.jsx'
import RiderDeliveries from './pages/RiderDeliveries.jsx'
import RiderLogin from './pages/RiderLogin.jsx'
import RiderMyAccount from './pages/RiderMyAccount.jsx'
import RiderSignUp from './pages/RiderSignUp.jsx'
import UserLogin from './pages/UserLogin.jsx'
import UserSignUp from './pages/UserSignUp.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/about" element={<PublicAbout />} />
        <Route path="/contact" element={<PublicContact />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignUp />} />
        <Route path="/how-to-order" element={<HowToOrder />} />
        <Route path="/rider/login" element={<RiderLogin />} />
        <Route path="/rider/signup" element={<RiderSignUp />} />
        <Route path="/rider" element={<RiderProtectedLayout />}>
          <Route index element={<RiderDashboard />} />
          <Route path="deliveries" element={<RiderDeliveries />} />
          <Route path="about" element={<RiderAbout />} />
          <Route path="contact" element={<RiderContact />} />
          <Route path="account" element={<RiderMyAccount />} />
        </Route>
        <Route path="/customer" element={<CustomerProtectedLayout />}>
          <Route index element={<CustomerDashboard />} />
          <Route path="delivery" element={<CustomerDeliveryServices />} />
          <Route path="orders" element={<CustomerOrderHistory />} />
          <Route path="about" element={<CustomerAbout />} />
          <Route path="contact" element={<CustomerContact />} />
          <Route path="feedback" element={<CustomerFeedback />} />
          <Route path="account" element={<CustomerMyAccount />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/forgot-password"
          element={<AdminForgotPassword />}
        />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/about" element={<AdminAboutUs />} />
        <Route path="/admin/contact" element={<AdminContactUs />} />
        <Route path="/admin/system" element={<AdminSystemSettings />} />
        <Route path="/admin/system/banners" element={<AdminBanners />} />
        <Route
          path="/admin/system/restaurant-banners"
          element={<AdminRestaurantBanners />}
        />
        <Route path="/admin/system/riders" element={<AdminRiders />} />
        <Route
          path="/admin/system/riders/:riderId/history"
          element={<AdminRiderHistory />}
        />
        <Route path="/admin/delivery" element={<AdminDeliveryServices />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route
          path="/admin/customers/:customerId/orders"
          element={<AdminCustomerOrderHistory />}
        />
        <Route path="/admin/account" element={<AdminAccountSettings />} />
        <Route path="/admin/account/users" element={<AdminUserAccount />} />
        <Route
          path="/admin/account/my-account"
          element={<AdminMyAccount />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
