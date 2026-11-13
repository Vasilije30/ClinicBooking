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

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/doctors/:id" element={<DoctorDetailsPage/>}/>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage />}></Route>
        <Route element={<ProtectedRoute roles={["Admin"]} />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/specialties" element={<AdminSpecialtiesPage/>}/>
          <Route path="/admin/examination-types" element={<AdminExaminationTypesPage/>} />
          <Route path="/admin/doctors" element={<AdminDoctorsPage/>} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/my-appointments" element={<MyAppointmentsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}