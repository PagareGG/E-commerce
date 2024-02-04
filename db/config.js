const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://ganesh:welcome123@cluster0.kbajltp.mongodb.net/E-comDash?retryWrites=true&w=majority',
).then(() => {
    console.log("db connected....");
})