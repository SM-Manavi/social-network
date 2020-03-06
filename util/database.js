const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://admin:l5uk5rz2DcQ0vD6d@myapp-guyz0.azure.mongodb.net/message?retryWrites=true&w=majority'

exports.connectToMongoDB = () => {
    return mongoose.connect(mongoURI, {
        useNewUrlParser    : true,
        useUnifiedTopology : true
    });
}

const db = mongoose.connection;

db.once('open', ()=>{
    console.log(`Connect to ${mongoURI}`);
})
