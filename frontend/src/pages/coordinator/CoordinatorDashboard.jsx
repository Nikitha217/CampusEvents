import { useState } from "react";

import {
  Calendar,
  Users,
  ClipboardCheck,
  BarChart3,
  Search,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Clock,
  X,
  Save,
  UserPlus,
} from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

const initialEvents = [
  {
    id: "1",
    title: "AI Workshop 2026",
    description:
      "Learn Artificial Intelligence and Machine Learning fundamentals with hands-on projects.",
    category: "Technology",
    date: "Mar 15, 2026",
    time: "10:00 AM",
    location: "Main Auditorium",
    participants: 45,
    maxParticipants: 100,
    status: "Upcoming",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: "2",
    title: "Cultural Dance Fest",
    description:
      "Annual cultural celebration with dance, music, and drama performances.",
    category: "Cultural",
    date: "Apr 5, 2026",
    time: "5:30 PM",
    location: "Open Air Theatre",
    participants: 120,
    maxParticipants: 200,
    status: "Ongoing",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: "3",
    title: "Startup Pitch Event",
    description:
      "Present innovative startup ideas and connect with investors.",
    category: "Business",
    date: "May 10, 2026",
    time: "11:00 AM",
    location: "Seminar Hall",
    participants: 60,
    maxParticipants: 150,
    status: "Upcoming",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop",
  },
];

// Stats Card
const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
}) => (
  <div
    className="
      bg-white border rounded-2xl p-5 shadow-sm
      hover:shadow-xl hover:-translate-y-1
      transition duration-300
    "
  >

    <div className="flex items-center justify-between mb-3">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">

        <Icon className="h-5 w-5 text-blue-700" />

      </div>

    </div>

    <h2 className="text-3xl font-bold">
      {value}
    </h2>

    {trend && (
      <p className="text-xs text-green-600 mt-2">
        {trend}
      </p>
    )}

  </div>
);

const CoordinatorDashboard = () => {

  const [events, setEvents] =
    useState(initialEvents);

  const [search, setSearch] = useState("");

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [editingEvent, setEditingEvent] =
    useState(null);

  // Search Filter
  const filteredEvents = events.filter((event) =>
    event.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Delete
  const handleDelete = (id) => {

    setEvents(
      events.filter((event) => event.id !== id)
    );
  };

  // Save Edit
  const handleSaveEdit = () => {

    const updated = events.map((event) =>
      event.id === editingEvent.id
        ? editingEvent
        : event
    );

    setEvents(updated);

    setEditingEvent(null);
  };

  // Add Participant
  const handleAddParticipant = (id) => {

    const updated = events.map((event) =>
      event.id === id
        ? {
            ...event,
            participants:
              event.participants + 1,
          }
        : event
    );

    setEvents(updated);

    if (
      selectedEvent &&
      selectedEvent.id === id
    ) {
      setSelectedEvent({
        ...selectedEvent,
        participants:
          selectedEvent.participants + 1,
      });
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>

        <h1 className="text-2xl font-bold">
          Coordinator Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Manage events and participants
        </p>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Total Events"
          value={events.length}
          icon={Calendar}
        />

        <StatCard
          title="Participants"
          value={events.reduce(
            (a, b) => a + b.participants,
            0
          )}
          icon={Users}
          trend="+15 this week"
        />

        <StatCard
          title="Attendance"
          value="87%"
          icon={ClipboardCheck}
        />

        <StatCard
          title="Reports"
          value="15"
          icon={BarChart3}
        />

      </div>

      {/* Search */}
      <div className="relative max-w-md">

        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

        <Input
          placeholder="Search events..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="pl-10"
        />

      </div>

      {/* Event Cards */}
      <div className="grid lg:grid-cols-2 gap-5">

        {filteredEvents.map((event) => (

          <div
            key={event.id}
            className="
              bg-white border rounded-2xl overflow-hidden
              hover:shadow-xl hover:-translate-y-1
              transition duration-500 group
            "
          >

            {/* Image */}
            <div className="relative h-56 overflow-hidden">

              <img
                src={event.image}
                alt={event.title}
                className="
                  w-full h-full object-cover
                  group-hover:scale-110
                  transition duration-700
                "
              />

              <div className="absolute inset-0 bg-black/30" />

              <Badge className="absolute top-4 left-4">
                {event.status}
              </Badge>

            </div>

            {/* Content */}
            <div className="p-5 space-y-4">

              <div>

                <h2 className="text-xl font-bold">
                  {event.title}
                </h2>

                <p className="text-sm text-muted-foreground mt-1">
                  {event.description}
                </p>

              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  {event.date}
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  {event.time}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  {event.location}
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  {event.participants}/
                  {event.maxParticipants}
                  Participants
                </div>

              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">

                {/* View */}
                <Button
                  variant="outline"
                  onClick={() =>
                    setSelectedEvent(event)
                  }
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>

                {/* Edit */}
                <Button
                  variant="secondary"
                  onClick={() =>
                    setEditingEvent(event)
                  }
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>

                {/* Add Participant */}
                <Button
                  onClick={() =>
                    handleAddParticipant(event.id)
                  }
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>

                {/* Delete */}
                <Button
                  variant="destructive"
                  onClick={() =>
                    handleDelete(event.id)
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* View Modal */}
      {selectedEvent && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl">

            <img
              src={selectedEvent.image}
              alt={selectedEvent.title}
              className="w-full h-64 object-cover"
            />

            <div className="p-6 space-y-5">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-3xl font-bold">
                    {selectedEvent.title}
                  </h2>

                  <p className="text-muted-foreground">
                    Event Details
                  </p>

                </div>

                <button
                  onClick={() =>
                    setSelectedEvent(null)
                  }
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* Details */}
              <div className="grid sm:grid-cols-2 gap-4">

                <div className="border rounded-xl p-4">
                  <p className="text-gray-500">
                    Category
                  </p>
                  <h3 className="font-semibold">
                    {selectedEvent.category}
                  </h3>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-gray-500">
                    Date
                  </p>
                  <h3 className="font-semibold">
                    {selectedEvent.date}
                  </h3>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-gray-500">
                    Time
                  </p>
                  <h3 className="font-semibold">
                    {selectedEvent.time}
                  </h3>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-gray-500">
                    Location
                  </p>
                  <h3 className="font-semibold">
                    {selectedEvent.location}
                  </h3>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-gray-500">
                    Participants
                  </p>
                  <h3 className="font-semibold">
                    {selectedEvent.participants}/
                    {
                      selectedEvent.maxParticipants
                    }
                  </h3>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-gray-500">
                    Status
                  </p>
                  <Badge>
                    {selectedEvent.status}
                  </Badge>
                </div>

              </div>

              {/* Description */}
              <div className="border rounded-xl p-4">
                <p className="text-gray-500 mb-2">
                  Description
                </p>

                <p>
                  {selectedEvent.description}
                </p>
              </div>

              <Button
                className="w-full"
                onClick={() =>
                  handleAddParticipant(
                    selectedEvent.id
                  )
                }
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Participant
              </Button>

            </div>

          </div>

        </div>

      )}

      {/* Edit Modal */}
      {editingEvent && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-5">

            <div className="flex items-center justify-between">

              <h2 className="text-2xl font-bold">
                Edit Event
              </h2>

              <button
                onClick={() =>
                  setEditingEvent(null)
                }
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* Inputs */}
            <Input
              value={editingEvent.title}
              onChange={(e) =>
                setEditingEvent({
                  ...editingEvent,
                  title: e.target.value,
                })
              }
              placeholder="Event Title"
            />

            <Input
              value={editingEvent.date}
              onChange={(e) =>
                setEditingEvent({
                  ...editingEvent,
                  date: e.target.value,
                })
              }
              placeholder="Event Date"
            />

            <Input
              value={editingEvent.time}
              onChange={(e) =>
                setEditingEvent({
                  ...editingEvent,
                  time: e.target.value,
                })
              }
              placeholder="Event Time"
            />

            <Input
              value={editingEvent.location}
              onChange={(e) =>
                setEditingEvent({
                  ...editingEvent,
                  location: e.target.value,
                })
              }
              placeholder="Event Location"
            />

            <Input
              value={editingEvent.description}
              onChange={(e) =>
                setEditingEvent({
                  ...editingEvent,
                  description:
                    e.target.value,
                })
              }
              placeholder="Description"
            />

            {/* Save */}
            <Button
              className="w-full"
              onClick={handleSaveEdit}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>

          </div>

        </div>

      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (

        <div className="text-center py-14 border rounded-2xl bg-white">

          <h3 className="text-lg font-semibold">
            No Events Found
          </h3>

          <p className="text-muted-foreground mt-1">
            Try searching another event
          </p>

        </div>

      )}

    </div>
  );
};

export default CoordinatorDashboard;