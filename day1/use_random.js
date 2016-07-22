//외부의 필요한 모듈을 사용하기 위해서는 require 함수안에
//필요한 모듈명을 명시하면 된다..
var mm=require("./mymodule");

//모듈 사용해보기~~
function test(){
	var r=mm.getRandom(5);
	console.log("5에 대한 랜덤값은 "+r);

	setTimeout(function(){
		test();
	}, 500);
}

test();

//test.png
var ext=mm.getExtend("test.png");
console.log(ext);