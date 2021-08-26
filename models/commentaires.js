const mongoose = require('mongoose')

const commentairesSchema = mongoose.Schema({
    createur: {type: mongoose.Schema.Types.Objectif, ref: 'users'},
    content: String,
    date: Date,
    post: {type: mongoose.Schema.Types.Objectif, ref: 'posts'},
})

const CommentaireModel = mongoose.model('commentaires', commentairesSchema);

module.exports = CommentaireModel