var express = require('express');
var path = require('path');
var app = express();
var PORT = process.argv.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 86400000 }));


app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

app.get('*', function(req, res){
    res.end("Error 404");
})

app.listen(PORT, function(){
  console.log("Listening to http://localhost:" + PORT);
})