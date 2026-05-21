import { useState } from "react";
import { mockEvents } from "../../data/mockEvents";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Edit, Trash2 } from "lucide-react";

const ManageEvents = () => {

  const [events, setEvents] = useState(mockEvents);

  const deleteEvent = (id) => {
    const updated = events.filter((event) => event.id !== id);
    setEvents(updated);
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">Manage Events</h1>
        <p className="text-gray-500 mt-1">Edit and manage your created events</p>
      </div>

      <div className="border rounded-lg overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Event</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Participants</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b">

                <td className="px-4 py-3">{event.title}</td>
                <td className="px-4 py-3">{event.date}</td>
                <td className="px-4 py-3">{event.location}</td>
                <td className="px-4 py-3">
                  {event.participants}/{event.maxParticipants}
                </td>

                <td className="px-4 py-3">
                  <Badge>{event.status}</Badge>
                </td>

                <td className="px-4 py-3 flex gap-2">

                  <Button size="sm" variant="ghost">
                    <Edit size={16}/>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => deleteEvent(event.id)}
                  >
                    <Trash2 size={16}/>
                  </Button>

                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </div>
  );
};

export default ManageEvents;