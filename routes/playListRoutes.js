const express = require("express");
const router = express.Router();
const playlistController = require("../controllers/playListController");

// Basic playlist CRUD routes
router.post("/playlists", playlistController.createPlaylist);
router.get("/playlists", playlistController.getAllPlaylists);
router.get("/playlists/:id", playlistController.getPlaylistById);
router.put("/playlists/:id", playlistController.updatePlaylist);
router.delete("/playlists/:id", playlistController.deletePlaylist);

// Content management routes
router.post("/playlists/:id/contents", playlistController.addContentToPlaylist);
router.delete("/playlists/:id/contents/:contentId", playlistController.removeContentFromPlaylist);

// Assignment routes
router.post("/playlists/:id/assign-students", playlistController.assignToStudents);
router.post("/playlists/:id/assign-classes", playlistController.assignToClasses);

module.exports = router;