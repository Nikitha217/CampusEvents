import { useState } from "react";

import {
  Search,
  Calendar,
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

import SuccessModal from "../../components/SuccessModal";

import { mockEvents as eventsData } from "../../data/mockEvents";

import { Input } from "../../components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const images = {
  Technology:
    "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",

  Cultural:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",

  Business:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop",

  Sports:
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&auto=format&fit=crop",

  Academic:
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
};

const BrowseEvents = () => {

  const [events, setEvents] = useState(
    eventsData.map((event) => ({
      ...event,
      registeredCount: event.registeredCount || 0,
      capacity: event.capacity || 100,
      price: event.price || 299,
    }))
  );

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("all");

  const [successModal, setSuccessModal] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [paymentModal, setPaymentModal] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState("");

  // Open Payment Modal
  const openPayment = (event) => {

    setSelectedEvent(event);

    setPaymentModal(true);
  };

  // Handle Payment
  const handlePayment = () => {

    if (!selectedPayment) {

      alert("Please select a payment method");

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

    setSelectedEvent(
      updatedEvents.find((e) => e.id === selectedEvent.id)
    );

    setPaymentModal(false);

    setSuccessModal(true);
  };

  // Filter Events
  const filtered = events.filter((e) => {

    const matchSearch = e.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      category === "all" ||
      e.category.toLowerCase() === category;

    return matchSearch && matchCategory;
  });

  return (

    <div className="space-y-6">

      {/* Header */}
      <div>

        <h1 className="text-2xl font-bold">
          Browse Events
        </h1>

        <p className="text-muted-foreground mt-1">
          Discover and register for campus events
        </p>

      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">

        <div className="relative flex-1">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />

        </div>

        <Select value={category} onValueChange={setCategory}>

          <SelectTrigger className="w-full sm:w-48">

            <SelectValue placeholder="Category" />

          </SelectTrigger>

          <SelectContent>

            <SelectItem value="all">
              All Categories
            </SelectItem>

            <SelectItem value="technology">
              Technology
            </SelectItem>

            <SelectItem value="cultural">
              Cultural
            </SelectItem>

            <SelectItem value="business">
              Business
            </SelectItem>

            <SelectItem value="sports">
              Sports
            </SelectItem>

            <SelectItem value="academic">
              Academic
            </SelectItem>

          </SelectContent>

        </Select>

      </div>

      {/* Event Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

        {filtered.map((event) => (

          <div
            key={event.id}
            className="
              bg-white border rounded-2xl overflow-hidden
              hover:-translate-y-2 hover:shadow-xl
              transition duration-500 group
            "
          >

            {/* Image */}
            <div className="relative h-48 overflow-hidden">

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

              <span className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-semibold">
                {event.category}
              </span>

            </div>

            {/* Content */}
            <div className="p-4 space-y-3">

              <h3 className="font-bold text-lg group-hover:text-blue-600 transition">
                {event.title}
              </h3>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>

              {/* Event Details */}
              <div className="space-y-2 text-sm">

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
                  {event.registeredCount}/{event.capacity} Registered
                </div>

              </div>

              {/* Price & Register */}
              <div className="flex items-center justify-between pt-2">

                <p className="font-bold text-green-600 text-lg">
                  ₹{event.price}
                </p>

                <button
                  onClick={() => openPayment(event)}
                  className="
                    px-5 py-2 rounded-xl text-white font-medium
                    bg-gradient-to-r from-blue-700 to-teal-500
                    hover:scale-105 transition
                  "
                >
                  Register
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* No Events */}
      {filtered.length === 0 && (

        <div className="text-center py-12 text-muted-foreground">
          No events found.
        </div>

      )}

      {/* Payment Modal */}
      {paymentModal && selectedEvent && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3">

          <div className="bg-[#f5f5f7] w-full max-w-md h-[90vh] rounded-3xl overflow-y-auto shadow-2xl">

            {/* Header */}
            <div className="bg-white px-5 py-4 border-b sticky top-0 z-10">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-2xl font-bold">
                    Payment Options
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    1 Item • Total:
                    <span className="text-green-600 font-semibold">
                      {" "}₹{selectedEvent.price}
                    </span>
                  </p>

                </div>

                <button onClick={() => setPaymentModal(false)}>
                  <X className="h-6 w-6" />
                </button>

              </div>

            </div>

            <div className="p-4 space-y-6">

              {/* UPI Section */}
              <div>

                <h3 className="font-bold text-lg mb-3">
                  Pay by any UPI App
                </h3>

                <div className="bg-white rounded-2xl overflow-hidden border">

                  {/* GPay */}
                  <button
                    onClick={() => setSelectedPayment("GPay")}
                    className="w-full flex items-center justify-between p-4 border-b hover:bg-gray-50 transition"
                  >

                    <div className="flex items-center gap-4">

                      <div className="bg-blue-100 p-3 rounded-xl">
                        <SiGooglepay className="text-3xl text-blue-600" />
                      </div>

                      <div className="text-left">

                        <p className="font-semibold text-lg">
                          Google Pay
                        </p>

                        <p className="text-sm text-green-600">
                          Fast UPI Payment
                        </p>

                      </div>

                    </div>

                    <div
                      className={`h-5 w-5 rounded-full border-2 ${
                        selectedPayment === "GPay"
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-400"
                      }`}
                    />

                  </button>

                  {/* PhonePe */}
                  <button
                    onClick={() => setSelectedPayment("PhonePe")}
                    className="w-full flex items-center justify-between p-4 border-b hover:bg-gray-50 transition"
                  >

                    <div className="flex items-center gap-4">

                      <div className="bg-purple-100 p-3 rounded-xl">
                        <SiPhonepe className="text-3xl text-purple-600" />
                      </div>

                      <div className="text-left">

                        <p className="font-semibold text-lg">
                          PhonePe
                        </p>

                        <p className="text-sm text-green-600">
                          Cashback Available
                        </p>

                      </div>

                    </div>

                    <div
                      className={`h-5 w-5 rounded-full border-2 ${
                        selectedPayment === "PhonePe"
                          ? "border-purple-600 bg-purple-600"
                          : "border-gray-400"
                      }`}
                    />

                  </button>

                  {/* Paytm */}
                  <button
                    onClick={() => setSelectedPayment("Paytm")}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
                  >

                    <div className="flex items-center gap-4">

                      <div className="bg-cyan-100 p-3 rounded-xl">
                        <SiPaytm className="text-3xl text-cyan-600" />
                      </div>

                      <div className="text-left">

                        <p className="font-semibold text-lg">
                          Paytm UPI
                        </p>

                        <p className="text-sm text-green-600">
                          Secure Payments
                        </p>

                      </div>

                    </div>

                    <div
                      className={`h-5 w-5 rounded-full border-2 ${
                        selectedPayment === "Paytm"
                          ? "border-cyan-600 bg-cyan-600"
                          : "border-gray-400"
                      }`}
                    />

                  </button>

                </div>

              </div>

              {/* Card Section */}
              <div>

                <h3 className="font-bold text-lg mb-3">
                  Credit & Debit Cards
                </h3>

                <button
                  onClick={() => setSelectedPayment("Card")}
                  className="w-full bg-white rounded-2xl p-4 border flex items-center justify-between hover:bg-gray-50 transition"
                >

                  <div className="flex items-center gap-4">

                    <div className="bg-orange-100 p-3 rounded-xl">
                      <CreditCard className="h-7 w-7 text-orange-500" />
                    </div>

                    <div className="text-left">

                      <p className="font-semibold text-lg">
                        Add New Card
                      </p>

                      <p className="text-sm text-gray-500">
                        Visa, Mastercard & More
                      </p>

                    </div>

                  </div>

                  <div
                    className={`h-5 w-5 rounded-full border-2 ${
                      selectedPayment === "Card"
                        ? "border-black bg-black"
                        : "border-gray-400"
                    }`}
                  />

                </button>

              </div>

            </div>

            {/* Bottom Button */}
            <div className="sticky bottom-0 bg-white border-t p-4">

              <button
                onClick={handlePayment}
                className="
                  w-full py-4 rounded-2xl
                  bg-gradient-to-r from-blue-700 to-teal-500
                  text-white font-bold text-lg
                  hover:scale-[1.01]
                  transition
                "
              >
                Pay ₹{selectedEvent.price}
              </button>

            </div>

          </div>

        </div>

      )}

      {/* Success Modal */}
      <SuccessModal
        open={successModal}
        onClose={() => setSuccessModal(false)}
        title="🎉 Payment Successful!"
        message="You have successfully registered for the event."
      />

    </div>
  );
};

export default BrowseEvents;