
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import PlannerLayout from './planner/PlannerLayout';
import TasksStep from './planner/steps/TasksStep';
import SoundStep from './planner/steps/SoundStep';
import MusicStep from './planner/steps/MusicStep';
import SchedulePage from './planner/steps/SchedulePage';
import ProtectedRoute from './components/ProtectedRoute';
import FocusPage from './planner/steps/FocusPage';
import SessionsPage from './sessions/SessionsPage';
import Dashboard from './pages/dashboard/Dashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />

      <Route
        path="/plan"
        element={
          <ProtectedRoute>
            <PlannerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="tasks" replace />} />
        <Route path="tasks" element={<TasksStep />} />
        <Route path="sound" element={<SoundStep />} />
        <Route path="music" element={<MusicStep />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="focus" element={<FocusPage />} />
      </Route>
      <Route path="/sessions" element={<SessionsPage />} />
    </Routes>
  );
}
