import { useEffect, useState } from 'react';
import api from '../services/api';
import './AdminDashboard.css';

const emptyForm = {
    name: '',
    description: '',
    room_type: '',
    facilities: '',
    price_per_night: '',
    capacity: '',
    status: 'available',
    image: null,
};

function AdminDashboard() {
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [form, setForm] = useState(emptyForm);

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');

    const [dashboardError, setDashboardError] = useState('');
    const [formFeedback, setFormFeedback] = useState(null);
    const [roomFeedback, setRoomFeedback] = useState({});
    const [bookingFeedback, setBookingFeedback] = useState({});

    const [processingBooking, setProcessingBooking] = useState(null);
    const [processingRoom, setProcessingRoom] = useState(null);

    const loadDashboard = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);

            setDashboardError('');

            const [roomResponse, bookingResponse] = await Promise.all([
                api.get('/rooms'),
                api.get('/admin/bookings'),
            ]);

            setRooms(roomResponse.data);
            setBookings(bookingResponse.data);
        } catch (err) {
            setDashboardError(
                err.response?.data?.message ||
                'Unable to load dashboard information. Please try again.'
            );
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: name === 'image' ? files[0] : value,
        }));
    };

    const resetForm = () => {
        setForm({ ...emptyForm });
        setEditingId(null);

        const fileInput = document.getElementById('admin-room-image');

        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setFormFeedback(null);

            const formData = new FormData();

            formData.append('name', form.name.trim());
            formData.append('description', form.description.trim());
            formData.append('room_type', form.room_type.trim());
            formData.append('price_per_night', form.price_per_night);
            formData.append('capacity', form.capacity);
            formData.append('status', form.status);

            const facilities = form.facilities
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);

            facilities.forEach((facility, index) => {
                formData.append(`facilities[${index}]`, facility);
            });

            if (form.image) {
                formData.append('image', form.image);
            }

            if (editingId) {
                formData.append('_method', 'PUT');

                await api.post(`/admin/rooms/${editingId}`, formData);

                setFormFeedback({
                    type: 'success',
                    message: 'Room updated successfully.',
                });
            } else {
                await api.post('/admin/rooms', formData);

                setFormFeedback({
                    type: 'success',
                    message: 'Room added successfully.',
                });
            }

            resetForm();
            await loadDashboard(false);
        } catch (err) {
            const errors = err.response?.data?.errors;

            setFormFeedback({
                type: 'error',
                message: errors
                    ? Object.values(errors).flat().join(' ')
                    : err.response?.data?.message ||
                      'Unable to save the room.',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (room) => {
        setEditingId(room.id);

        setForm({
            name: room.name || '',
            description: room.description || '',
            room_type: room.room_type || '',
            facilities: Array.isArray(room.facilities)
                ? room.facilities.join(', ')
                : '',
            price_per_night: room.price_per_night || '',
            capacity: room.capacity || '',
            status: room.status || 'available',
            image: null,
        });

        setFormFeedback(null);
        setActiveSection('rooms');

        document.getElementById('room-form')?.scrollIntoView({
            behavior: 'smooth',
        });
    };

    const handleDelete = async (roomId) => {
        if (!window.confirm(
            'Are you sure you want to delete this room?'
        )) {
            return;
        }

        try {
            setProcessingRoom(roomId);

            setRoomFeedback((previous) => ({
                ...previous,
                [roomId]: null,
            }));

            await api.delete(`/admin/rooms/${roomId}`);

            setRoomFeedback((previous) => ({
                ...previous,
                [roomId]: {
                    type: 'success',
                    message: 'Room deleted successfully.',
                },
            }));

            await loadDashboard(false);
        } catch (err) {
            setRoomFeedback((previous) => ({
                ...previous,
                [roomId]: {
                    type: 'error',
                    message: err.response?.data?.message ||
                        'Unable to delete this room.',
                },
            }));
        } finally {
            setProcessingRoom(null);
        }
    };

    const handleBookingStatus = async (bookingId, status) => {
        const action = status === 'confirmed' ? 'confirm' : 'cancel';

        if (!window.confirm(
            `Are you sure you want to ${action} this booking?`
        )) {
            return;
        }

        try {
            setProcessingBooking(bookingId);

            setBookingFeedback((previous) => ({
                ...previous,
                [bookingId]: null,
            }));

            const response = await api.patch(
                `/admin/bookings/${bookingId}/status`,
                { status }
            );

            setBookingFeedback((previous) => ({
                ...previous,
                [bookingId]: {
                    type: 'success',
                    message: response.data.message ||
                        'Booking status updated successfully.',
                },
            }));

            await loadDashboard(false);
        } catch (err) {
            const errors = err.response?.data?.errors;

            setBookingFeedback((previous) => ({
                ...previous,
                [bookingId]: {
                    type: 'error',
                    message: errors
                        ? Object.values(errors).flat().join(' ')
                        : err.response?.data?.message ||
                          'Unable to update this booking.',
                },
            }));
        } finally {
            setProcessingBooking(null);
        }
    };

    const pendingBookings = bookings.filter(
        (booking) => booking.status === 'pending'
    ).length;

    const confirmedBookings = bookings.filter(
        (booking) => booking.status === 'confirmed'
    ).length;

    const cancelledBookings = bookings.filter(
        (booking) => booking.status === 'cancelled'
    ).length;

    const uniqueCustomers = new Set(
        bookings.map((booking) => booking.user?.id).filter(Boolean)
    ).size;

    const formatPrice = (price) =>
        Number(price || 0).toLocaleString('en-LK');

    const formatDate = (date) =>
        date ? String(date).slice(0, 10) : 'Not available';

    const getImageUrl = (image) => {
        if (!image) return '';

        if (image.startsWith('http')) return image;

        return `http://127.0.0.1:8000/storage/${image}`;
    };

    const navigateTo = (section) => {
        setActiveSection(section);

        document.getElementById(section)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner-border text-primary" />
                <p>Loading Coastal Haven Admin...</p>
            </div>
        );
    }

    return (
        <div className="admin-layout">

            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <div className="admin-brand-icon">CH</div>
                    <div>
                        <h4>COASTAL HAVEN</h4>
                        <span>ADMINISTRATION</span>
                    </div>
                </div>

                <div className="admin-sidebar-label">
                    MAIN MENU
                </div>

                <nav className="admin-navigation">
                    <button
                        className={activeSection === 'overview' ? 'active' : ''}
                        onClick={() => navigateTo('overview')}
                    >
                        <span>▦</span> Dashboard
                    </button>

                    <button
                        className={activeSection === 'rooms' ? 'active' : ''}
                        onClick={() => navigateTo('rooms')}
                    >
                        <span>▣</span> Manage Rooms
                    </button>

                    <button
                        className={activeSection === 'bookings' ? 'active' : ''}
                        onClick={() => navigateTo('bookings')}
                    >
                        <span>▤</span> Manage Bookings
                    </button>
                </nav>

                <div className="admin-sidebar-bottom">
                    <div className="admin-sidebar-note">
                        <strong>Coastal Haven</strong>
                        <p>Room and reservation management system.</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">

                <header className="admin-topbar">
                    <div>
                        <span>ADMINISTRATION / OVERVIEW</span>
                        <h2>Admin Dashboard</h2>
                    </div>

                    <div className="admin-topbar-right">
                        <span className="admin-online-dot"></span>
                        Administrator
                    </div>
                </header>

                {dashboardError && (
                    <div className="admin-alert admin-alert-error">
                        {dashboardError}
                    </div>
                )}

                {/* Overview */}
                <section id="overview" className="admin-section">
                    <div className="admin-section-heading">
                        <div>
                            <span className="admin-eyebrow">OVERVIEW</span>
                            <h3>Dashboard Overview</h3>
                            <p>Monitor your rooms and customer reservations.</p>
                        </div>

                        <button
                            className="admin-refresh-button"
                            onClick={() => loadDashboard(false)}
                        >
                            ↻ Refresh
                        </button>
                    </div>

                    <div className="admin-stats-grid">
                        <div className="admin-stat-card">
                            <div className="admin-stat-icon rooms-icon">▣</div>
                            <div>
                                <span>Total Rooms</span>
                                <h2>{rooms.length}</h2>
                            </div>
                        </div>

                        <div className="admin-stat-card">
                            <div className="admin-stat-icon bookings-icon">▤</div>
                            <div>
                                <span>Total Bookings</span>
                                <h2>{bookings.length}</h2>
                            </div>
                        </div>

                        <div className="admin-stat-card">
                            <div className="admin-stat-icon pending-icon">◷</div>
                            <div>
                                <span>Pending Bookings</span>
                                <h2>{pendingBookings}</h2>
                            </div>
                        </div>

                        <div className="admin-stat-card">
                            <div className="admin-stat-icon confirmed-icon">✓</div>
                            <div>
                                <span>Confirmed Bookings</span>
                                <h2>{confirmedBookings}</h2>
                            </div>
                        </div>
                    </div>

                    <div className="admin-secondary-stats">
                        <div>
                            <span>Cancelled Bookings</span>
                            <strong>{cancelledBookings}</strong>
                        </div>

                        <div>
                            <span>Registered Customers</span>
                            <strong>{uniqueCustomers}</strong>
                        </div>

                        <div>
                            <span>Available Rooms</span>
                            <strong>
                                {rooms.filter(
                                    (room) => room.status === 'available'
                                ).length}
                            </strong>
                        </div>
                    </div>
                </section>

                {/* Room Management */}
                <section id="rooms" className="admin-section">
                    <div className="admin-section-heading">
                        <div>
                            <span className="admin-eyebrow">ROOM MANAGEMENT</span>
                            <h3>Manage Rooms</h3>
                            <p>Add new rooms or update existing room information.</p>
                        </div>
                    </div>

                    <div id="room-form" className="admin-panel">
                        <div className="admin-panel-heading">
                            <div>
                                <h4>{editingId ? 'Edit Room' : 'Add New Room'}</h4>
                                <p>
                                    {editingId
                                        ? 'Update the selected room details.'
                                        : 'Enter the details of your new room.'}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="admin-form-grid">

                                <div className="admin-field">
                                    <label>Room Name</label>
                                    <input
                                        className="form-control"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="admin-field">
                                    <label>Room Type</label>
                                    <input
                                        className="form-control"
                                        name="room_type"
                                        value={form.room_type}
                                        onChange={handleChange}
                                        placeholder="e.g. Deluxe Room"
                                        required
                                    />
                                </div>

                                <div className="admin-field admin-field-full">
                                    <label>Description</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        rows="3"
                                        value={form.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="admin-field admin-field-full">
                                    <label>Facilities</label>
                                    <input
                                        className="form-control"
                                        name="facilities"
                                        value={form.facilities}
                                        onChange={handleChange}
                                        placeholder="Wi-Fi, Air Conditioning, Balcony"
                                    />
                                    <small>Separate facilities with commas.</small>
                                </div>

                                <div className="admin-field">
                                    <label>Price per Night (LKR)</label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        className="form-control"
                                        name="price_per_night"
                                        value={form.price_per_night}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="admin-field">
                                    <label>Maximum Guests</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-control"
                                        name="capacity"
                                        value={form.capacity}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="admin-field">
                                    <label>Room Status</label>
                                    <select
                                        className="form-select"
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                    >
                                        <option value="available">Available</option>
                                        <option value="unavailable">Unavailable</option>
                                    </select>
                                </div>

                                <div className="admin-field">
                                    <label>Room Image</label>
                                    <input
                                        id="admin-room-image"
                                        type="file"
                                        className="form-control"
                                        name="image"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleChange}
                                    />
                                    <small>JPG, PNG or WEBP. Optional when editing.</small>
                                </div>
                            </div>

                            {formFeedback && (
                                <div className={`admin-alert ${
                                    formFeedback.type === 'success'
                                        ? 'admin-alert-success'
                                        : 'admin-alert-error'
                                }`}>
                                    {formFeedback.message}
                                </div>
                            )}

                            <div className="admin-form-actions">
                                <button
                                    type="submit"
                                    className="admin-primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? 'Saving...'
                                        : editingId
                                            ? 'Update Room'
                                            : '+ Add Room'}
                                </button>

                                {editingId && (
                                    <button
                                        type="button"
                                        className="admin-secondary-button"
                                        onClick={resetForm}
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="admin-room-grid">
                        {rooms.map((room) => (
                            <article className="admin-room-card" key={room.id}>
                                {room.image ? (
                                    <img
                                        src={getImageUrl(room.image)}
                                        alt={room.name}
                                        className="admin-room-image"
                                    />
                                ) : (
                                    <div className="admin-room-placeholder">
                                        No room image
                                    </div>
                                )}

                                <div className="admin-room-content">
                                    <div className="admin-room-title-row">
                                        <h4>{room.name}</h4>

                                        <span className={`admin-status ${
                                            room.status === 'available'
                                                ? 'status-available'
                                                : 'status-unavailable'
                                        }`}>
                                            {room.status}
                                        </span>
                                    </div>

                                    <p className="admin-room-type">
                                        {room.room_type}
                                    </p>

                                    <p className="admin-room-description">
                                        {room.description}
                                    </p>

                                    <div className="admin-room-details">
                                        <strong>
                                            LKR {formatPrice(room.price_per_night)}
                                        </strong>
                                        <span>{room.capacity} guests</span>
                                    </div>

                                    {Array.isArray(room.facilities) &&
                                        room.facilities.length > 0 && (
                                            <div className="admin-facilities">
                                                {room.facilities.map((facility, index) => (
                                                    <span key={index}>{facility}</span>
                                                ))}
                                            </div>
                                        )}

                                    <div className="admin-room-actions">
                                        <button
                                            className="admin-edit-button"
                                            onClick={() => handleEdit(room)}
                                        >
                                            Edit Room
                                        </button>

                                        <button
                                            className="admin-delete-button"
                                            onClick={() => handleDelete(room.id)}
                                            disabled={processingRoom === room.id}
                                        >
                                            {processingRoom === room.id
                                                ? 'Deleting...'
                                                : 'Delete'}
                                        </button>
                                    </div>

                                    {roomFeedback[room.id] && (
                                        <div className={`admin-inline-feedback ${
                                            roomFeedback[room.id].type === 'success'
                                                ? 'feedback-success'
                                                : 'feedback-error'
                                        }`}>
                                            {roomFeedback[room.id].message}
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}

                        {rooms.length === 0 && (
                            <p className="admin-empty-state">
                                No rooms have been added yet.
                            </p>
                        )}
                    </div>
                </section>

                {/* Booking Management */}
                <section id="bookings" className="admin-section">
                    <div className="admin-section-heading">
                        <div>
                            <span className="admin-eyebrow">RESERVATIONS</span>
                            <h3>Manage Bookings</h3>
                            <p>Review, confirm or cancel customer reservations.</p>
                        </div>
                    </div>

                    <div className="admin-booking-list">
                        {bookings.map((booking) => (
                            <article
                                className="admin-booking-card"
                                key={booking.id}
                            >
                                <div className="admin-booking-main">
                                    <div className="admin-booking-guest">
                                        <div className="admin-avatar">
                                            {(booking.guest_name ||
                                                booking.user?.name ||
                                                'G').charAt(0).toUpperCase()}
                                        </div>

                                        <div>
                                            <h4>
                                                {booking.guest_name ||
                                                    booking.user?.name ||
                                                    'Guest'}
                                            </h4>

                                            <span>
                                                {booking.guest_email ||
                                                    booking.user?.email ||
                                                    'No email'}
                                            </span>
                                        </div>
                                    </div>

                                    <span className={`admin-status booking-status-${
                                        booking.status
                                    }`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="admin-booking-details">
                                    <div>
                                        <span>ROOM</span>
                                        <strong>
                                            {booking.room?.name || 'Room unavailable'}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>CHECK-IN</span>
                                        <strong>{formatDate(booking.check_in)}</strong>
                                    </div>

                                    <div>
                                        <span>CHECK-OUT</span>
                                        <strong>{formatDate(booking.check_out)}</strong>
                                    </div>

                                    <div>
                                        <span>GUESTS</span>
                                        <strong>{booking.guests}</strong>
                                    </div>

                                    <div>
                                        <span>CONTACT</span>
                                        <strong>
                                            {booking.guest_contact_number ||
                                                booking.user?.contact_number ||
                                                'Not provided'}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>TOTAL PRICE</span>
                                        <strong>
                                            LKR {formatPrice(booking.total_price)}
                                        </strong>
                                    </div>
                                </div>

                                <div className="admin-booking-actions">
                                    {booking.status === 'pending' ? (
                                        <>
                                            <button
                                                className="admin-confirm-button"
                                                onClick={() => handleBookingStatus(
                                                    booking.id,
                                                    'confirmed'
                                                )}
                                                disabled={
                                                    processingBooking === booking.id
                                                }
                                            >
                                                {processingBooking === booking.id
                                                    ? 'Processing...'
                                                    : '✓ Confirm Booking'}
                                            </button>

                                            <button
                                                className="admin-cancel-button"
                                                onClick={() => handleBookingStatus(
                                                    booking.id,
                                                    'cancelled'
                                                )}
                                                disabled={
                                                    processingBooking === booking.id
                                                }
                                            >
                                                Cancel Booking
                                            </button>
                                        </>
                                    ) : booking.status === 'confirmed' ? (
                                        <button
                                            className="admin-cancel-button"
                                            onClick={() => handleBookingStatus(
                                                booking.id,
                                                'cancelled'
                                            )}
                                            disabled={
                                                processingBooking === booking.id
                                            }
                                        >
                                            Cancel Booking
                                        </button>
                                    ) : (
                                        <span className="admin-no-action">
                                            This booking has been cancelled.
                                        </span>
                                    )}
                                </div>

                                {bookingFeedback[booking.id] && (
                                    <div className={`admin-inline-feedback ${
                                        bookingFeedback[booking.id].type === 'success'
                                            ? 'feedback-success'
                                            : 'feedback-error'
                                    }`}>
                                        {bookingFeedback[booking.id].message}
                                    </div>
                                )}
                            </article>
                        ))}

                        {bookings.length === 0 && (
                            <div className="admin-empty-state">
                                No bookings have been received yet.
                            </div>
                        )}
                    </div>
                </section>

                <footer className="admin-footer">
                    Coastal Haven Admin Panel · Room and Booking Management
                </footer>
            </main>
        </div>
    );
}

export default AdminDashboard;
