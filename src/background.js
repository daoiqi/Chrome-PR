function makehash(u) {
	var zF = function(a, b) {
		var z = parseInt(80000000, 16);
		if(z & a) {
			a = a >> 1;
			a &= ~z;
			a |= 0x40000000;
			a = a >> (b - 1);
		} else
			a = a >> b;
		return a;
	}, mix = function(a, b, c) {
		a -= b; a -= c; a ^= (zF(c, 13));
		b -= c; b -= a; b ^= (a << 8);
		c -= a; c -= b; c ^= (zF(b, 13));
		a -= b; a -= c; a ^= (zF(c, 12));
		b -= c; b -= a; b ^= (a << 16);
		c -= a; c -= b; c ^= (zF(b, 5));
		a -= b; a -= c; a ^= (zF(c, 3));
		b -= c; b -= a; b ^= (a<<10);
		c -= a; c -= b; c ^= (zF(b, 15));
		return new Array((a), (b), (c));
	}, GoogleCH = function(url) {
		length = url.length;
		var a = 0x9E3779B9, b = 0x9E3779B9, c = 0xE6359A60, k = 0,len = length, mx = new Array();
		while(len >= 12) {
			a += (url[k+0] + (url[k+1] << 8) + (url[k+2] << 16) + (url[k+3] << 24));
			b += (url[k+4] + (url[k+5] << 8) + (url[k+6] << 16) + (url[k+7] << 24));
			c += (url[k+8] + (url[k+9] << 8) + (url[k+10] << 16) + (url[k+11] << 24));
			mx = mix(a, b, c);
			a = mx[0];
			b = mx[1];
			c = mx[2];
			k += 12;
			len -= 12;
		}
		c += length;
		switch(len) {
			case 11: c += url[k+10] << 24;
			case 10: c += url[k+9] << 16;
			case 9: c += url[k+8] << 8;
			case 8: b += url[k+7] << 24;
			case 7: b += url[k+6] << 16;
			case 6: b += url[k+5] << 8;
			case 5: b += url[k+4];
			case 4: a += url[k+3] << 24;
			case 3: a += url[k+2] << 16;
			case 2: a += url[k+1] << 8;
			case 1: a += url[k];
		}
		mx = mix(a, b, c);
		return mx[2] < 0 ? 0x100000000 + mx[2] : mx[2];
	}, strord = function(string) {
		var result = new Array();
		for(i = 0; i < string.length; i++)
			result[i] = string[i].charCodeAt(0);
		return result;
	};
	return GoogleCH(strord('info:'+u));
}


var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
	
var prY=9.5;

var imageData = context.getImageData(0, 0, 19, 19);


function UpdateObject() {
	this.PR = 0,//网页的PR值
	this.alexa = 0,//网页的alexa值
	this.alexaWidth = 0,//显示alexa的宽度
	this.prWidth = 0,//显示pr的宽度
	this.url = "",
	this.tabId = 0,
	this.displayValue="?",

	this.getAlexa = function (url){
		url = 'http://data.alexa.com/data?cli=10&url=' + url;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, false);
		xhr.send(null);
		var xmlDoc = xhr.responseXML;
		var alexainfo = xmlDoc.documentElement.getElementsByTagName("POPULARITY")[0];
		var alexaRank=alexainfo.getAttribute("TEXT");
		console.log("alexa="+alexaRank);
		return alexaRank;
	},
	this.getPR = function(url){
		var pr = "?";
		try{
			pr = this.getPR3(url);
		}catch(e){
			console.log(e);
			pr = this.getPR2(url);
		}
		return pr;
	},
	this.getPR1 = function(url) {//没有pr值，可能为空
		//http://toolbarqueries.google.com.hk/tbr?client=navclient-auto&ch=61780561228&ie=UTF-8&oe=UTF-8&features=Rank:FVN&q=info:http://www.daoiqi.com/iptv6.html
		var url = 'http://toolbarqueries.google.com.hk/tbr?client=navclient-auto&ie=UTF-8&oe=UTF-8&features=Rank:FVN&ch=6' + makehash(url) + '&q=info:' + url;
		var xhr = new XMLHttpRequest();
		console.log("url="+url);
		xhr.open('GET', url, false);
		xhr.send(null);
		var text = xhr.responseText;
		console.log(text);
		return text.substr(9, 2).replace(/\s$/,'');
	},
	this.getPR2 = function(url){
		var url = 'http://tool.boliquan.com/pr/pr.php?alt='+url;
		var xhr = new XMLHttpRequest();
		console.log("url="+url);
		xhr.open('GET', url, false);
		xhr.send(null);
		var text = xhr.responseText;
		console.log(text);
		return text;
	},
	this.getPR3 = function(url){
		url=url.replace(/^(https?:\/\/)/,"");
        var url = 'http://pr.links.cn/getpr.asp?queryurl=' + url;
		var xhr = new XMLHttpRequest();
		console.log("url="+url);
		xhr.open('GET', url, false);
		xhr.send(null);
		var text = xhr.responseText;
		var match =null;
		if(match = text.match(/pagerank(\d+)/)){
			return match[1];
		}else{
			return "?";
		}

	}
	/**
	 * 设置alexa
	 */
	this.setAlexa = function (alexa){
		this.alexa = alexa;
		var INTERVAL=7;//0~7 1,11,101,1K,1W,10W,100W,1000W
		var i=0;var temp=alexa;
		while(temp/10>1){
			temp/=10;
			i++;
		}
		this.alexaWidth=alexa ==0 ? 0:(INTERVAL-i)/INTERVAL*19;	
	},
	this.setPR = function(pr){
		this.PR= pr ;
		var INTERVAL = 10;//区间
		this.prWidth = pr*18/INTERVAL;	
	},

	this.updatePR=function (url) {
		//var pr = this.getPR(url);
		// console.log("pr="+pr);

		var domain = url.match(/^(http|https):\/\/([\w.]+)(:\d+)?/);
			//if(domain != null) {
		var value = this.getPR(url);
		this.displayValue = value;
		if(value == '' || isNaN(value * 1)) {
			url = domain[2];
			value = this.getPR(url);
			value = value == '' || isNaN(value * 1) ? 0 : value ;
			this.displayValue = value == '' || isNaN(value * 1) ? '?' : value + 'h';
		}

		this.setPR(value);
		this.updateIcon();
		
	},
	this.updateAlexa=function(url){
		var alexa = this.getAlexa(this.url);
		this.setAlexa(alexa);
		this.updateIcon();
	},
	this.getIcon=function(){
		//alexa
		context.clearRect(1, 1, 18, 6);
		context.fillStyle = 'blue';
		context.fillRect(0,0, this.alexaWidth,7);
		context.strokeStyle ="#000";
		context.lineWidth = 1;
		context.strokeRect(0,0,19,7.5);

		//pr
		context.clearRect(1, 10, 18, 7);
		context.fillStyle = 'green';
		context.fillRect(1,prY+0.5,this.prWidth,7);
		context.strokeStyle ="#000";
		context.lineWidth = 1;
		context.strokeRect(0,prY,19,8);//

		var imageData = context.getImageData(0, 0, 19, 19);
		return imageData;
	},
	this.setURL=function(url,tabId){
		this.url = url;
		this.tabId = tabId;
		this.updateAlexa(this.url);
		this.updatePR(this.url);
		
	},
	this.updateIcon=function(){
		var icon = this.getIcon();
		var pr = ""+this.PR;
		var displayValue = this.displayValue;
		var tabId = this.tabId;
		chrome.browserAction.setBadgeText({text: displayValue, 'tabId': tabId});
		chrome.browserAction.setBadgeBackgroundColor({color: displayValue == '?' ? [190, 190, 190, 230] : [208, 0, 24, 255], 'tabId': tabId});
		chrome.browserAction.setTitle({title: ("Alexa Rank is "+this.alexa+"\r\n")+(displayValue == '?' ? ' no PR ' : this.url + "  PR is " + displayValue), 'tabId': tabId});
		chrome.browserAction.setIcon({imageData: icon, 'tabId': tabId});
	}

}



chrome.browserAction.setBadgeBackgroundColor({color: [210, 210, 210, 230]});
chrome.browserAction.setBadgeText({text: '?'});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo,tab) {
	console.log(changeInfo);
	if( changeInfo.status == 'loading' ){
		var url = tab.url;
		var updateobj = new UpdateObject();
		
		if(url != undefined) {
			var domain = url.match(/^(http|https):\/\/([\w.]+)(:\d+)?/);
			if(domain != null) {
				updateobj.setURL(tab.url.split('#')[0], tabId);
			} else{
				//updatePR('?', url, tabId,0);
			}
		}
	}
	
});