import { useState } from "react";

import {
  Calendar,
  Award,
  Bell,
  ClipboardCheck,
  MapPin,
  Users,
  X,
  CreditCard,
} from "lucide-react";

import {
  SiGooglepay,
  SiPhonepe,
  SiPaytm,
} from "react-icons/si";

import StatCard from "../../components/StatCard";
import SuccessModal from "../../components/SuccessModal";
import { mockEvents as eventsData } from "../../data/mockEvents";

const images = {
  Technology:
    "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",

  Cultural:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",

  Business:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop",
};

const StudentDashboard = () => {

  const [events, setEvents] = useState(
    eventsData.map((event) => ({
      ...event,
      registeredCount: event.registeredCount || 0,
      capacity: event.capacity || 100,
      price: event.price || 299,
    }))
  );

  const [open, setOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [paymentModal, setPaymentModal] = useState(false);

  const [selectedPayment, setSelectedPayment] =
    useState("");

  // Open Payment Modal
  const openPayment = (event) => {
    setSelectedEvent(event);
    setPaymentModal(true);
  };

  // Handle Payment
  const handlePayment = () => {

    if (!selectedPayment) {
      alert("Please select payment method");
      return;
    }

    const updatedEvents = events.map((e) =>
      e.id === selectedEvent.id
        ? {
            ...e,
            registeredCount: e.registeredCount + 1,
          }
        : e
    );

    setEvents(updatedEvents);

    const updatedEvent = updatedEvents.find(
      (e) => e.id === selectedEvent.id
    );

    setSelectedEvent(updatedEvent);

    setPaymentModal(false);

    setOpen(true);
  };

  return (
    <div className="space-y-6 p-2">

      {/* Heading */}
      <div>

        <h1 className="text-3xl font-bold text-slate-800">
          Student Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Welcome back! Here's your event overview.
        </p>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="hover:scale-105 transition duration-300">
          <StatCard
            title="Registered"
            value={4}
            icon={Calendar}
            variant="primary"
          />
        </div>

        <div className="hover:scale-105 transition duration-300">
          <StatCard
            title="Attended"
            value={12}
            icon={ClipboardCheck}
          />
        </div>

        <div className="hover:scale-105 transition duration-300">
          <StatCard
            title="Certificates"
            value={8}
            icon={Award}
          />
        </div>

        <div className="hover:scale-105 transition duration-300">
          <StatCard
            title="Notifications"
            value={5}
            icon={Bell}
            variant="accent"
          />
        </div>

      </div>

      {/* Events */}
      <div>

        <h2 className="text-2xl font-semibold mb-5">
          Upcoming Events
        </h2>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {events
            .filter((e) => e.status === "upcoming")
            .slice(0, 3)
            .map((event) => (

              <div
                key={event.id}
                className="
                  bg-white rounded-3xl overflow-hidden
                  shadow-md border
                  hover:-translate-y-2 hover:shadow-2xl
                  transition-all duration-500 group
                "
              >

                {/* Image */}
                <div className="relative h-56 overflow-hidden">

                  <img
                    src={images[event.category]}
                    alt={event.title}
                    className="
                      w-full h-full object-cover
                      group-hover:scale-110
                      transition duration-700
                    "
                  />

                  <div className="absolute inset-0 bg-black/30" />

                  <span className="absolute top-4 left-4 bg-white text-black px-4 py-1 rounded-full text-xs font-semibold shadow">
                    {event.category}
                  </span>

                </div>

                {/* Content */}
                <div className="p-5 space-y-4">

                  <h3 className="font-bold text-xl group-hover:text-blue-600 transition">
                    {event.title}
                  </h3>

                  <p className="text-sm text-gray-500 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-3 text-sm text-gray-700">

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      {event.date}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      {event.location}
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600" />
                      {event.registeredCount}/
                      {event.capacity} Registered
                    </div>

                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">

                    <p className="text-2xl font-bold text-green-600">
                      ₹{event.price}
                    </p>

                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">

                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="
                        flex-1 border border-gray-300
                        rounded-xl py-2.5 font-medium
                        hover:bg-gray-100
                        transition
                      "
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => openPayment(event)}
                      className="
                        flex-1 rounded-xl py-2.5 text-white font-medium
                        bg-gradient-to-r from-blue-700 to-teal-500
                        hover:scale-105
                        transition
                      "
                    >
                      Register
                    </button>

                  </div>

                </div>

              </div>

            ))}

        </div>

      </div>

      {/* Event Details Modal */}
      {selectedEvent && !paymentModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-2xl">

            <div className="relative">

              <img
                src={images[selectedEvent.category]}
                alt={selectedEvent.title}
                className="w-full h-72 object-cover"
              />

              <button
                onClick={() => setSelectedEvent(null)}
                className="
                  absolute top-4 right-4
                  bg-white p-2 rounded-full
                  hover:bg-gray-100 transition
                "
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="p-6 space-y-5">

              <div>

                <h2 className="text-3xl font-bold text-slate-800">
                  {selectedEvent.title}
                </h2>

                <p className="text-gray-500 mt-2">
                  {selectedEvent.description}
                </p>

              </div>

              <button
                onClick={() => openPayment(selectedEvent)}
                className="
                  w-full py-3 rounded-2xl text-white text-lg font-semibold
                  bg-gradient-to-r from-blue-700 to-teal-500
                  hover:scale-[1.02]
                  transition
                "
              >
                Proceed To Payment
              </button>

            </div>

          </div>

        </div>

      )}

      {/* Payment Modal */}
      {paymentModal && selectedEvent && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">

              <h2 className="text-2xl font-bold">
                Payment Options
              </h2>

              <button
                onClick={() => setPaymentModal(false)}
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* Event */}
            <div className="bg-gray-100 rounded-2xl p-4 mb-5">

              <h3 className="font-bold text-lg">
                {selectedEvent.title}
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Registration Fee
              </p>

              <p className="text-3xl font-bold text-green-600 mt-2">
                ₹{selectedEvent.price}
              </p>

            </div>

            {/* UPI */}
            <div className="space-y-4">

              {/* GPay */}
              <button
                onClick={() => setSelectedPayment("GPay")}
                className={`w-full border rounded-2xl p-4 flex items-center justify-between transition ${
                  selectedPayment === "GPay"
                    ? "border-blue-600 bg-blue-50"
                    : "hover:border-blue-400"
                }`}
              >

                <div className="flex items-center gap-4">

                  <SiGooglepay className="text-4xl text-blue-600" />

                  <div className="text-left">

                    <p className="font-semibold">
                      Google Pay
                    </p>

                    <p className="text-sm text-gray-500">
                      Pay using UPI
                    </p>

                  </div>

                </div>

              </button>

              {/* PhonePe */}
              <button
                onClick={() => setSelectedPayment("PhonePe")}
                className={`w-full border rounded-2xl p-4 flex items-center justify-between transition ${
                  selectedPayment === "PhonePe"
                    ? "border-purple-600 bg-purple-50"
                    : "hover:border-purple-400"
                }`}
              >

                <div className="flex items-center gap-4">

                  <SiPhonepe className="text-4xl text-purple-600" />

                  <div className="text-left">

                    <p className="font-semibold">
                      PhonePe
                    </p>

                    <p className="text-sm text-gray-500">
                      Fast UPI Payment
                    </p>

                  </div>

                </div>

              </button>

              {/* Paytm */}
              <button
                onClick={() => setSelectedPayment("Paytm")}
                className={`w-full border rounded-2xl p-4 flex items-center justify-between transition ${
                  selectedPayment === "Paytm"
                    ? "border-cyan-600 bg-cyan-50"
                    : "hover:border-cyan-400"
                }`}
              >

                <div className="flex items-center gap-4">

                  <SiPaytm className="text-4xl text-cyan-600" />

                  <div className="text-left">

                    <p className="font-semibold">
                      Paytm
                    </p>

                    <p className="text-sm text-gray-500">
                      Wallet & UPI
                    </p>

                  </div>

                </div>

              </button>

              {/* Card */}
              <button
                onClick={() => setSelectedPayment("Card")}
                className={`w-full border rounded-2xl p-4 flex items-center justify-between transition ${
                  selectedPayment === "Card"
                    ? "border-black bg-gray-100"
                    : "hover:border-gray-400"
                }`}
              >

                <div className="flex items-center gap-4">

                  <CreditCard className="h-9 w-9" />

                  <div className="text-left">

                    <p className="font-semibold">
                      Credit / Debit Card
                    </p>

                    <p className="text-sm text-gray-500">
                      Visa, Mastercard & More
                    </p>

                  </div>

                </div>

              </button>

            </div>

            {/* Button */}
            <button
              onClick={handlePayment}
              className="
                w-full mt-6 py-3 rounded-2xl
                text-white font-semibold text-lg
                bg-gradient-to-r from-blue-700 to-teal-500
                hover:scale-[1.02]
                transition
              "
            >
              Pay & Register
            </button>

          </div>

        </div>

      )}

      {/* Success Modal */}
      <SuccessModal
        open={open}
        onClose={() => setOpen(false)}
        title="🎉 Payment Successful!"
        message="You have successfully registered for the event."
      />

    </div>
  );
};

export default StudentDashboard;