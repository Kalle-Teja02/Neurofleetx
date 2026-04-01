import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const TIME_SLOTS = [
  { time: '8:00 AM',  price: 150 },
  { time: '10:00 AM', price: 200 },
  { time: '12:00 PM', price: 250 },
  { time: '2:00 PM',  price: 300 },
  { time: '4:00 PM',  price: 280 },
  { time: '6:00 PM',  price: 220 },
  { time: '8:00 PM',  price: 180 },
];

const STEPS = ['Date', 'Time Slot', 'Summary', 'OTP'];

function StepBar({ step }) {
  return (
    <div className="bf-stepbar">
      {STEPS.map((label, i) => (
        <div key={label} className={`bf-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
          <div className="bf-step-dot">{i < step ? '✓' : i + 1}</div>
          <span>{label}</span>
          {i < STEPS.length - 1 && <div className="bf-step-line" />}
        </div>
      ))}
    </div>
  );
}

export default function BookingModal({ vehicle, onClose }) {
  const [step, setStep]         = useState(0);
  const [date, setDate]         = useState(null);
  const [slot, setSlot]         = useState(null);
  const [otp, setOtp]           = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const totalPrice = slot ? vehicle.pricePerHour + slot.price : 0;

  const handleConfirmBooking = () => {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(code);
    console.log(`🔐 Your OTP: ${code}`);
    alert(`Your OTP is: ${code}\n(In production this would be sent via SMS)`);
    setStep(3);
  };

  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
      // Save booking to localStorage
      const booking = {
        id: `BK${Date.now()}`,
        vehicle: vehicle.name,
        type: vehicle.type,
        isEV: vehicle.isEV,
        date: date?.toDateString(),
        timeSlot: slot?.time,
        total: totalPrice,
        status: 'Confirmed',
        bookedAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('myBookings') || '[]');
      localStorage.setItem('myBookings', JSON.stringify([booking, ...existing]));
      setConfirmed(true);
    } else {
      setOtpError('Incorrect OTP. Please try again.');
    }
  };

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal bf-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bm-header">
          <div>
            <p className="bm-subtitle">Booking for</p>
            <h2 className="bm-title">{vehicle.name}</h2>
          </div>
          <button className="bm-close" onClick={onClose}>✕</button>
        </div>

        {confirmed ? (
          /* ── Success ── */
          <div className="bm-success">
            <div className="bm-success-icon">🎉</div>
            <h3>Booking Confirmed!</h3>
            <p>Your <strong>{vehicle.name}</strong> is booked for</p>
            <p><strong>{date?.toDateString()}</strong> at <strong>{slot?.time}</strong></p>
            <p className="bm-total-confirm">Total Paid: ₹{totalPrice}</p>
            <button className="bm-submit-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <StepBar step={step} />

            <div className="bf-body">

              {/* Step 0 — Calendar */}
              {step === 0 && (
                <div className="bf-step-content">
                  <h4 className="bf-step-title">Select a Date</h4>
                  <div className="bf-calendar-wrap">
                    <Calendar
                      onChange={setDate}
                      value={date}
                      minDate={new Date()}
                      className="bf-calendar"
                    />
                  </div>
                  <button
                    className="bm-submit-btn"
                    disabled={!date}
                    onClick={() => setStep(1)}
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* Step 1 — Time Slots */}
              {step === 1 && (
                <div className="bf-step-content">
                  <h4 className="bf-step-title">
                    Select a Time Slot
                    <span className="bf-date-chip">{date?.toDateString()}</span>
                  </h4>
                  <div className="bf-slots-grid">
                    {TIME_SLOTS.map(s => (
                      <button
                        key={s.time}
                        className={`bf-slot-btn ${slot?.time === s.time ? 'selected' : ''}`}
                        onClick={() => setSlot(s)}
                      >
                        <span className="bf-slot-time">{s.time}</span>
                        <span className="bf-slot-price">+₹{s.price}</span>
                      </button>
                    ))}
                  </div>
                  <div className="bf-nav-row">
                    <button className="bf-back-btn" onClick={() => setStep(0)}>← Back</button>
                    <button className="bm-submit-btn" disabled={!slot} onClick={() => setStep(2)}>
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 — Summary */}
              {step === 2 && (
                <div className="bf-step-content">
                  <h4 className="bf-step-title">Trip Summary</h4>
                  <div className="bf-summary">
                    <div className="bf-summary-row">
                      <span>Vehicle</span><strong>{vehicle.name}</strong>
                    </div>
                    <div className="bf-summary-row">
                      <span>Type</span><strong>{vehicle.type}</strong>
                    </div>
                    <div className="bf-summary-row">
                      <span>Fuel</span>
                      <strong>{vehicle.isEV ? '⚡ EV' : '⛽ Non-EV'}</strong>
                    </div>
                    <div className="bf-summary-row">
                      <span>Date</span><strong>{date?.toDateString()}</strong>
                    </div>
                    <div className="bf-summary-row">
                      <span>Time Slot</span><strong>{slot?.time}</strong>
                    </div>
                    <div className="bf-summary-row">
                      <span>Base Rate</span><strong>₹{vehicle.pricePerHour}/hr</strong>
                    </div>
                    <div className="bf-summary-row">
                      <span>Slot Charge</span><strong>₹{slot?.price}</strong>
                    </div>
                    <div className="bf-summary-row total">
                      <span>Total</span><strong>₹{totalPrice}</strong>
                    </div>
                  </div>
                  <div className="bf-nav-row">
                    <button className="bf-back-btn" onClick={() => setStep(1)}>← Back</button>
                    <button className="bm-submit-btn" onClick={handleConfirmBooking}>
                      Confirm Booking
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 — OTP */}
              {step === 3 && (
                <div className="bf-step-content">
                  <h4 className="bf-step-title">OTP Verification</h4>
                  <p className="bf-otp-hint">
                    A 4-digit OTP has been sent to your registered number.
                  </p>
                  <div className="bf-otp-wrap">
                    <input
                      className="bf-otp-input"
                      type="text"
                      maxLength={4}
                      placeholder="Enter 4-digit OTP"
                      value={otp}
                      onChange={e => { setOtp(e.target.value); setOtpError(''); }}
                    />
                    {otpError && <p className="bf-otp-error">{otpError}</p>}
                  </div>
                  <div className="bf-nav-row">
                    <button className="bf-back-btn" onClick={() => setStep(2)}>← Back</button>
                    <button
                      className="bm-submit-btn"
                      disabled={otp.length !== 4}
                      onClick={handleVerifyOtp}
                    >
                      Verify & Confirm
                    </button>
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}
