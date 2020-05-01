const mongoose = require('mongoose')



mongoose.connect('mongodb://127.0.0.1:27017/Scribble-dev', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => console.log('mongoDb connected'))
.catch(err => console.log(err))

