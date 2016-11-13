var express = require('express');
var path = require('path');
var port = process.env.PORT || 3000;
var app = express();

app.set('views',path.join(__dirname,'./'));          //设置路由
app.use(express.static(path.join(__dirname,'./')));   //引入静态文件
app.listen(port);

app.get('/',function(req,res){
	res.sendfile('index.html');
});
console.log('yes!');
