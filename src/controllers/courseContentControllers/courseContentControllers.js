const {
  CourseContent,
  Course_Curriculum,
  Video,
  Game,
} = require("../../../models/CourseContent/courseContentSchema");

class courseContentControllers {
  async createCourseContent(req, res) {
    const { class_id, title, description, isPaid, type } = req.body;

    if (!class_id || !title || !description || !isPaid || !type) {
      return sendResponse(
        res,
        400,
        false,
        null,
        "class_id, title, description, thumbnail, isPaid, type"
      );
    }
    try {
      const newcourseContent = new CourseContent({
        class_id,
        title,
        description,
        isPaid,
        type,
      });

      const savedcourseContent = await newcourseContent.save();
      sendResponse(res, 200, true, savedcourseContent);
    } catch (error) {
      sendResponse(res, 500, false, null, error.message);
    }
  }

  async uploadCourse_data(req, res) {
    try {
      const { id } = req.body;
      if (!id) {
        return sendResponse(res, 400, false, null, "id");
      }
      const courseContent = await CourseContent.findOne({ _id: id });
      if (!courseContent) {
        return sendResponse(res, 404, false, null, "Course Content not found");
      }
      if (courseContent.type === "curriculum") {
        const { curriculum } = req.body;
        if (!curriculum || curriculum.length === 0) {
          return sendResponse(res, 400, false, null, "curriculum is required");
        }

        const savedCurriculum = await Course_Curriculum.insertMany(curriculum);
        courseContent.course_data = savedCurriculum.map((item) => ({
          item: item._id,
          type: "Course_Curriculum",
        }));
        await courseContent.save();
        return sendResponse(res, 200, true, savedCurriculum);
      } else if (courseContent.type === "video") {
        const { videos } = req.body;
        if (!videos || videos.length === 0) {
          return sendResponse(res, 400, false, null, "videos is required");
        }
        const savedVideos = await Video.insertMany(videos);
        courseContent.course_data = savedCurriculum.map((item) => ({
          item: item._id,
          type: "video",
        }));
        await courseContent.save();
        return sendResponse(res, 200, true, savedVideos);
      } else if (courseContent.type === "game") {
        const { games } = req.body;
        if (!games || games.length === 0) {
          return sendResponse(res, 400, false, null, "games is required");
        }
        const savedGames = await Game.insertMany(games);
        courseContent.course_data = savedCurriculum.map((item) => ({
          item: item._id,
          type: "game",
        }));
        await courseContent.save();
        return sendResponse(res, 200, true, savedGames);
      }
    } catch (error) {
      sendResponse(res, 500, false, null, error.message);
    }
  }
}

module.exports = new courseContentControllers();
