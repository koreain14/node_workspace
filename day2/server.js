/*
http 내장모듈로만은 완전한 웹서버를 구축하기엔 너무 부족하다!
따라서 express 모듈을 사용해봅시다!
express 모듈이란? 웹서버 구축에 필요한 기능들을 위해 http모듈에
추가시켜 놓은 *외부모듈*!!(http의 업그레이드 모듈 but 두 모듈은 같이 사용해야 한다!)
*/

/*
ejs 모듈을 이용하면, html문서 내에서 반복문 등의 기초적인 자바스크립트
프로그래밍 문법이 적용될 수 있다.
*/


var http=require("http");
var express=require("express"); // 외부
var fs=require("fs");
var mysql=require("mysql"); // 외부
var bodyParser=require("body-parser"); //외부
var ejs=require("ejs"); // 외부

//express모듈로 부터 application객체를 반환 생성하자.

var app=express();

app.use(bodyParser.json());// json 지원
app.use(bodyParser.urlencoded({extended:true}));// form 태그로 전송될 경우 이 속성지정해야 함.


// mysql 서버에 접속!!
var client=mysql.createConnection({
	"url":"localhost",
	"user":"root",
	"password":""
});

client.query("use iot"); // 사용할 DB 선택!!

// 게시물 목록 보기 요청처리!!
app.route("/list").get(function(request,response){
	// list.html 페이지를 읽어들인 결과를 page변수에 담음
	var page=fs.readFileSync("./list.html","utf8");

	// 응답 전에 이미 데이터베이스에서 레코드들을 가져왔어야 한다!
	client.query("select * from student",function(error,records){
		if(!error){
			console.log(records);
			response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
			response.end(ejs.render(page,{dataList:records})); // 클라이언트에게 응답을 하는 시점!! ejs가 가능한 html
			// page를 렌더링 하면서 두번째 인수로 전달한 객체를 랜더링 대상이 되는 html에 전달해 준다!

		}else{
			console.log("망했어ㅠ");
		}
		
	});

});


// application 객체란? 웹서버 역할을 담당할 객체!
// 웹서버의 역할은 요청에 대해 응답을 처리하는 역할!

// app.use() 메서드 안에는 미들웨어라고 불리는 각종 express의 지원 함수들이 자리 잡을 수 있다.

// 라우팅 미들웨어를 사용해본다. route란 방향을 잡는 것을 말하고,
// Nodejs에서는 원하는 페이지를 나오게 처리해준다!

// 클라이언트가 get방식으로 요청을 시도하면 동작하게 될 메서드!!

// 등록폼을 원하면!!
app.route("/regist_form").get(function(request, response){
	//data 읽기!!
	var data=fs.readFileSync("./regist_form.html","utf8");
	response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
	response.end(data);
});

// 클라이언트가 등록을 원하면... post방식으로 요청할 경우
// 서버에서는 post() 메서드로 받아야한다!!
app.route("/regist").post(function(request, response){
	// 클라이언트가 보낸 데이터를 받고!!
	// express 모듈 사용 시, request가 업그레이드가 되었기 때문에
	// param() 메서드를 사용할 수 있다.

	var data=request.body;

	var id=data.id; 
	var pwd=data.pwd; 
	var name=data.name;
	
	console.log(id);
	console.log(pwd);
	console.log(name);

	//받은 데이터를 데이터베이스에 넣는다!!
	// 쿼리문 수행 후, 두번째 인수인 익명함수가 작동한다. 개발자는 
	// 여기서 등록 or 실패 여부를 확인할 수 있다.
	client.query("insert into student(id,pwd,name) values ('"+id+"','"+pwd+"','"+name+"')",function(error,records,field){
		if(error){
			console.log("등록 실패입니다.");
		}else{
			console.log("등록 성공입니다.");

			// 리스트 페이지에 대한 요청!!
			// 클라이언트의 브라우저로 하여금, 지정한 url로 요청을 다시 시도하라는 명령!
			// 화면전환!! list 페이지로!!
			response.redirect("/list");
		}
	});

});

// 상세보기 요청이 들어오면...
app.route("/detail/:id").get(function(request, response){ //:id detail뒤에 변수가 하나 따라온다!!
	var detail=fs.readFileSync("./detail.html","utf8");

	// 데이터베이스 연동이 되어야 한다.
	// 유저가 선택한 id를 get방식으로 넘겨 받았어야 한다!!
	console.log(request.params.id);


	client.query("select * from student where id='"+request.params.id+"'",function(error, records){
		if(!error){
			console.log(records);
			response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
			response.end(ejs.render(data,{obj:records}));
		}else{
			console.log("없어");
		}
	});
});

//삭제요청 처리
app.route("/delete/:id").get(function(request,response){
	var id=request.params.id;
	client.query("delete from student where id='"+id+"', function(error, records){
		if(!error){
			response.redirect("/list");
		}else{
			console.log("삭제실패");
		}
	});
});


//서버 구동시작!
var server=http.createServer(app);
server.listen(8383,function(){
	console.log("Server is running at 8383");
});