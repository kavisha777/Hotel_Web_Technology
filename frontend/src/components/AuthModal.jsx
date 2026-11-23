
import { useState } from 'react';
import api from '../services/api';

function AuthModal({ type, onClose, onSuccess, onSwitch }) {
    const isRegister = type === 'register';

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post(
                isRegister ? '/register' : '/login',
                isRegister
                    ? form
                    : { email: form.email, password: form.password }
            );

            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            onSuccess(response.data.user);
            onClose();
        } catch (err) {
            const errors = err.response?.data?.errors;

            setError(
                errors
                    ? Object.values(errors).flat().join(' ')
                    : err.response?.data?.message || 'Something went wrong.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content border-0 shadow">
                    <div className="modal-header">
                        <div>
                            <h4 className="modal-title">
                                {isRegister ? 'Create Account' : 'Welcome Back'}
                            </h4>
                            <small className="text-muted">
                                {isRegister
                                    ? 'Join Coastal Haven'
                                    : 'Login to your account'}
                            </small>
                        </div>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        />
                    </div>

                    <div className="modal-body p-4">
                        {error && (
                            <div className="alert alert-danger">{error}</div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {isRegister && (
                                <div className="mb-3">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    value={form.password}
                                    onChange={handleChange}
                                    minLength="8"
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
                                        value={form.password_confirmation}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-dark w-100 py-2"
                                disabled={loading}
                            >
                                {loading
                                    ? 'Please wait...'
                                    : isRegister
                                        ? 'Create Account'
                                        : 'Login'}
                            </button>
                        </form>

                        <p className="text-center mt-4 mb-0">
                            {isRegister
                                ? 'Already have an account?'
                                : "Don't have an account?"}{' '}
                            <button
                                type="button"
                                className="btn btn-link p-0"
                                onClick={onSwitch}
                            >
                                {isRegister ? 'Login' : 'Register'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthModal;
