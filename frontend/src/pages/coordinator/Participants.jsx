import { useState } from "react"
import { Users, Mail, Download } from "lucide-react"
import { Button } from "../../components/ui/button"

const initialParticipants = [
  { id: "1", name: "Alex Johnson", email: "alex@uni.edu", event: "Tech Innovation Summit" },
  { id: "2", name: "Maria Garcia", email: "maria@uni.edu", event: "Tech Innovation Summit" },
]

const Participants = () => {

  const [participants] = useState(initialParticipants)

  const exportData = () => {
    const csv = participants
      .map(p => `${p.name},${p.email},${p.event}`)
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "participants.csv"
    a.click()
  }

  return (
    <div className="space-y-6">

      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Participants</h1>
          <p className="text-muted-foreground">
            View registered participants
          </p>
        </div>

        <Button onClick={exportData}>
          <Download size={16} className="mr-1"/>
          Export
        </Button>

      </div>

      {participants.map(p => (
        <div key={p.id} className="border p-4 rounded flex justify-between">
          <div>
            <p className="font-medium flex items-center gap-2">
              <Users size={16}/> {p.name}
            </p>
            <p className="text-sm text-gray-500">{p.email}</p>
          </div>

          <Button size="sm" variant="ghost">
            <Mail size={16}/>
          </Button>

        </div>
      ))}

    </div>
  )
}

export default Participants