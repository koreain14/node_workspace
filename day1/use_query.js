/*
nodejs 내장모듈 중 query string내장모듈을 학습한다
*/
var query=require("querystring");
var result=query.parse("http://news.naver.com/main/read.nhn?mode=LPOD&mid=sec&oid=001&aid=0008548934&isYeonhapFlash=Y");

console.log(result);