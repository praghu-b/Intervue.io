import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RoleSelection from './pages/RoleSelection/RoleSelection';
import CreateQuestion from './pages/QuestionCreation.jsx/QuestionCreation';
import StudentEntry from './pages/StudentEntry.jsx/StudentEntry';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<RoleSelection />} />
        <Route path='/student-entry' element={<StudentEntry />} />
        <Route path='/create-questions' element={<CreateQuestion />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
