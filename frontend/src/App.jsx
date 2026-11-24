
import { useEffect, useState } from 'react';
import {
    Routes,
    Route,
    Navigate,
    Link,
    useLocation,
    useNavigate,
} from 'react-router-dom';

import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import AuthModal from './components/AuthModal';
import api from './services/api';

function ProtectedRoute({ user, children, adminOnly = false }) {
    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
}

function AppContent() {
    const location = useLocation();
    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            localStorage.removeItem('user');
            return null;
        }
    });

    const [authType, setAuthType] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [selectedRoomId, setSelectedRoomId] = useState(null);

    // Verify the saved login token when the application starts.
    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('auth_token');

            if (!token) {
                setCheckingAuth(false);
                return;
            }

            try {
                const response = await api.get('/me');
                const authenticatedUser = response.data.user || response.data;

                setUser(authenticatedUser);
                localStorage.setItem(
                    'user',
                    JSON.stringify(authenticatedUser)
                );
            } catch (error) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setCheckingAuth(false);
            }
        };

        verifyUser();
    }, []);

    // Start booking a particular room.
    const handleBookNow = (roomId) => {
        if (!roomId) {
            navigate('/rooms');
            return;
        }

        setSelectedRoomId(roomId);

        if (user) {
            navigate('/booking', {
                state: { selectedRoomId: roomId },
            });
        } else {
            setAuthType('login');
        }
    };

    // Called after successful login or registration.
    const handleAuthSuccess = (authenticatedUser) => {
        setUser(authenticatedUser);

        localStorage.setItem(
            'user',
            JSON.stringify(authenticatedUser)
        );

        setAuthType(null);

        // Continue the booking process if a room was selected.
        if (selectedRoomId) {
            navigate('/booking', {
                state: { selectedRoomId },
            });

            setSelectedRoomId(null);
        }
    };

    // Logout the current user.
    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');

            setUser(null);
            setSelectedRoomId(null);
            setAuthType(null);

            navigate('/');
        }
    };

    const openLogin = () => {
        setAuthType('login');
    };

    if (checkingAuth) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <div
                        className="spinner-border text-primary mb-3"
                        role="status"
                    />
                    <p className="text-muted">Loading Coastal Haven...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* NAVIGATION BAR */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
                <div className="container">
                    <Link
                        className="navbar-brand fw-bold"
                        to="/"
                    >
                        <span className="text-primary">COASTAL</span> HAVEN
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mainNavbar"
                        aria-controls="mainNavbar"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div
                        className="collapse navbar-collapse"
                        id="mainNavbar"
                    >
                        <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
                            <Link
                                className={`nav-link ${
                                    location.pathname === '/' ? 'active fw-bold' : ''
                                }`}
                                to="/"
                            >
                                Home
                            </Link>

                            <Link
                                className={`nav-link ${
                                    location.pathname === '/rooms' ? 'active fw-bold' : ''
                                }`}
                                to="/rooms"
                            >
                                Explore Rooms
                            </Link>

                            {user && user.role !== 'admin' && (
                                <Link
                                    className={`nav-link ${
                                        location.pathname === '/my-bookings'
                                            ? 'active fw-bold'
                                            : ''
                                    }`}
                                    to="/my-bookings"
                                >
                                    My Bookings
                                </Link>
                            )}

                            {user?.role === 'admin' && (
                                <Link
                                    className={`nav-link ${
                                        location.pathname === '/admin'
                                            ? 'active fw-bold'
                                            : ''
                                    }`}
                                    to="/admin"
                                >
                                    Admin Dashboard
                                </Link>
                            )}

                            {user ? (
                                <div className="d-flex align-items-center gap-2 ms-lg-3 mt-2 mt-lg-0">
                                    <span className="text-muted small">
                                        Welcome, <strong>{user.name}</strong>
                                    </span>

                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-primary ms-lg-3 mt-2 mt-lg-0 px-4"
                                    onClick={openLogin}
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* APPLICATION ROUTES */}
            <Routes>
                <Route
                    path="/"
                    element={
                        <Home
                            user={user}
                            onLogin={openLogin}
                            onBookNow={handleBookNow}
                        />
                    }
                />

                <Route
                    path="/rooms"
                    element={
                        <Rooms
                            onBookNow={handleBookNow}
                        />
                    }
                />

                <Route
                    path="/booking"
                    element={
                        <ProtectedRoute user={user}>
                            <Booking
                                user={user}
                                initialSelectedRoomId={
                                    location.state?.selectedRoomId || null
                                }
                            />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-bookings"
                    element={
                        <ProtectedRoute user={user}>
                            <MyBookings />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute
                            user={user}
                            adminOnly
                        >
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>

            {/* LOGIN AND REGISTRATION POPUP */}
            {authType && (
                <AuthModal
                    type={authType}
                    onClose={() => setAuthType(null)}
                    onSuccess={handleAuthSuccess}
                    onSwitch={setAuthType}
                />
            )}
        </>
    );
}

export default function App() {
    return <AppContent />;
}
