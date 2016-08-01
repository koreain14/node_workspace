/*------------------------------------------------------------------
Nodejs 기반 서버 구축
필요한 모듈(객체, 각종 함수 등이 모여있는 라이브러리)

웹서버 구축을 위해 필요한 모듈
http(필수) - 요청, 응답을 처리하는 모듈!!
express - http의 보완모듈
fs - html 문서를 보여주기 위한 파일 제어 모듈
router - 요청 url을 분석하여 알맞는 처리를 담당 및 요청, 응답에 
			필요한 부가적 기능을 보유한 기능
mysql - mysql 데이터베이스 핸들링 모듈!
body-parser : post 방식으로 데이터를 전송해 올 때, 그 데이터를
					분석해 주는 모듈
ejs : html 코드내에 동적 프로그래밍 코드를 삽입할 수 있는 모듈
-------------------------------------------------------------------*/

var http=require("http");
var express=require("express");
var fs=require("fs");
var mysql=require("mysql");
var bodyParser=require("body-parser");
var ejs=require("ejs");

var app=express(); // express모듈 얻기!

/*------------------------------------------------------------------
mysql 접속!! : 접속 후 반환되는 client객체를 이용하여
					쿼리문을 수행할 수 있다!!
------------------------------------------------------------------*/

var client=mysql.createConnection({
	url:"localhost",
	user:"root",
	password:""
});

client.query("use iot"); // 데이터베이스 선택!!

/*------------------------------------------------------------------
정적자원(이미지, css, html, 음원 등)을 접근하기 위한 경로설정
express 모듈에 삽입할 수 있는 부가적 함수들을 가리켜 미들웨어라고 한다!
------------------------------------------------------------------*/
app.use(express.static(__dirname)); // 루트를 지정!!
app.use(bodyParser.json());// 제이슨 형태로 데이터를 처리하겠다.
app.use(bodyParser.urlencoded({extended:true})); // from 데이터를 받아들이겠다는 미들웨어



/*------------------------------------------------------------------
요청 url에 따를 알맞은 처리(router 모듈 이용)
/board/writeFomr: 글쓰기 폼 요청!
------------------------------------------------------------------*/ 

app.route("/board/writeForm").get(function(request,response){
	var content=fs.readFileSync("./board/write.html","utf8"); // 지정한 파일 읽어서 변수로 담아 놓자!!
	response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
	response.end(content);

}); // 누군가 url 에 /board/writeForm 라고 치고 들어오면 내부 함수가 처리하겠다!!

/*------------------------------------------------------------------
/board/write 요청을 처리!!
------------------------------------------------------------------*/ 

app.route("/board/write").post(function(request,response){


	// 폼 양식으로 부터 전송되어 온 입력 양식 파라미터들을 받아서 mysql에 입력한다!, 서버가 먼저 받아야함!!

	console.log(request.body);

	var sql="insert into board(writer,title,content)";
	sql=sql+" values('"+request.body.writer+"','"+request.body.title+"','"+request.body.content+"')";
	console.log(sql);

	client.query(sql,function(error,data,fields){
		if(!error){
			console.log("입력성공");
			//var content=fs.readFileSync("./board/.html","utf8"); // 지정한 파일 읽어서 변수로 담아 놓자!!
			//response.end(content);

			//응답을 받는 클라이언트의 브라우저는 지정한 url로 다시 접속하라는 명령
			response.redirect("/board/list");

		}else{
			console.log("입력실패");
			response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
			var content=fs.readFileSync("./board/error.html","utf8"); // 지정한 파일 읽어서 변수로 담아 놓자!!
			response.end(content);
		}
	}); //문자열로 쿼리문 대입!!
});

/*------------------------------------------------------------------
/board/list 요청을 처리!!
------------------------------------------------------------------*/ 
app.route("/board/list/:page").get(function(request,response){
	response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
	// db를 조회하여 레코드를 가져와서, list.html에 전달!!
	// 데이터 전달을 위해서는 ejs 모듈이 사용된다!!

	var page=request.params.page;
	var pageSize=3;
	var num=(page-1)*pageSize;


	client.query("select * from board order by borad_id desc limit "+num+","+pageSize, function(error, records){
		// select결과물의 내용이 통채로 records에 들어감!!
		console.log(records);

		var content=fs.readFileSync("./board/list.html","utf8");

		//서버에서 ejs 문법을 먼저 실행시켜야 한다! 즉 <%%> 영역이 수행되게 하기 위해!!
		response.end(ejs.render(content, {dataList:records})); // dataList에 변수에 records를 담아서 전달!!
	});
	
});

/*------------------------------------------------------------------
 /board/detail 상세보기 요청 처리
 select * from board where board_id=유저가 선택한 board_id!
------------------------------------------------------------------*/ 

app.route("/board/detail/:borad_id").get(function(request, response){
	// --> board/detail/23 
	
	var sql="select * from board where borad_id="+request.params.borad_id;

	client.query(sql,function(error, record){
		// console.log(record);
		// 한건의 게시물을 상세보기 페이지에 출력해보자

		var page=fs.readFileSync("./board/detail.html","utf8");
		response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});		
		response.end(ejs.render(page,{data:record})); // record를 data로 가리킨다!
	});
});

/*------------------------------------------------------------------
	board/delete 글 한 건 삭제 요청처리!
 ------------------------------------------------------------------*/ 
app.route("/board/delete/:borad_id").get(function(request,response){
	var borad_id=request.params.borad_id;
	var sql="delete from board where borad_id="+borad_id;

	console.log(sql);

	//쿼리 수행 후, 게시물 목록을 보여줘야한다!

	client.query(sql, function(error, data){
		response.redirect("/board/list");
	});

});

/*------------------------------------------------------------------
	board/edit 게시물 글 한 건 수정요청!!
 ------------------------------------------------------------------*/ 
app.route("/board/edit").post(function(request,response){
	
	var postData=request.body;// post로 넘겨 받은 데이터
	var writer=postData.writer;
	var title=postData.title;
	var content=postData.content;
	var borad_id=postData.borad_id;

	var sql="update board set writer='"+writer+"', title='"+title+"', content='"+content+"'"
	sql=sql+" where borad_id="+borad_id

	console.log(sql);

	client.query(sql,function(error,data){
		// 상세보기로 재접속 시킨다 /board/detail/방금본 아이디
		response.redirect("/board/detail/"+borad_id);
	});
});



/*------------------------------------------------------------------
9999 서버가동
------------------------------------------------------------------*/ 
var server=http.createServer(app);
server.listen(9999,function(){
	console.log("server is running at 9999");

});




