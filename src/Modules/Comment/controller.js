const Comments = require('../../Models/Comments')

class Controller {
    async showComment(req, res, next) {
        try {
            const comments = await Comments.find({}).lean()

            if (!comments) {
                return res.status(404).json({msg: 'comment not found'})
            };

            return res.status(200).json({msg: 'Get blogs succesfully', 
                                         data: comments, });
        } catch(err) {
            next(err);
        }   
    }

    async addComment(req, res, next) {
        try {
            const {content, blogId} = req.body;
            const { _id} = req.user;
            const comment = await Comments.create({ userId: _id, content, blogId});
    
            if (!comment) {
                return res.status(400).json({msg: 'create comment failed'});
            };

            return res.status(201).json({msg: 'Create comment succesfully', data: comment});

        }  catch(err) {
            next(err);
        }
    }

    async editComment(req, res, next) {
        try {
            const commentId = req.params.id;
            const {content} = req.body;
            const{ _id} = req.user;

            const comment = await Comments.findById(commentId);

            if (!comment) {
                return res.status(404).json({msg: 'Comment not found'});
            } else if (_id != comment.userId) {
                return res.status(401).json({msg: 'You cannot edit this comment'});
            }

            comment.content = content;
            await comment.save();

            return res.status(201).json({msg: 'Edit comment succesfully', data: comment});
            //check comment trong blog, check blog có tồn tại, kiểm tra người đăng
        } catch(err) {
            next(err);
        };
    }

    async deleteComment(req, res, next) {
        try {
            const commentId = req.params.id;
            const {_id} = req.user

            const comment = await Comments.findById(commentId);

            if (!comment) {
                return res.status(400).json({msg: 'Delete blog failed'});
            } else if (_id != comment.userId) {
                return res.status(401).json({msg: 'You cannot delete this comment'});
            }

            await Comments.findByIdAndDelete(commentId);

            return res.status(204).json({msg: 'Delete blog succesfully', comment});

        } catch(err) {
            next(err);
        }
   }
   
}

module.exports = new Controller