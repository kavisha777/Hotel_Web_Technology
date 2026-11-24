
import { useState } from 'react';
import api from '../services/api';

function AuthModal({ type, onClose, onSuccess, onSwitch }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact_number: '',
        password: '',
        password_confirmation: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isRegister = type === 'register';

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError('');
    };

    const handleSwitch = (newType) => {
        setError('');
        onSwitch(newType);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (
            isRegister &&
            formData.password !== formData.password_confirmation
        ) {
            setError('Your passwords do not match.');
            return;
        }

        if (formData.password.length < 8) {
            setError('Your password must contain at least 8 characters.');
            return;
        }

        setLoading(true);

        try {
            const payload = isRegister
                ? {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    contact_number: formData.contact_number.trim(),
                    password: formData.password,
                    password_confirmation: formData.password_confirmation,
                }
                : {
                    email: formData.email.trim(),
                    password: formData.password,
                };

            const response = await api.post(
                isRegister ? '/register' : '/login',
                payload
            );

            const token = response.data.token;
            const authenticatedUser = response.data.user;

            if (!token || !authenticatedUser) {
                throw new Error(
                    'The server did not return the required login information.'
                );
            }

            localStorage.setItem('auth_token', token);
            localStorage.setItem(
                'user',
                JSON.stringify(authenticatedUser)
            );

            onSuccess(authenticatedUser);
        } catch (err) {
            const validationErrors = err.response?.data?.errors;

            if (validationErrors) {
                setError(
                    Object.values(validationErrors)
                        .flat()
                        .join(' ')
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    'Unable to complete your request. Please try again.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="authModalTitle"
            style={{
                backgroundColor: 'rgba(10, 25, 40, 0.72)',
                zIndex: 2000,
            }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    {/* HEADER */}
                    <div className="modal-header bg-primary text-white p-4">
                        <div>
                            <p className="small text-white-50 mb-1">
                                COASTAL HAVEN
                            </p>

                            <h4
                                className="modal-title fw-bold"
                                id="authModalTitle"
                            >
                                {isRegister
                                    ? 'Create Your Account'
                                    : 'Welcome Back'}
                            </h4>

                            <p className="small mb-0 mt-1">
                                {isRegister
                                    ? 'Create an account to reserve your stay.'
                                    : 'Log in to continue your booking.'}
                            </p>
                        </div>

                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            aria-label="Close"
                            onClick={onClose}
                            disabled={loading}
                        />
                    </div>

                    {/* FORM */}
                    <div className="modal-body p-4">
                        {error && (
                            <div
                                className="alert alert-danger"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {isRegister && (
                                <>
                                    <div className="mb-3">
                                        <label
                                            htmlFor="registerName"
                                            className="form-label fw-semibold"
                                        >
                                            Full Name
                                        </label>

                                        <input
                                            id="registerName"
                                            type="text"
                                            name="name"
                                            className="form-control form-control-lg"
                                            placeholder="Enter your full name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            autoComplete="name"
                                            maxLength={255}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label
                                            htmlFor="registerContact"
                                            className="form-label fw-semibold"
                                        >
                                            Contact Number
                                        </label>

                                        <input
                                            id="registerContact"
                                            type="tel"
                                            name="contact_number"
                                            className="form-control form-control-lg"
                                            placeholder="Enter your contact number"
                                            value={formData.contact_number}
                                            onChange={handleChange}
                                            autoComplete="tel"
                                            maxLength={30}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="mb-3">
                                <label
                                    htmlFor="authEmail"
                                    className="form-label fw-semibold"
                                >
                                    Email Address
                                </label>

                                <input
                                    id="authEmail"
                                    type="email"
                                    name="email"
                                    className="form-control form-control-lg"
                                    placeholder="Enter your email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    maxLength={255}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="mb-3">
                                <label
                                    htmlFor="authPassword"
                                    className="form-label fw-semibold"
                                >
                                    Password
                                </label>

                                <input
                                    id="authPassword"
                                    type="password"
                                    name="password"
                                    className="form-control form-control-lg"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete={
                                        isRegister
                                            ? 'new-password'
                                            : 'current-password'
                                    }
                                    minLength={8}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {isRegister && (
                                <div className="mb-4">
                                    <label
                                        htmlFor="confirmPassword"
                                        className="form-label fw-semibold"
                                    >
                                        Confirm Password
                                    </label>

                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        name="password_confirmation"
                                        className="form-control form-control-lg"
                                        placeholder="Enter your password again"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg w-100"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                        />
                                        Please wait...
                                    </>
                                ) : isRegister ? (
                                    'Create Account'
                                ) : (
                                    'Login to Your Account'
                                )}
                            </button>
                        </form>

                        <div className="text-center mt-4">
                            {isRegister ? (
                                <p className="mb-0">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        className="btn btn-link p-0 fw-semibold text-decoration-none"
                                        onClick={() => handleSwitch('login')}
                                        disabled={loading}
                                    >
                                        Login
                                    </button>
                                </p>
                            ) : (
                                <p className="mb-0">
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        className="btn btn-link p-0 fw-semibold text-decoration-none"
                                        onClick={() => handleSwitch('register')}
                                        disabled={loading}
                                    >
                                        Create an Account
                                    </button>
                                </p>
                            )}
                        </div>

                        <p className="text-center text-muted small mt-3 mb-0">
                            Your account allows you to manage your reservations
                            and view your booking history.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthModal;
