import { useEffect, useState } from "react";
import API from "../../services/api";
import { Trash2, Search, Star } from "lucide-react";

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    filterFeedbacks();
  }, [search, ratingFilter, feedbacks]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);

      const response = await API.get("/feedback");

      setFeedbacks(response.data);
      setFilteredFeedbacks(response.data);
    } catch (error) {
      console.error("Failed to load feedback", error);
    } finally {
      setLoading(false);
    }
  };

  const filterFeedbacks = () => {
    let data = [...feedbacks];

    if (search.trim()) {
      data = data.filter(
        (feedback) =>
          feedback.studentName
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          feedback.comments
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          feedback.eventTitle
            ?.toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    if (ratingFilter !== "ALL") {
      data = data.filter(
        (feedback) =>
          feedback.rating === Number(ratingFilter)
      );
    }

    setFilteredFeedbacks(data);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this feedback?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/feedback/${id}`);

      setFeedbacks((prev) =>
        prev.filter((feedback) => feedback.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete feedback", error);
      alert("Failed to delete feedback");
    }
  };

  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce(
            (sum, feedback) => sum + feedback.rating,
            0
          ) / feedbacks.length
        ).toFixed(1)
      : 0;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white/5 backdrop-blur-xl border rounded-xl shadow-lg shadow-purple-500/10 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              Feedback Management
            </h1>

            <p className="text-slate-500 mt-1">
              Review and moderate student feedback.
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-200 rounded-2xl px-4 py-3">
            <div className="text-sm text-slate-400">
              Average Rating
            </div>

            <div className="flex items-center gap-2 text-xl font-bold">
              <Star
                className="text-yellow-500"
                fill="currentColor"
              />
              {averageRating}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-3 text-slate-500"
              size={18}
            />

            <input
              type="text"
              placeholder="Search feedback..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full border rounded-2xl pl-10 p-3"
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(e) =>
              setRatingFilter(e.target.value)
            }
            className="border rounded-2xl p-3"
          >
            <option value="ALL">
              All Ratings
            </option>

            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-10">
            Loading feedback...
          </div>
        )}

        {/* Empty State */}
        {!loading &&
          filteredFeedbacks.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              No feedback found.
            </div>
          )}

        {/* Feedback List */}
        {!loading &&
          filteredFeedbacks.length > 0 && (
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="border rounded-xl p-5 shadow-lg shadow-purple-500/10"
                >
                  <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">
                          {feedback.studentName}
                        </h3>

                        <div className="text-yellow-500 text-lg">
                          {"★".repeat(
                            feedback.rating
                          )}
                          {"☆".repeat(
                            5 - feedback.rating
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-slate-500 mt-1">
                        Event:{" "}
                        {feedback.eventTitle ||
                          feedback.eventId}
                      </p>

                      <p className="text-sm text-slate-500">
                        Submitted:{" "}
                        {new Date(
                          feedback.submittedAt
                        ).toLocaleString("en-IN")}
                      </p>

                      <div className="mt-4">
                        <p className="text-slate-300">
                          {feedback.comments}
                        </p>
                      </div>

                      {feedback.image && (
                        <img
                          src={feedback.image}
                          alt="Feedback"
                          className="mt-4 w-full md:w-72 rounded-2xl border"
                        />
                      )}
                    </div>

                    <div>
                      <button
                        onClick={() =>
                          handleDelete(
                            feedback.id
                          )
                        }
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-2xl"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default FeedbackManagement;