import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  XCircle,
  Search,
  Ticket,
  X,
  User,
  IndianRupee,
  Download,
  CheckCircle,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";

const initialRegistrations = [
  {
    id: "1",
    title: "Tech Innovation Summit 2026",
    date: "Mar 15, 2026",
    time: "9:00 AM",
    location: "Main Auditorium",
    status: "confirmed",
    category: "Technology",
    organizer: "Department of CSE",
    seat: "A-24",
    amount: 499,
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: "2",
    title: "Annual Cultural Fest - Euphoria",
    date: "Mar 22, 2026",
    time: "5:00 PM",
    location: "Open Air Theatre",
    status: "confirmed",
    category: "Cultural",
    organizer: "Fine Arts Club",
    seat: "B-12",
    amount: 299,
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: "3",
    title: "Startup Pitch Competition",
    date: "Apr 5, 2026",
    time: "10:00 AM",
    location: "Seminar Hall 3",
    status: "pending",
    category: "Business",
    organizer: "MBA Department",
    seat: "C-09",
    amount: 799,
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: "4",
    title: "Research Paper Presentation",
    date: "Feb 28, 2026",
    time: "11:00 AM",
    location: "Conference Room B",
    status: "attended",
    category: "Academic",
    organizer: "Research Cell",
    seat: "D-15",
    amount: 199,
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
  },
];

const badgeColor = {
  confirmed: "default",
  pending: "secondary",
  attended: "outline",
  cancelled: "destructive",
};

const MyRegistrations = () => {

  const [registrations, setRegistrations] =
    useState(initialRegistrations);

  const [search, setSearch] = useState("");

  const [selectedTicket, setSelectedTicket] =
    useState(null);

  const [downloaded, setDownloaded] =
    useState(false);

  // Cancel Registration
  const handleCancel = (id) => {

    const updated = registrations.map((reg) =>
      reg.id === id
        ? { ...reg, status: "cancelled" }
        : reg
    );

    setRegistrations(updated);
  };

  // Download Ticket
  const handleDownload = () => {

    setDownloaded(true);

    setTimeout(() => {
      setDownloaded(false);
    }, 2500);
  };

  // Search Filter
  const filtered = registrations.filter((reg) =>
    reg.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-2">

      {/* Header */}
      <div>

        <h1 className="text-3xl font-bold text-slate-800">
          My Registrations
        </h1>

        <p className="text-muted-foreground mt-1">
          Track all your registered events
        </p>

      </div>

      {/* Search */}
      <div className="relative max-w-md">

        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

        <Input
          placeholder="Search registered events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />

      </div>

      {/* Cards */}
      <div className="grid lg:grid-cols-2 gap-6">

        {filtered.map((reg) => (

          <div
            key={reg.id}
            className="
              bg-white border rounded-3xl overflow-hidden
              hover:shadow-2xl hover:-translate-y-2
              transition duration-500 group
            "
          >

            {/* Image */}
            <div className="relative h-56 overflow-hidden">

              <img
                src={reg.image}
                alt={reg.title}
                className="
                  w-full h-full object-cover
                  group-hover:scale-110
                  transition duration-700
                "
              />

              <div className="absolute inset-0 bg-black/30" />

              <Badge
                variant={badgeColor[reg.status]}
                className="absolute top-4 right-4 capitalize"
              >
                {reg.status}
              </Badge>

            </div>

            {/* Content */}
            <div className="p-5 space-y-4">

              <div>

                <h3 className="text-xl font-bold text-slate-800">
                  {reg.title}
                </h3>

                <p className="text-sm text-muted-foreground mt-1">
                  Event Registration Details
                </p>

              </div>

              {/* Details */}
              <div className="space-y-3 text-sm text-gray-700">

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  {reg.date}
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  {reg.time}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  {reg.location}
                </div>

              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">

                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setSelectedTicket(reg)}
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  View Ticket
                </Button>

                {reg.status !== "attended" &&
                  reg.status !== "cancelled" && (

                  <Button
                    variant="destructive"
                    className="flex-1 rounded-xl"
                    onClick={() => handleCancel(reg.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>

                )}

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* Ticket Popup */}
      {selectedTicket && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">

            {/* Close Button */}
            <button
              onClick={() => setSelectedTicket(null)}
              className="
                absolute top-4 right-4 z-20
                bg-white p-2 rounded-full shadow-md
                hover:bg-gray-100 transition
              "
            >
              <X className="h-5 w-5 text-black" />
            </button>

            {/* Image */}
            <div className="relative">

              <img
                src={selectedTicket.image}
                alt={selectedTicket.title}
                className="w-full h-48 object-cover"
              />

              <div className="absolute inset-0 bg-black/30" />

            </div>

            {/* Content */}
            <div className="p-5 space-y-5">

              {/* Header */}
              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  {selectedTicket.title}
                </h2>

                <p className="text-sm text-muted-foreground mt-1">
                  Event Ticket
                </p>

              </div>

              {/* Details */}
              <div className="space-y-3 text-sm text-gray-700">

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  {selectedTicket.date}
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  {selectedTicket.time}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  {selectedTicket.location}
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  {selectedTicket.organizer}
                </div>

              </div>

              {/* Ticket Box */}
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50 space-y-4">

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Category
                  </span>

                  <span className="font-semibold">
                    {selectedTicket.category}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Seat Number
                  </span>

                  <span className="font-semibold">
                    {selectedTicket.seat}
                  </span>
                </div>

                <div className="flex justify-between items-center">

                  <span className="text-gray-500 flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    Amount Paid
                  </span>

                  <span className="font-bold text-green-600 text-lg">
                    ₹{selectedTicket.amount}
                  </span>

                </div>

                <div className="flex justify-between items-center">

                  <span className="text-gray-500">
                    Status
                  </span>

                  <Badge
                    variant={badgeColor[selectedTicket.status]}
                    className="capitalize"
                  >
                    {selectedTicket.status}
                  </Badge>

                </div>

              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownload}
                className="
                  w-full py-5 text-base font-semibold rounded-xl
                  bg-gradient-to-r from-blue-700 to-teal-500
                  hover:opacity-90
                "
              >

                {downloaded ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Ticket Downloaded
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Download Ticket
                  </>
                )}

              </Button>

            </div>

          </div>

        </div>

      )}

      {/* Empty State */}
      {filtered.length === 0 && (

        <div className="text-center py-14 border rounded-2xl bg-white">

          <h3 className="text-lg font-semibold">
            No Registrations Found
          </h3>

          <p className="text-muted-foreground mt-1">
            Try searching for another event
          </p>

        </div>

      )}

    </div>
  );
};

export default MyRegistrations;