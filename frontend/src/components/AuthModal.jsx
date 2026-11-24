
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isRegister && formData.password !== formData.password_confirmation) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(
                isRegister ? '/register' : '/login',
                isRegister
                    ? formData
                    : {
                        email: formData.email,
                        password: formData.password,
                    }
            );

            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            onSuccess(response.data.user);
            onClose();
        } catch (err) {
            const validationErrors = err.response?.data?.errors;

            if (validationErrors) {
                setError(Object.values(validationErrors).flat().join(' '));
            } else {
                setError(
                    err.response?.data?.message ||
                    'Something went wrong. Please try again.'
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
            style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow">

                    <div className="modal-header">
                        <h5 className="modal-title">
                            {isRegister ? 'Create Your Account' : 'Welcome Back'}
                        </h5>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        />
                    </div>

                    <div className="modal-body p-4">

                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>

                            {isRegister && (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Full Name
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            maxLength={255}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Contact Number
                                        </label>

                                        <input
                                            type="tel"
                                            name="contact_number"
                                            className="form-control"
                                            value={formData.contact_number}
                                            onChange={handleChange}
                                            required
                                            maxLength={30}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="mb-3">
                                <label className="form-label">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    value={formData.password}
                                    onChange={handleChange}
                                    minLength={8}
                                    required
                                />
                            </div>

                            {isRegister && (
                                <div className="mb-3">
                                    <label className="form-label">
                                        Confirm Password
                                    </label>

                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        className="form-control"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        minLength={8}
                                        required
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={loading}
                            >
                                {loading
                                    ? 'Please wait...'
                                    : isRegister
                                        ? 'Register'
                                        : 'Login'}
                            </button>
                        </form>

                        <div className="text-center mt-3">
                            {isRegister ? (
                                <>
                                    Already have an account?{' '}
                                    <button
                                        className="btn btn-link p-0"
                                        onClick={() => onSwitch('login')}
                                    >
                                        Login
                                    </button>
                                </>
                            ) : (
                                <>
                                    Don't have an account?{' '}
                                    <button
                                        className="btn btn-link p-0"
                                        onClick={() => onSwitch('register')}
                                    >
                                        Register
                                    </button>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthModal;
