import { useState } from "react";
import {
  Award,
  Download,
  Calendar,
  Trophy,
  Search,
  Eye,
  X,
  Medal,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../hooks/use-toast";

const initialCertificates = [
  {
    id: "1",
    event: "Tech Innovation Summit 2025",
    date: "Mar 15, 2025",
    type: "Participation",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: "2",
    event: "Hackathon: Code for Good",
    date: "Apr 12, 2025",
    type: "Winner - 1st Place",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: "3",
    event: "Research Paper Presentation",
    date: "Feb 28, 2025",
    type: "Best Paper Award",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
  },
];

const Certificates = () => {

  const { toast } = useToast();

  const [search, setSearch] = useState("");

  const [selectedCertificate, setSelectedCertificate] =
    useState(null);

  // Search Filter
  const filtered = initialCertificates.filter((cert) =>
    cert.event.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>

        <h1 className="text-2xl font-bold">
          Certificates
        </h1>

        <p className="text-muted-foreground mt-1">
          View and download your earned certificates
        </p>

      </div>

      {/* Search */}
      <div className="relative max-w-md">

        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

        <Input
          placeholder="Search certificates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white border rounded-2xl p-5 shadow-sm">

          <p className="text-sm text-muted-foreground">
            Total Certificates
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {initialCertificates.length}
          </h2>

        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm">

          <p className="text-sm text-muted-foreground">
            Winner Awards
          </p>

          <h2 className="text-3xl font-bold mt-2 text-yellow-500">
            {
              initialCertificates.filter((c) =>
                c.type.toLowerCase().includes("winner")
              ).length
            }
          </h2>

        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm">

          <p className="text-sm text-muted-foreground">
            Participation
          </p>

          <h2 className="text-3xl font-bold mt-2 text-blue-600">
            {
              initialCertificates.filter((c) =>
                c.type.toLowerCase().includes("participation")
              ).length
            }
          </h2>

        </div>

      </div>

      {/* Certificates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

        {filtered.map((cert) => (

          <div
            key={cert.id}
            className="
              bg-white border rounded-2xl overflow-hidden
              hover:shadow-xl hover:-translate-y-1
              transition duration-500 group
            "
          >

            {/* Image */}
            <div className="relative h-52 overflow-hidden">

              <img
                src={cert.image}
                alt={cert.event}
                className="
                  w-full h-full object-cover
                  group-hover:scale-110
                  transition duration-700
                "
              />

              <div className="absolute inset-0 bg-black/30" />

              <Badge className="absolute top-4 right-4">
                {cert.type}
              </Badge>

            </div>

            {/* Content */}
            <div className="p-5 space-y-4">

              <div className="flex items-center gap-3">

                <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center">

                  <Award className="h-6 w-6 text-yellow-600" />

                </div>

                <div>

                  <h3 className="font-bold text-lg">
                    {cert.event}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {cert.type}
                  </p>

                </div>

              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">

                <Calendar className="h-4 w-4 text-blue-600" />
                {cert.date}

              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">

                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    setSelectedCertificate(cert)
                  }
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>

                <Button
                  className="flex-1"
                  onClick={() =>
                    toast({
                      title:
                        "🏆 Certificate Downloaded Successfully!",
                    })
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* Certificate Modal */}
      {selectedCertificate && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl">

            {/* Top Image */}
            <img
              src={selectedCertificate.image}
              alt={selectedCertificate.event}
              className="w-full h-60 object-cover"
            />

            <div className="p-8 space-y-6">

              {/* Header */}
              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-3xl font-bold">
                    Certificate Preview
                  </h2>

                  <p className="text-muted-foreground">
                    Event Achievement Certificate
                  </p>

                </div>

                <button
                  onClick={() =>
                    setSelectedCertificate(null)
                  }
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* Certificate Box */}
              <div className="border-4 border-dashed rounded-2xl p-8 bg-gradient-to-br from-yellow-50 to-white text-center space-y-5">

                <div className="flex justify-center">

                  <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center">

                    <Trophy className="h-10 w-10 text-yellow-600" />

                  </div>

                </div>

                <div>

                  <h3 className="text-3xl font-bold">
                    Certificate of Achievement
                  </h3>

                  <p className="text-muted-foreground mt-2">
                    This certificate is proudly presented for
                  </p>

                </div>

                <div>

                  <h2 className="text-4xl font-bold text-blue-700">
                    {selectedCertificate.event}
                  </h2>

                  <p className="mt-3 text-lg">
                    Award Type:
                    <span className="font-semibold ml-2">
                      {selectedCertificate.type}
                    </span>
                  </p>

                </div>

                <div className="flex items-center justify-center gap-2 text-muted-foreground">

                  <Calendar className="h-4 w-4" />
                  {selectedCertificate.date}

                </div>

                <div className="flex justify-center">

                  <Badge className="px-4 py-1 text-sm">
                    <Medal className="h-4 w-4 mr-2" />
                    Verified Certificate
                  </Badge>

                </div>

              </div>

              {/* Download Button */}
              <Button
                className="w-full"
                onClick={() =>
                  toast({
                    title:
                      "🏆 Certificate Downloaded Successfully!",
                  })
                }
              >
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>

            </div>

          </div>

        </div>

      )}

      {/* Empty State */}
      {filtered.length === 0 && (

        <div className="text-center py-14 border rounded-2xl bg-white">

          <h3 className="text-lg font-semibold">
            No Certificates Found
          </h3>

          <p className="text-muted-foreground mt-1">
            Try searching for another certificate
          </p>

        </div>

      )}

    </div>
  );
};

export default Certificates;