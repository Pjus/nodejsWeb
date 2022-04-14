const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author:'624d8fb1145da5686e57fdc9',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: {
                url: 'https://res.cloudinary.com/dixpvqcof/image/upload/v1649673024/YelpCamp/dn2ueb82udv5heusltkd.jpg',
                filename: 'YelpCamp/dn2ueb82udv5heusltkd'
              },
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima suscipit porro sequi eius veniam vel odio sed quae, nam voluptate nemo voluptatum a doloribus tempore iure ab culpa consectetur recusandae.",
            price,
            geometry:{
                typr:'Point',
                coordinates:[
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            }
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})