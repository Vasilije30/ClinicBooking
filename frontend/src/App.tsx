import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import DoctorsPage from "./pages/DoctorsPage";
import DoctorDetailsPage from "./pages/DoctorDetailsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPage from "./pages/AdminPage";
import AdminSpecialtiesPage from "./pages/AdminSpecialtiesPage";
import AdminExaminationTypesPage from "./pages/AdminExaminationTypesPage";
import AdminDoctorsPage from "./pages/AdminDoctorsPage";
import MyAppointmentsPage from "./pages/MyAppointmentsPage";
import MySchedulePage from "./pages/MySchedulePage";
import DoctorAppointmentsPage from "./pages/DoctorAppointmentsPage";
import MyTimeOffPage from "./pages/MyTimeOffPage";
import NotFoundPage from "./pages/NotFoundPage";
import ServicesPage from "./pages/ServicesPage";
import PricingPage from "./pages/PricingPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/usluge" element={<ServicesPage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/cenovnik" element={<PricingPage />} />
        <Route path="/doctors/:id" element={<DoctorDetailsPage/>}/>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage />}></Route>
        <Route element={<ProtectedRoute roles={["Admin"]} />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/specialties" element={<AdminSpecialtiesPage/>}/>
          <Route path="/admin/examination-types" element={<AdminExaminationTypesPage/>} />
          <Route path="/admin/doctors" element={<AdminDoctorsPage/>} />
        </Route>
        <Route element={<ProtectedRoute roles={["Patient"]}/>}>
          <Route path="/my-appointments" element={<MyAppointmentsPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={["Doctor"]} />}>
          <Route path="/doctor/schedule" element={<MySchedulePage />} />
          <Route path="/doctor/appointments" element={<DoctorAppointmentsPage/>}/>
          <Route path="/doctor/time-offs" element={<MyTimeOffPage/>}/>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}