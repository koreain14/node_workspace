function test(){
	console.log("test() 함수 호출!!");
	setTimeout(function(){
		test();
	}, 500);
}

test();