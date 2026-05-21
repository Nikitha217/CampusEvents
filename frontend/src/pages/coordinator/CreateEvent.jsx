import { useState } from "react";

import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Image,
  FileText,
  CheckCircle2,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const CreateEvent = () => {

  const [successModal, setSuccessModal] =
    useState(false);

  const [previewImage, setPreviewImage] =
    useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    location: "",
    participants: "",
    duration: "",
    description: "",
  });

  // Input Change
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit
  const handleSubmit = (e) => {

    e.preventDefault();

    setSuccessModal(true);

    // Reset
    setFormData({
      title: "",
      category: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      location: "",
      participants: "",
      duration: "",
      description: "",
    });

    setPreviewImage("");
  };

  // Upload Image
  const handleImageUpload = (e) => {

    const file = e.target.files[0];

    if (file) {

      setPreviewImage(
        URL.createObjectURL(file)
      );
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>

        <h1 className="text-3xl font-bold">
          Create Event
        </h1>

        <p className="text-muted-foreground mt-1">
          Organize and manage your campus events
        </p>

      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="
          bg-white border rounded-2xl p-6
          max-w-5xl shadow-sm space-y-6
        "
      >

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Title */}
          <div className="space-y-2">

            <Label>Event Title</Label>

            <div className="relative">

              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />

              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                className="pl-10"
                required
              />

            </div>

          </div>

          {/* Category */}
          <div className="space-y-2">

            <Label>Category</Label>

            <Select
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  category: value,
                })
              }
            >

              <SelectTrigger>

                <SelectValue placeholder="Select category" />

              </SelectTrigger>

              <SelectContent>

                <SelectItem value="Technology">
                  Technology
                </SelectItem>

                <SelectItem value="Cultural">
                  Cultural
                </SelectItem>

                <SelectItem value="Business">
                  Business
                </SelectItem>

                <SelectItem value="Sports">
                  Sports
                </SelectItem>

                <SelectItem value="Academic">
                  Academic
                </SelectItem>

              </SelectContent>

            </Select>

          </div>

          {/* Start Date */}
          <div className="space-y-2">

            <Label>Start Date</Label>

            <div className="relative">

              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />

              <Input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="pl-10"
                required
              />

            </div>

          </div>

          {/* End Date */}
          <div className="space-y-2">

            <Label>End Date</Label>

            <div className="relative">

              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />

              <Input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="pl-10"
                required
              />

            </div>

          </div>

          {/* Start Time */}
          <div className="space-y-2">

            <Label>Start Time</Label>

            <div className="relative">

              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />

              <Input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="pl-10"
                required
              />

            </div>

          </div>

          {/* End Time */}
          <div className="space-y-2">

            <Label>End Time</Label>

            <div className="relative">

              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />

              <Input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="pl-10"
                required
              />

            </div>

          </div>

          {/* Duration */}
          <div className="space-y-2">

            <Label>Event Duration</Label>

            <Select
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  duration: value,
                })
              }
            >

              <SelectTrigger>

                <SelectValue placeholder="Select duration" />

              </SelectTrigger>

              <SelectContent>

                <SelectItem value="1 Day">
                  1 Day Event
                </SelectItem>

                <SelectItem value="2 Days">
                  2 Days Event
                </SelectItem>

                <SelectItem value="3 Days">
                  3 Days Event
                </SelectItem>

                <SelectItem value="4 Days">
                  4 Days Event
                </SelectItem>

                <SelectItem value="5+ Days">
                  5+ Days Event
                </SelectItem>

              </SelectContent>

            </Select>

          </div>

          {/* Participants */}
          <div className="space-y-2">

            <Label>Max Participants</Label>

            <div className="relative">

              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-600" />

              <Input
                type="number"
                name="participants"
                value={formData.participants}
                onChange={handleChange}
                placeholder="100"
                className="pl-10"
                required
              />

            </div>

          </div>

          {/* Location */}
          <div className="space-y-2 md:col-span-2">

            <Label>Location</Label>

            <div className="relative">

              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />

              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter venue"
                className="pl-10"
                required
              />

            </div>

          </div>

        </div>

        {/* Description */}
        <div className="space-y-2">

          <Label>Description</Label>

          <div className="relative">

            <FileText className="absolute left-3 top-4 h-4 w-4 text-blue-500" />

            <Textarea
              rows={5}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event..."
              className="pl-10"
              required
            />

          </div>

        </div>

        {/* Image Upload */}
        <div className="space-y-3">

          <Label>Upload Event Banner</Label>

          <label
            className="
              border-2 border-dashed rounded-2xl
              h-52 flex flex-col items-center justify-center
              cursor-pointer hover:bg-gray-50 transition
            "
          >

            <Image className="h-10 w-10 text-gray-400 mb-2" />

            <p className="text-sm text-muted-foreground">
              Click to upload image
            </p>

            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />

          </label>

          {/* Preview */}
          {previewImage && (

            <div className="relative rounded-2xl overflow-hidden border">

              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-64 object-cover"
              />

              <button
                type="button"
                onClick={() =>
                  setPreviewImage("")
                }
                className="
                  absolute top-3 right-3
                  bg-black/60 text-white
                  rounded-full p-1
                "
              >
                <X className="h-4 w-4" />
              </button>

            </div>

          )}

        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 pt-2">

          <Button
            type="submit"
            className="
              bg-gradient-to-r from-blue-700 to-teal-500
              text-white px-8
            "
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Create Event
          </Button>

          <Button
            type="reset"
            variant="outline"
            onClick={() => {

              setFormData({
                title: "",
                category: "",
                startDate: "",
                endDate: "",
                startTime: "",
                endTime: "",
                location: "",
                participants: "",
                duration: "",
                description: "",
              });

              setPreviewImage("");
            }}
          >
            Reset
          </Button>

        </div>

      </form>

      {/* Success Modal */}
      {successModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">

            <div className="flex justify-center mb-4">

              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">

                <CheckCircle2 className="h-10 w-10 text-green-600" />

              </div>

            </div>

            <h2 className="text-2xl font-bold mb-2">
              Event Created Successfully!
            </h2>

            <p className="text-muted-foreground mb-6">
              Your event has been submitted for approval.
            </p>

            <Button
              className="w-full"
              onClick={() =>
                setSuccessModal(false)
              }
            >
              Continue
            </Button>

          </div>

        </div>

      )}

    </div>
  );
};

export default CreateEvent;