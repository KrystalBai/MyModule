var fs=require('fs');
var request=require('request');
var cheerio=require('cheerio');
var URL=require('url-parse');

var i=1,MAX_PAGES_TO_VISIT=400,pageToVisit=[],pagesVisited={},allBookLinks=[],numPagesVisited=0;
while(i<=MAX_PAGES_TO_VISIT){
	pageToVisit.push("https://www.amazon.cn/s/ref=sr_pg_"+i+"?rh=n%3A116087071%2Cn%3A%21116089071%2Cn%3A%21116176071%2Cn%3A1337022071&page="+i+"&ie=UTF8&qid=1470712387");
	i++;
}

crawl();
function crawl(){
	if(numPagesVisited>=MAX_PAGES_TO_VISIT){
		console.log("Reached max limit of number of pages to visit.");
		fs.writeFile('BookLinks.json', JSON.stringify(allBookLinks, null, 4),function(err){
		    console.log('File successfully written! - Check your project directory for the output.json file');
		});
		return;
	}
	var nextPage=pageToVisit.shift();
	if(nextPage in pagesVisited){
		crawl();
	}else{
		visitPage(nextPage,crawl);
	}
}

function visitPage(url,callback){
	console.log("Visiting page "+url);
	request(url,function(error, response, body){
		if(error){
			console.log("Error: "+error);
		}
		var statusCode=response.statusCode;
		console.log(statusCode);
		if(statusCode!==200){
			pageToVisit.unshift(url);
			setTimeout(function() {
			    callback();
			}, 3000);
			return;
		}else{
			pagesVisited[url]=true;
			numPagesVisited++;
			var $=cheerio.load(body);
			$("li[id^='result']").find("a[class='a-link-normal s-access-detail-page  a-text-normal']").each(function(index,item){
				allBookLinks.push({"title":$(item).text(),"url":$(item).attr('href')});
			});
			setTimeout(function() {
			    callback();
			}, 3000);
		}
	})
}



