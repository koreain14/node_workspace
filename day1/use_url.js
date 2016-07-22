/*
내장 모듈 중 url 모듈을 학습한다 
Uniformed Resouce Locator : 자원의 위치 !!
*/
var url=require("url");

//특정 데이터로부터 의미있는 데이터를 추출하는 과정을
//가리켜 파싱이라 한다!! 
//url 객체의 parse메서드는, 지정한 url  정보에 대한 해석 후 json형태
//의 객체를 반환해준다!!
var obj=url.parse("http://news.naver.com/main/read.nhn?mode=LPOD&mid=sec&oid=001&aid=0008548583&isYeonhapFlash=Y");
console.log(obj);
