const mongoose = require("mongoose");
const Review = require("./reviews");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url:String,
    filename:String
})

ImageSchema.virtual("thumbnail").get(function(){
    return this.url.replace('/upload', '/upload/w_200,h_200');
});

ImageSchema.virtual("listImage").get(function(){
    return this.url.replace('/upload', '/upload/ar_1.5,c_crop');
});

ImageSchema.virtual("showImage").get(function(){
    return this.url.replace('/upload', '/upload/ar_1,c_crop');
});



const CampgroundSchema = new Schema({
    title:String,
    price:Number,
    description:String,
    location:String,
    geometry:{
        type:{
            type:String,
            enum:['Point'],
        },
        coordinates:{
            type:[Number],
        }
    },
    images:[ImageSchema],
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if(doc){
        await Review.deleteMany({
            _id: {
                $in : doc.reviews
            }
        })
        console.log("DELETE");
    }
    
})

module.exports = mongoose.model("Campground", CampgroundSchema);