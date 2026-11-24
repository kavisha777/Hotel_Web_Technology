
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Booking Received</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #123c4a;">Coastal Haven</h2>

    <h3>Thank you for your booking request!</h3>

    <p>Dear {{ $booking->guest_name }},</p>

    <p>We have received your reservation request. Our team will review it shortly.</p>

    <h3>Booking Details</h3>

    <p><strong>Room:</strong> {{ $booking->room->name }}</p>
    <p><strong>Check-in:</strong> {{ $booking->check_in->format('d M Y') }}</p>
    <p><strong>Check-out:</strong> {{ $booking->check_out->format('d M Y') }}</p>
    <p><strong>Guests:</strong> {{ $booking->guests }}</p>
    <p><strong>Total:</strong> LKR {{ number_format((float) $booking->total_price, 2) }}</p>
    <p><strong>Status:</strong> Pending confirmation</p>

    <p>We look forward to welcoming you.</p>

    <p>Regards,<br>Coastal Haven Team</p>
</body>
</html>
