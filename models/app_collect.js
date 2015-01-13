var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
    
var AppCollectSchema = new Schema({
    uid: { type: ObjectId, required: true, index: true },
    appid: { type: ObjectId, required: true, index: true },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now }
});

mongoose.model('AppCollect', AppCollectSchema);