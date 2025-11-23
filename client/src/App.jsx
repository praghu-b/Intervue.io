import { useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSocket } from './contexts/SocketContext';
import RoleSelection from './pages/RoleSelection/RoleSelection';
import QuestionCreation from './pages/QuestionCreation/QuestionCreation';
import StudentEntry from './pages/StudentEntry/StudentEntry';
import StudentPollView from './pages/PollView/PollView';
import PollHistory from './pages/PollHistory/PollHistory';
import KickedOut from './pages/KickedOut/KickedOut';

const StudentFlow = () => {
    const [userJoined, setUserJoined] = useState(null);
    const { isKicked } = useSocket();

    const handleJoinSuccess = (userData) => {
        // You can save the user object here, e.g., { name: 'Alice', type: 'student' }
        setUserJoined(userData);
    };

    // Show kicked out page if student was kicked
    if (isKicked) {
        return <KickedOut />;
    }

    return userJoined ? (
        <StudentPollView user={userJoined} />
    ) : (
        <StudentEntry onJoinSuccess={handleJoinSuccess} />
    );
}

const TeacherFlow = () => {
    const { pollState, socket, isConnected } = useSocket();
    const navigate = useNavigate();
    const [teacherJoined, setTeacherJoined] = React.useState(false);

    // Auto-join teacher when component mounts and socket is connected
    React.useEffect(() => {
        if (isConnected && socket && !teacherJoined) {
            socket.emit('user:join', { name: 'Teacher', type: 'teacher' });
            setTeacherJoined(true);
        }
    }, [isConnected, socket, teacherJoined]);

    // The Teacher views the Poll if one is active or has results.
    // Otherwise, they see the creation form.
    const isPollActive = pollState.status === 'VOTING' || pollState.status === 'RESULTS';

    // RENDER LOGIC
    if (isPollActive) {
        // Teacher views the poll, with results visible immediately
        // The 'isTeacher' prop unlocks result viewing and disables voting.
        return <StudentPollView isTeacher={true} user={{ name: 'Teacher', type: 'teacher' }} />;
    } else {
        // Poll is 'IDLE' or 'RESULTS' (and user reviewed results), show the creation form
        return <QuestionCreation isTeacher={true} />;
    }
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<RoleSelection />} />
                <Route path='/student' element={<StudentFlow />} />
                <Route path='/create-questions' element={<TeacherFlow />} />
                <Route path='/poll-history' element={<PollHistory />} />
                <Route path='*' element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;