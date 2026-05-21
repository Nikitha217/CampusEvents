import { useState } from "react";
import { ClipboardCheck, Check, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

const initialAttendees = [
  { id: "1", name: "Vishvadharshini", event: "Tech Innovation Summit", present: true },
  { id: "2", name: "Sekar", event: "Tech Innovation Summit", present: true },
  { id: "3", name: "Murugeswari", event: "Tech Innovation Summit", present: false },
  { id: "4", name: "Saravanan", event: "Tech Innovation Summit", present: true },
  { id: "5", name: "Nithya", event: "Tech Innovation Summit", present: false },
];

const Attendance = () => {

  const [attendees, setAttendees] = useState(initialAttendees);

  const toggleAttendance = (id) => {
    const updated = attendees.map((person) =>
      person.id === id ? { ...person, present: !person.present } : person
    );
    setAttendees(updated);
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-gray-500 mt-1">Mark and track event attendance</p>
      </div>

      <Select defaultValue="1">
        <SelectTrigger className="w-72">
          <SelectValue placeholder="Select event" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="1">Tech Innovation Summit 2026</SelectItem>
          <SelectItem value="2">Annual Cultural Fest</SelectItem>
        </SelectContent>
      </Select>

      <div className="border rounded-lg overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {attendees.map((a) => (
              <tr key={a.id} className="border-b">

                <td className="px-4 py-3">{a.name}</td>

                <td className="px-4 py-3">
                  <span className="flex items-center gap-1">
                    {a.present ? <Check size={16}/> : <X size={16}/>}
                    {a.present ? "Present" : "Absent"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAttendance(a.id)}
                  >
                    <ClipboardCheck size={16} className="mr-1"/>
                    Toggle
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

export default Attendance;