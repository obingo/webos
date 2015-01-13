var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
    
var AppSchema = new Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    desc: { type: String, default: '' },
    score: { type: Number, default: 0 },
    vote_count: { type: Number, default: 0 },
    author: { type: ObjectId, ref: 'User', required: true },
    has_public: {type: Boolean, default: false },
    available: { type: Boolean, default: true },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date }
});

AppSchema.pre('save', function(next) {
    this.update_at = new Date();
    next();
});

AppSchema.methods.format = function format() {
    var appObject = {};

    appObject.id = this._id;
    appObject.title = this.title;
    appObject.url = this.url;
    appObject.desc = this.desc;
    appObject.has_public = this.has_public;

    return appObject;
};

mongoose.model('App', AppSchema);