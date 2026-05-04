import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Batches from './pages/Batches';
import Faculties from './pages/Faculties';
import Subjects from './pages/Subjects';
import RoutineBuilder from './pages/RoutineBuilder';
import FacultyRoutine from './pages/FacultyRoutine';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="batches" element={<Batches />} />
          <Route path="faculties" element={<Faculties />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="routine-builder" element={<RoutineBuilder />} />
          <Route path="faculty-routine" element={<FacultyRoutine />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
