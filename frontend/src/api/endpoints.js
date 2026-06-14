import { api } from "./client";

// ----- Auth -----
export const register = (data) =>
  api("/auth/register/", { method: "POST", body: data, auth: false });
export const login = (data) =>
  api("/auth/login/", { method: "POST", body: data, auth: false });
export const getMe = () => api("/auth/me/");

// ----- Imóveis -----
export const listProperties = (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== "" && v != null)
  ).toString();
  return api(`/properties/${query ? `?${query}` : ""}`);
};
export const getProperty = (id) => api(`/properties/${id}/`);
export const getBookedDates = (id) => api(`/properties/${id}/booked-dates/`);
export const getReviews = (id) => api(`/properties/${id}/reviews/`);
export const getMyProperties = () => api("/properties/mine/");
export const createProperty = (data) =>
  api("/properties/", { method: "POST", body: data });
export const updateProperty = (id, data) =>
  api(`/properties/${id}/`, { method: "PATCH", body: data });
export const deleteProperty = (id) =>
  api(`/properties/${id}/`, { method: "DELETE" });
export const listAmenities = () => api("/amenities/");

// ----- Favoritos -----
export const getFavorites = () => api("/favorites/");
export const checkFavorite = (propertyId) => api(`/favorites/check/${propertyId}/`);
export const toggleFavorite = (propertyId) =>
  api("/favorites/toggle/", { method: "POST", body: { property: propertyId } });

// ----- Reservas -----
export const createBooking = (data) =>
  api("/bookings/", { method: "POST", body: data });
export const getMyBookings = () => api("/bookings/");
export const getReceivedBookings = (status) =>
  api(`/bookings/received/${status ? `?status=${status}` : ""}`);
export const approveBooking = (id) =>
  api(`/bookings/${id}/approve/`, { method: "POST" });
export const rejectBooking = (id) =>
  api(`/bookings/${id}/reject/`, { method: "POST" });
export const cancelBooking = (id) =>
  api(`/bookings/${id}/cancel/`, { method: "POST" });
export const reviewBooking = (id, data) =>
  api(`/bookings/${id}/review/`, { method: "POST", body: data });
