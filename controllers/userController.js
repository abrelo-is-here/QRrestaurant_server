import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../lib/AuthContext";
import {
  Trash2,
  UtensilsCrossed,
  Hash,
  MapPin,
  Phone,
  Plus,
  Loader2,
  Pencil,
} from "lucide-react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { host } from "../../lib/Api";

function Restaurants() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${host}/api/restaurants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRestaurants(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleEdit = (id) => {
    navigate(`/admin/edit-restaurant/${id}`);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this branch? All associated staff and menu data will be lost."
      )
    )
      return;

    try {
      await axios.delete(`${host}/api/restaurants/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Branch removed");

      setRestaurants((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete branch");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus =
        currentStatus === "active" ? "inactive" : "active";

      await axios.patch(
        `${host}/api/restaurants/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`Branch ${newStatus}`);

      setRestaurants((prev) =>
        prev.map((r) =>
          r._id === id
            ? {
                ...r,
                status: newStatus,
              }
            : r
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] flex-col">
        <Loader2
          size={50}
          className="animate-spin text-sky-600"
        />

        <p className="mt-4 text-slate-500 font-semibold">
          Loading branches...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-10 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <UtensilsCrossed className="text-sky-600" />
            My Branches
          </h1>

          <p className="text-slate-500 mt-2">
            Manage all restaurant branches.
          </p>
        </div>

        <Link
          to="/admin/create-restaurant"
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl font-bold transition"
        >
          <Plus size={18} />
          Add Branch
        </Link>
      </div>

      {/* Empty */}
      {restaurants.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center shadow">
          <UtensilsCrossed
            size={60}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-5 text-xl font-bold">
            No branches found
          </h2>

          <p className="text-slate-500 mt-2">
            Create your first restaurant branch.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition"
            >
              {/* Image */}
              <div className="relative h-56 bg-slate-100">
                {restaurant.logo ? (
                  <img
                    src={restaurant.logo}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gradient-to-r from-sky-500 to-blue-700">
                    <UtensilsCrossed
                      size={55}
                      className="text-white/30"
                    />
                  </div>
                )}

                <span
                  className={`absolute top-4 right-4 px-4 py-1 rounded-full text-xs font-bold text-white ${
                    restaurant.status === "active"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {restaurant.status}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold">
                  {restaurant.name}
                </h2>

                <div className="mt-5 space-y-3 text-slate-600">
                  <div className="flex gap-2">
                    <MapPin
                      size={18}
                      className="text-sky-600"
                    />
                    {restaurant.address}
                  </div>

                  <div className="flex gap-2">
                    <Phone
                      size={18}
                      className="text-sky-600"
                    />
                    {restaurant.phone}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-5 border-t flex justify-between items-center">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Hash size={12} />
                    {restaurant._id.slice(-6)}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Edit */}
                    <button
                      onClick={() =>
                        handleEdit(restaurant._id)
                      }
                      className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600"
                    >
                      <Pencil size={18} />
                    </button>

                    {/* Status */}
                    <button
                      onClick={() =>
                        handleToggleStatus(
                          restaurant._id,
                          restaurant.status
                        )
                      }
                      className={`px-3 py-2 rounded-xl text-xs font-bold ${
                        restaurant.status === "active"
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {restaurant.status === "active"
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() =>
                        handleDelete(restaurant._id)
                      }
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Restaurants;
