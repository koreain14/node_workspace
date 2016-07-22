/*
모듈은 개발자가 정의할 수도 있지만, 이미 nodejs 자체적
으로 제공되는 유용한 모듈도 있다!!
*/
var http=require("http"); //지금부터 http모듈을 사용하겠다!!
//http변수로 해당 모듈을 가리키겠다!!

var server=http.createServer(function(request, response){
	response.writeHead(200,{"Content-Type":"text/html"});
	response.end("<marquee>hi</marquee>");
}); //서버 모듈 가져오기!!

//웹서버 가동하기!!
server.listen(9999, function(){
	console.log("Server is running 9999 port...");
});