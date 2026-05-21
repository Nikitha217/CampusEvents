import { useState } from "react"
import { mockEvents } from "../../data/mockEvents"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Check, X } from "lucide-react"

const ApproveEvents = () => {

  const [events, setEvents] = useState(mockEvents)

  const handleApprove = (id) => {
    setEvents(events.filter(event => event.id !== id))
  }

  const handleReject = (id) => {
    setEvents(events.filter(event => event.id !== id))
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="font-display text-2xl font-bold">Approve Events</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve pending event requests
        </p>
      </div>

      <div className="space-y-3">

        {events.map(event => (
          <div
            key={event.id}
            className="bg-card border border-border rounded-lg p-5 flex flex-col sm:flex-row gap-4 shadow-card"
          >

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{event.title}</h3>
                <Badge variant="outline">{event.category}</Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                {event.description}
              </p>

              <p className="text-xs text-muted-foreground">
                {event.date} • {event.location} • Max {event.maxParticipants} participants
              </p>
            </div>

            <div className="flex items-center gap-2">

              <Button
                size="sm"
                className="bg-green-500 text-white"
                onClick={() => handleApprove(event.id)}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="text-red-500"
                onClick={() => handleReject(event.id)}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>

            </div>

          </div>
        ))}

      </div>
    </div>
  )
}

export default ApproveEvents