
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const fallbackImages = [
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85',
];

function getFacilities(room) {
    if (Array.isArray(room.facilities)) return room.facilities;

    if (typeof room.facilities === 'string') {
        try {
            const parsed = JSON.parse(room.facilities);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return room.facilities.split(',').map(item => item.trim()).filter(Boolean);
        }
    }

    return [];
}

function getImageUrl(image) {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return `http://127.0.0.1:8000/storage/${image}`;
}

function Rooms({ onBookNow }) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [selectedFacility, setSelectedFacility] = useState('');

    const [gallery, setGallery] = useState(null);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await api.get('/rooms');
                const data = Array.isArray(response.data)
                    ? response.data
                    : response.data.rooms || response.data.data || [];

                setRooms(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Unable to load rooms.');
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const roomTypes = useMemo(
        () => [...new Set(rooms.map(room => room.room_type).filter(Boolean))].sort(),
        [rooms]
    );

    const allFacilities = useMemo(
        () => [...new Set(rooms.flatMap(room => getFacilities(room)))].sort(),
        [rooms]
    );

    const filteredRooms = useMemo(() => {
        return rooms.filter(room => {
            const search = searchTerm.trim().toLowerCase();
            const price = Number(room.price_per_night);

            const matchesSearch =
                !search ||
                (room.name || '').toLowerCase().includes(search) ||
                (room.description || '').toLowerCase().includes(search);

            const matchesType = !selectedType || room.room_type === selectedType;

            let matchesPrice = true;
            if (priceRange === 'under-15000') matchesPrice = price < 15000;
            if (priceRange === '15000-25000') matchesPrice = price >= 15000 && price <= 25000;
            if (priceRange === 'over-25000') matchesPrice = price > 25000;

            const facilities = getFacilities(room).map(item =>
                String(item).toLowerCase()
            );

            const matchesFacility =
                !selectedFacility ||
                facilities.includes(selectedFacility.toLowerCase());

            return matchesSearch && matchesType && matchesPrice && matchesFacility;
        });
    }, [rooms, searchTerm, selectedType, priceRange, selectedFacility]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedType('');
        setPriceRange('');
        setSelectedFacility('');
    };

    const openGallery = (room, index = 0) => {
        const mainImage = getImageUrl(room.image);
        const additionalImages = Array.isArray(room.gallery_images)
            ? room.gallery_images.map(getImageUrl)
            : [];

        const images = [...new Set(
            [mainImage, ...additionalImages].filter(Boolean)
        )];

        const finalImages = images.length
            ? images
            : [fallbackImages[rooms.findIndex(item => item.id === room.id) % fallbackImages.length]];

        setGallery({
            name: room.name,
            images: finalImages,
        });

        setActiveImage(index < finalImages.length ? index : 0);
    };

    const changeImage = (direction) => {
        if (!gallery) return;

        setActiveImage(current =>
            (current + direction + gallery.images.length) % gallery.images.length
        );
    };

    if (loading) {
        return (
            <div className="container text-center py-5">
                <div className="spinner-border text-primary" />
                <p className="mt-3">Loading available rooms...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="text-center mb-4">
                <span className="text-uppercase text-secondary fw-semibold small">
                    Coastal Haven Accommodation
                </span>
                <h1 className="fw-bold mt-2">Explore Our Rooms</h1>
                <p className="text-muted">
                    Find your perfect place to relax by the coast.
                </p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {rooms.length > 0 && (
                <>
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-3">
                            <div className="row g-2 align-items-center">
                                <div className="col-lg-4">
                                    <input
                                        type="search"
                                        className="form-control"
                                        placeholder="Search rooms..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="col-6 col-lg-2">
                                    <select
                                        className="form-select"
                                        value={selectedType}
                                        onChange={e => setSelectedType(e.target.value)}
                                    >
                                        <option value="">All room types</option>
                                        {roomTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-6 col-lg-2">
                                    <select
                                        className="form-select"
                                        value={priceRange}
                                        onChange={e => setPriceRange(e.target.value)}
                                    >
                                        <option value="">Any price</option>
                                        <option value="under-15000">Under LKR 15,000</option>
                                        <option value="15000-25000">LKR 15,000–25,000</option>
                                        <option value="over-25000">Above LKR 25,000</option>
                                    </select>
                                </div>

                                <div className="col-8 col-lg-3">
                                    <select
                                        className="form-select"
                                        value={selectedFacility}
                                        onChange={e => setSelectedFacility(e.target.value)}
                                    >
                                        <option value="">Any facility</option>
                                        {allFacilities.map(facility => (
                                            <option key={facility} value={facility}>
                                                {facility}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-4 col-lg-1">
                                    <button
                                        className="btn btn-outline-secondary w-100"
                                        onClick={clearFilters}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-muted mb-3">
                        Showing <strong>{filteredRooms.length}</strong> of{' '}
                        <strong>{rooms.length}</strong> rooms
                    </p>

                    {filteredRooms.length === 0 ? (
                        <div className="alert alert-light border text-center py-4">
                            <h5>No matching rooms found</h5>
                            <p className="text-muted">Try changing your search or filters.</p>
                            <button className="btn btn-outline-primary" onClick={clearFilters}>
                                Show all rooms
                            </button>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {filteredRooms.map(room => {
                                const originalIndex = rooms.findIndex(
                                    item => item.id === room.id
                                );

                                const mainImage = getImageUrl(room.image) ||
                                    fallbackImages[originalIndex % fallbackImages.length];

                                const additionalImages = Array.isArray(room.gallery_images)
                                    ? room.gallery_images.map(getImageUrl).filter(Boolean)
                                    : [];

                                return (
                                    <div className="col-md-6 col-lg-4" key={room.id}>
                                        <div className="card h-100 border-0 shadow-sm">
                                            <div className="position-relative">
                                                <img
                                                    src={mainImage}
                                                    onError={e => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src =
                                                            fallbackImages[originalIndex % fallbackImages.length];
                                                    }}
                                                    alt={room.name}
                                                    className="card-img-top"
                                                    style={{
                                                        height: '230px',
                                                        objectFit: 'cover',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => openGallery(room)}
                                                />

                                                <button
                                                    className="btn btn-light btn-sm position-absolute bottom-0 end-0 m-3 shadow"
                                                    onClick={() => openGallery(room)}
                                                >
                                                    <i className="bi bi-images me-1"></i>
                                                    View photos ({1 + additionalImages.length})
                                                </button>
                                            </div>

                                            <div className="card-body d-flex flex-column">
                                                <div className="d-flex justify-content-between align-items-start gap-2">
                                                    <h5 className="fw-bold">{room.name}</h5>
                                                    <span className="badge bg-light text-dark">
                                                        {room.room_type}
                                                    </span>
                                                </div>

                                                <p className="text-muted small">
                                                    {room.description}
                                                </p>

                                                <p className="small mb-2">
                                                    <strong>Guests:</strong> {room.capacity}
                                                </p>

                                                <div className="d-flex flex-wrap gap-1 mb-3">
                                                    {getFacilities(room).slice(0, 4).map(facility => (
                                                        <span
                                                            className="badge bg-light text-secondary border"
                                                            key={facility}
                                                        >
                                                            {facility}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="mt-auto">
                                                    <h5 className="text-primary fw-bold">
                                                        LKR {Number(room.price_per_night).toLocaleString('en-LK')}
                                                        <small className="text-muted fw-normal"> / night</small>
                                                    </h5>

                                                    <button
                                                        className="btn btn-primary w-100 mt-2"
                                                        onClick={() => onBookNow(room.id)}
                                                        disabled={room.status !== 'available'}
                                                    >
                                                        {room.status === 'available'
                                                            ? 'Book Now'
                                                            : 'Unavailable'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {!error && rooms.length === 0 && (
                <div className="alert alert-info text-center">
                    No rooms are currently available.
                </div>
            )}

            <div className="text-center mt-5">
                <Link to="/" className="btn btn-outline-secondary">
                    Back to Home
                </Link>
            </div>

            {gallery && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{ background: 'rgba(0,0,0,0.85)' }}
                    onClick={() => setGallery(null)}
                >
                    <div
                        className="modal-dialog modal-xl modal-dialog-centered"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-content bg-dark text-white border-0">
                            <div className="modal-header border-secondary">
                                <h5 className="modal-title">{gallery.name}</h5>
                                <button
                                    className="btn-close btn-close-white"
                                    onClick={() => setGallery(null)}
                                />
                            </div>

                            <div className="modal-body text-center">
                                <div className="position-relative">
                                    <img
                                        src={gallery.images[activeImage]}
                                        alt={gallery.name}
                                        className="img-fluid rounded"
                                        style={{
                                            maxHeight: '65vh',
                                            width: '100%',
                                            objectFit: 'contain'
                                        }}
                                    />

                                    {gallery.images.length > 1 && (
                                        <>
                                            <button
                                                className="btn btn-light position-absolute top-50 start-0 translate-middle-y"
                                                onClick={() => changeImage(-1)}
                                            >
                                                &#10094;
                                            </button>
                                            <button
                                                className="btn btn-light position-absolute top-50 end-0 translate-middle-y"
                                                onClick={() => changeImage(1)}
                                            >
                                                &#10095;
                                            </button>
                                        </>
                                    )}
                                </div>

                                <p className="mt-3 mb-0">
                                    Image {activeImage + 1} of {gallery.images.length}
                                </p>

                                <div className="d-flex justify-content-center flex-wrap gap-2 mt-3">
                                    {gallery.images.map((image, index) => (
                                        <img
                                            key={image}
                                            src={image}
                                            alt={`Gallery ${index + 1}`}
                                            onClick={() => setActiveImage(index)}
                                            style={{
                                                width: '75px',
                                                height: '55px',
                                                objectFit: 'cover',
                                                cursor: 'pointer',
                                                border: activeImage === index
                                                    ? '3px solid white'
                                                    : '2px solid transparent',
                                                borderRadius: '5px'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Rooms;
