
import { useState, useEffect } from 'react';
import {
    Routes,
    Route,
    Navigate,
    Link,
    useLocation,
} from 'react-router-dom';

import Home from './pages/Home';
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

    const [authType, setAuthType] = useState(null);

    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });

    const [checkingAuth, setCheckingAuth] = useState(true);

    // Verify authentication when the application starts
    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('auth_token');

            if (!token) {
                setUser(null);
                setCheckingAuth(false);
                return;
            }

            try {
                const response = await api.get('/me');

                setUser(response.data.user);

                localStorage.setItem(
                    'user',
                    JSON.stringify(response.data.user)
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

    // Handle successful login or registration
    const handleAuthSuccess = (authenticatedUser) => {
        setUser(authenticatedUser);

        localStorage.setItem(
            'user',
            JSON.stringify(authenticatedUser)
        );

        setAuthType(null);
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        }

        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');

        setUser(null);
    };

    // Show loading screen while checking authentication
    if (checkingAuth) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <div className="spinner-border text-dark" />
                    <p className="mt-3">Loading Coastal Haven...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {location.pathname !== '/' && (
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                    <div className="container">

                        <Link className="navbar-brand fw-bold" to="/">
                            COASTAL HAVEN
                        </Link>

                        <div className="d-flex flex-wrap align-items-center gap-3">

                            <Link className="text-white text-decoration-none" to="/">
                                Home
                            </Link>

                            <Link className="text-white text-decoration-none" to="/booking">
                                Book a Room
                            </Link>

                            {user && (
                                <Link
                                    className="text-white text-decoration-none"
                                    to="/my-bookings"
                                >
                                    My Bookings
                                </Link>
                            )}

                            {user?.role === 'admin' && (
                                <Link
                                    className="text-white text-decoration-none"
                                    to="/admin"
                                >
                                    Admin Dashboard
                                </Link>
                            )}

                            {user ? (
                                <>
                                    <span className="text-white">
                                        {user.name}
                                    </span>

                                    <button
                                        className="btn btn-outline-light btn-sm"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="btn btn-outline-light btn-sm"
                                    onClick={() => setAuthType('login')}
                                >
                                    Login
                                </button>
                            )}

                        </div>
                    </div>
                </nav>
            )}

            <Routes>
                <Route
                    path="/"
                    element={
                        <Home
                            user={user}
                            onLogin={() => setAuthType('login')}
                            onRegister={() => setAuthType('register')}
                            onLogout={handleLogout}
                        />
                    }
                />

                <Route
                    path="/booking"
                    element={
                        <Booking
                            user={user}
                            onLogin={() => setAuthType('login')}
                            onRegister={() => setAuthType('register')}
                        />
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

            {authType && (
                <AuthModal
                    type={authType}
                    onClose={() => setAuthType(null)}
                    onSuccess={handleAuthSuccess}
                    onSwitch={(newType) => setAuthType(newType)}
                />
            )}
        </>
    );
}

function App() {
    return <AppContent />;
}

export default App;
