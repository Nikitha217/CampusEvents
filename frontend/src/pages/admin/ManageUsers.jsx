import { useState } from "react"
import {
  Edit,
  Trash2,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react"

import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"

const initialUsers = [
  { id: "1", name: "Vishvadharshini", email: "vish@uni.edu", role: "student", status: "active" },
  { id: "2", name: "Saravanan", email: "sara@uni.edu", role: "coordinator", status: "active" },
  { id: "3", name: "Nikitha", email: "niki@uni.edu", role: "admin", status: "active" },
  { id: "4", name: "Navarathri", email: "nava@uni.edu", role: "student", status: "inactive" },
  { id: "5", name: "Tharani", email: "nimi@uni.edu", role: "coordinator", status: "active" },
  { id: "6", name: "Keerthana", email: "keerthi@uni.edu", role: "student", status: "active" },
  { id: "7", name: "Murugan", email: "murugan@uni.edu", role: "admin", status: "active" },
]

const USERS_PER_PAGE = 5

const ManageUsers = () => {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const handleDelete = (id) => {
    setUsers(users.filter((user) => user.id !== id))
  }

  // Search + Filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())

    const matchesRole =
      roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE)

  const startIndex = (currentPage - 1) * USERS_PER_PAGE
  const endIndex = startIndex + USERS_PER_PAGE

  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">Manage Users</h1>

          <p className="text-muted-foreground">
            View and manage all platform users
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">

          <Filter className="h-4 w-4 text-gray-500" />

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="border border-border rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="coordinator">Coordinator</option>
            <option value="admin">Admin</option>
          </select>

        </div>

      </div>

      {/* Search */}
      <div className="relative max-w-sm">

        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setCurrentPage(1)
          }}
          className="pl-10"
        />

      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">

        <table className="w-full text-sm">

          <thead>
            <tr className="border-b border-border bg-gray-50">
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>

            {paginatedUsers.map((user) => (

              <tr key={user.id} className="border-b">

                <td className="px-4 py-3 flex items-center gap-2">

                  <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                    {user.name.charAt(0)}
                  </div>

                  {user.name}

                </td>

                <td className="px-4 py-3">{user.email}</td>

                <td className="px-4 py-3">
                  <Badge variant="outline">
                    {user.role}
                  </Badge>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`font-medium ${
                      user.status === "active"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className="px-4 py-3">

                  <div className="flex gap-1">

                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button size="sm" variant="ghost">
                      <Shield className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-white">

          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredUsers.length)} of{" "}
            {filteredUsers.length} users
          </p>

          <div className="flex items-center gap-2">

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) => prev - 1)
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index}
                size="sm"
                variant={
                  currentPage === index + 1
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setCurrentPage(index + 1)
                }
              >
                {index + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => prev + 1)
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

          </div>

        </div>

      </div>

    </div>
  )
}

export default ManageUsers