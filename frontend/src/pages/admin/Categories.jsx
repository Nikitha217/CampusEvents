import { useEffect, useState } from "react";

import {
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

import {
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} from "../../services/categoryService";

const Categories = () => {

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [showModal, setShowModal] =
    useState(false);

  const [newCategory, setNewCategory] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [editModal, setEditModal] =
    useState(false);

  const [editCategoryId, setEditCategoryId] =
    useState("");

  const [editCategoryName, setEditCategoryName] =
    useState("");

  const [editDescription, setEditDescription] =
    useState("");

  const loadCategories =
    async () => {

      try {

        const data =
          await getCategories();

        setCategories(data);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    loadCategories();

  }, []);

  const handleAddCategory =
    async () => {

      if (!newCategory.trim())
        return;

      try {

        await createCategory({
          name: newCategory,
          description,
        });

        setNewCategory("");
        setDescription("");
        setShowModal(false);

        loadCategories();

      } catch (error) {

        console.error(error);
      }
    };

  const handleDelete =
    async (id) => {

      try {

        await deleteCategory(id);

        loadCategories();

      } catch (error) {

        console.error(error);
      }
    };

  const handleEditOpen =
    (category) => {

      setEditCategoryId(
        category.id
      );

      setEditCategoryName(
        category.name
      );

      setEditDescription(
        category.description || ""
      );

      setEditModal(true);
    };

  const handleEditSave =
    async () => {

      try {

        await updateCategory(
          editCategoryId,
          {
            name:
              editCategoryName,
            description:
              editDescription,
          }
        );

        setEditModal(false);

        loadCategories();

      } catch (error) {

        console.error(error);
      }
    };

  if (loading) {

    return (
      <div className="p-6">
        Loading categories...
      </div>
    );
  }

  return (

    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold">
            Categories
          </h1>

          <p className="text-muted-foreground">

            Manage event categories

          </p>

        </div>

        <Button
          onClick={() =>
            setShowModal(true)
          }
        >

          <Plus className="h-4 w-4 mr-2" />

          Add Category

        </Button>

      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

        {categories.map((cat) => (

          <div
            key={cat.id}
            className="border rounded-xl p-5 bg-white/5 backdrop-blur-xl"
          >

            <div className="flex justify-between">

              <FolderOpen />

              <div className="flex gap-2">

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleEditOpen(cat)
                  }
                >

                  <Edit className="h-4 w-4" />

                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleDelete(cat.id)
                  }
                >

                  <Trash2 className="h-4 w-4 text-red-500" />

                </Button>

              </div>

            </div>

            <h3 className="font-semibold mt-4">

              {cat.name}

            </h3>

            <p className="text-sm text-slate-500 mt-2">

              {cat.description}

            </p>

          </div>

        ))}

      </div>

      {/* ADD MODAL */}

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 w-full max-w-md">

            <h2 className="font-bold text-xl mb-4">

              Add Category

            </h2>

            <Input
              placeholder="Category Name"
              value={newCategory}
              onChange={(e) =>
                setNewCategory(
                  e.target.value
                )
              }
            />

            <textarea
              className="w-full border rounded-2xl p-3 mt-4"
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
            />

            <Button
              className="w-full mt-4"
              onClick={
                handleAddCategory
              }
            >

              Create Category

            </Button>

          </div>

        </div>

      )}

      {/* EDIT MODAL */}

      {editModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 w-full max-w-md">

            <h2 className="font-bold text-xl mb-4">

              Edit Category

            </h2>

            <Input
              value={
                editCategoryName
              }
              onChange={(e) =>
                setEditCategoryName(
                  e.target.value
                )
              }
            />

            <textarea
              className="w-full border rounded-2xl p-3 mt-4"
              value={
                editDescription
              }
              onChange={(e) =>
                setEditDescription(
                  e.target.value
                )
              }
            />

            <Button
              className="w-full mt-4"
              onClick={
                handleEditSave
              }
            >

              Save Changes

            </Button>

          </div>

        </div>

      )}

    </div>
  );
};

export default Categories;