const Blogs = require("../../Models/Blogs");

class Controller {
  async showBlog(req, res, next) {
    try {
      const totalCount = await Blogs.countDocuments({});

      const { limit, currentPage } = req.query;
      const blogs = await Blogs.find({})
        .populate({
          path: "author",
          select: "username avatarImage",
        })
        .skip((limit <= 0 ? 1 : limit) * (currentPage - 1))
        .limit(limit)
        .lean();

      if (!blogs) {
        return res.status(404).json({ msg: "blogs not found" });
      }

      return res
        .status(200)
        .json({ msg: "Get blogs succesfully", data: blogs, totalCount });
    } catch (err) {
      next(err);
    }
  }

  async addBlog(req, res, next) {
    try {
      const { title, description, content } = req.body;
      const { _id } = req.user;

      const blog = new Blogs({
        author: _id,
        title,
        description,
        content,
      });
      // const blog = await Blogs.create({ author: _id, title, description,content, postImage});
      if (req.file) {
        blog.postImage = req.file.path;
      }

      await blog.save();
      if (!blog) {
        return res.status(400).json({ msg: "create blog failed" });
      }

      return res
        .status(201)
        .json({ msg: "Create blog succesfully", data: blog });
    } catch (err) {
      next(err);
    }
  }

  async editBlog(req, res, next) {
    try {
      const blogId = req.params.id;
      const { _id } = req.user;
      const { title, content, postImage } = req.body;

      const blog = await Blogs.findOne({ _id: blogId });

      if (!blog) {
        return res.status(404).json({ msg: "Blog not found" });
      } else if (_id != blog.author) {
        return res.status(401).json({ msg: "You cannot edit this blog" });
      }

      blog.title = title;
      blog.content = content;
      blog.postImage = postImage;
      await blog.save();

      return res.status(201).json({ msg: "Edit blog succesfully"});
    } catch (err) {
      next(err);
    }
  }

  async deleteBlog(req, res, next) {
    try {
      const blogId = req.params.id;
      const { _id } = req.user;

      const blog = await Blogs.findById(blogId);

      if (!blog) {
        return res.status(400).json({ msg: "Delete blog failed" });
      } else if (_id != blog.author) {
        return res.status(401).json({ msg: "You cannot delete this blog" });
      }

      await Blogs.findByIdAndDelete(blogId);

      return res.status(204).json({ msg: "Delete blog succesfully", blog });
    } catch (err) {
      next(err);
    }
  }

  async searchBlog(req, res, next) {
    try {
      const keyword = req.query.title;

      const blogs = await Blogs.find({
        title: { $regex: keyword },
      });

      if (!blogs) {
        return res.status(400).json({ msg: "Blog Not Found" });
      }

      return res.status(200).json({ blog: blogs });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new Controller();
