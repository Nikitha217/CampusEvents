import { useState } from "react"
import {
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  X,
  CalendarDays,
} from "lucide-react"

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"

const initialCategories = [
  {
    id: "1",
    name: "Technology",
    events: [
      "AI Workshop",
      "Hackathon 2026",
      "Web Development Bootcamp",
    ],
  },
  {
    id: "2",
    name: "Cultural",
    events: [
      "Dance Competition",
      "Music Fest",
      "Drama Night",
    ],
  },
  {
    id: "3",
    name: "Business",
    events: [
      "Startup Meetup",
      "Marketing Seminar",
    ],
  },
  {
    id: "4",
    name: "Sports",
    events: [
      "Football Tournament",
      "Cricket League",
    ],
  },
  {
    id: "5",
    name: "Academic",
    events: [
      "Research Symposium",
      "Paper Presentation",
    ],
  },
]

const Categories = () => {

  const [categories, setCategories] = useState(initialCategories)

  const [selectedCategory, setSelectedCategory] = useState(null)

  const [showModal, setShowModal] = useState(false)

  const [newCategory, setNewCategory] = useState("")

  // EDIT STATES
  const [editModal, setEditModal] = useState(false)

  const [editCategoryId, setEditCategoryId] = useState(null)

  const [editCategoryName, setEditCategoryName] = useState("")

  // Delete Category
  const handleDelete = (id) => {
    setCategories(categories.filter((cat) => cat.id !== id))
  }

  // Add Category
  const handleAddCategory = () => {

    if (!newCategory.trim()) return

    const category = {
      id: Date.now().toString(),
      name: newCategory,
      events: [],
    }

    setCategories([...categories, category])

    setNewCategory("")

    setShowModal(false)
  }

  // Open Edit Modal
  const handleEditOpen = (cat) => {

    setEditCategoryId(cat.id)

    setEditCategoryName(cat.name)

    setEditModal(true)
  }

  // Save Edited Category
  const handleEditSave = () => {

    if (!editCategoryName.trim()) return

    const updatedCategories = categories.map((cat) =>

      cat.id === editCategoryId
        ? { ...cat, name: editCategoryName }
        : cat
    )

    setCategories(updatedCategories)

    // Update selected category if open
    if (selectedCategory?.id === editCategoryId) {

      setSelectedCategory({
        ...selectedCategory,
        name: editCategoryName,
      })
    }

    setEditModal(false)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>

          <h1 className="font-display text-2xl font-bold">
            Categories
          </h1>

          <p className="text-muted-foreground mt-1">
            Manage event categories
          </p>

        </div>

        {/* Add Category Button */}
        <Button
          className="gradient-primary text-white"
          onClick={() => setShowModal(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Category
        </Button>

      </div>

      {/* Categories Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {categories.map((cat) => (

          <div
            key={cat.id}
            onClick={() => setSelectedCategory(cat)}
            className="bg-card border border-border rounded-lg p-5 shadow-card cursor-pointer hover:shadow-lg transition"
          >

            <div className="flex items-center justify-between mb-3">

              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <FolderOpen className="h-5 w-5" />
              </div>

              <div
                className="flex gap-1"
                onClick={(e) => e.stopPropagation()}
              >

                {/* EDIT BUTTON */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditOpen(cat)}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                {/* DELETE BUTTON */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500"
                  onClick={() => handleDelete(cat.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

              </div>

            </div>

            <h3 className="font-semibold text-lg">
              {cat.name}
            </h3>

            <p className="text-sm text-muted-foreground">
              {cat.events.length} events
            </p>

          </div>

        ))}

      </div>

      {/* Events Section */}
      {selectedCategory && (

        <div className="bg-white border rounded-xl p-5 shadow-sm">

          <div className="flex items-center justify-between mb-4">

            <div>

              <h2 className="text-xl font-bold">
                {selectedCategory.name} Events
              </h2>

              <p className="text-muted-foreground text-sm">
                Available events in this category
              </p>

            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              <X className="h-4 w-4 mr-1" />
              Close
            </Button>

          </div>

          {selectedCategory.events.length > 0 ? (

            <div className="space-y-3">

              {selectedCategory.events.map((event, index) => (

                <div
                  key={index}
                  className="flex items-center gap-3 border rounded-lg px-4 py-3"
                >

                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>

                    <h4 className="font-medium">
                      {event}
                    </h4>

                    <p className="text-sm text-muted-foreground">
                      Event #{index + 1}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="text-center py-10 text-muted-foreground">
              No events available in this category
            </div>

          )}

        </div>

      )}

      {/* ADD CATEGORY MODAL */}
      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">

            <div className="flex items-center justify-between mb-4">

              <h2 className="text-xl font-bold">
                Add New Category
              </h2>

              <button
                onClick={() => setShowModal(false)}
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="space-y-4">

              <Input
                placeholder="Enter category name"
                value={newCategory}
                onChange={(e) =>
                  setNewCategory(e.target.value)
                }
              />

              <Button
                className="w-full gradient-primary text-white"
                onClick={handleAddCategory}
              >
                Add Category
              </Button>

            </div>

          </div>

        </div>

      )}

      {/* EDIT CATEGORY MODAL */}
      {editModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">

            <div className="flex items-center justify-between mb-4">

              <h2 className="text-xl font-bold">
                Edit Category
              </h2>

              <button
                onClick={() => setEditModal(false)}
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="space-y-4">

              <Input
                placeholder="Edit category name"
                value={editCategoryName}
                onChange={(e) =>
                  setEditCategoryName(e.target.value)
                }
              />

              <Button
                className="w-full gradient-primary text-white"
                onClick={handleEditSave}
              >
                Save Changes
              </Button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

export default Categories