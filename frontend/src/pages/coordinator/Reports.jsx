import { FileText, Download, BarChart3 } from "lucide-react"
import { Button } from "../../components/ui/button"

const reports = [
  { id: "1", title: "Tech Innovation Summit Report" },
  { id: "2", title: "Monthly Attendance Report" },
]

const Reports = () => {

  const downloadReport = (title) => {
    const blob = new Blob([title + " report content"], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = title + ".txt"
    a.click()
  }

  return (
    <div className="space-y-6">

      <div className="flex justify-between">

        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Download event reports</p>
        </div>

        <Button>
          <BarChart3 size={16} className="mr-1"/>
          Generate Report
        </Button>

      </div>

      <div className="grid md:grid-cols-2 gap-4">

        {reports.map(r => (

          <div key={r.id} className="border p-4 rounded">

            <FileText size={20} className="mb-2"/>

            <h3 className="font-semibold">{r.title}</h3>

            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => downloadReport(r.title)}
            >
              <Download size={16} className="mr-1"/>
              Download
            </Button>

          </div>

        ))}

      </div>

    </div>
  )
}

export default Reports