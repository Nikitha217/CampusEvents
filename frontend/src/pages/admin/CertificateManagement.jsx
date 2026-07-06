import { useEffect, useState } from "react";
import {
  Award,
  Search,
  Eye,
  Download,
  Calendar,
  User,
} from "lucide-react";

import API from "../../services/api";

const CertificateManagement = () => {

  const [certificates, setCertificates] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {

    try {

      const response =
        await API.get("/certificates");

      setCertificates(
        response.data
      );

    } catch (error) {

      console.error(
        "Certificate fetch failed",
        error
      );

    } finally {

      setLoading(false);
    }
  };

  const filteredCertificates =
    certificates.filter((cert) =>
      cert.studentName
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      cert.eventTitle
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const openCertificate =
    (certificateUrl) => {
      const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace("/api", "");
      window.open(
        `${API_BASE}${certificateUrl}`,
        "_blank"
      );
    };

  if (loading) {

    return (

      <div className="p-10 text-center">

        Loading certificates...

      </div>
    );
  }

  return (

    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-3xl font-bold flex items-center gap-3">

          <Award className="h-8 w-8 text-purple-400" />

          Certificate Management

        </h1>

        <p className="text-slate-500 mt-2">

          Monitor all issued certificates

        </p>

      </div>

      {/* Statistics */}

      <div
        className="
          bg-white/5 backdrop-blur-xl
          border
          rounded-3xl
          p-6
          shadow-lg shadow-purple-500/10
        "
      >

        <h2 className="text-lg font-semibold">

          Total Certificates

        </h2>

        <p className="text-4xl font-bold mt-2 text-purple-400">

          {certificates.length}

        </p>

      </div>

      {/* Search */}

      <div className="relative max-w-md">

        <Search
          className="
            absolute
            left-3
            top-3.5
            h-4
            w-4
            text-slate-500
          "
        />

        <input
          type="text"
          placeholder="Search by student or event..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="
            w-full
            border
            rounded-xl
            pl-10
            pr-4
            py-3
          "
        />

      </div>

      {/* Empty State */}

      {filteredCertificates.length === 0 && (

        <div
          className="
            bg-white/5 backdrop-blur-xl
            border
            rounded-3xl
            p-12
            text-center
          "
        >

          <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />

          <h2 className="text-2xl font-bold">

            No Certificates Found

          </h2>

          <p className="text-slate-500 mt-3">

            No matching certificates available.

          </p>

        </div>
      )}

      {/* Certificates */}

      <div className="grid lg:grid-cols-2 gap-6">

        {filteredCertificates.map((cert) => (

          <div
            key={cert.id}
            className="
              bg-white/5 backdrop-blur-xl
              border
              rounded-3xl
              p-6
              shadow-lg shadow-purple-500/10
            "
          >

            <h2 className="font-bold text-xl">

              {cert.eventTitle}

            </h2>

            <div className="mt-4 space-y-2">

              <p className="flex items-center gap-2">

                <User size={16} />

                {cert.studentName}

              </p>

              <p className="flex items-center gap-2 text-slate-500">

                <Calendar size={16} />

                {new Date(
                  cert.issuedDate
                ).toLocaleString()}

              </p>

            </div>

            <div className="flex gap-3 mt-6">

              <button
                onClick={() =>
                  openCertificate(
                    cert.certificateUrl
                  )
                }
                className="
                  flex-1
                  py-3
                  rounded-xl
                  border
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >

                <Eye size={18} />

                View

              </button>

              <button
                onClick={() =>
                  openCertificate(
                    cert.certificateUrl
                  )
                }
                className="
                  flex-1
                  py-3
                  rounded-xl
                  bg-indigo-600
                  text-white
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >

                <Download size={18} />

                Download

              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default CertificateManagement;