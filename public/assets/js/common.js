var is_moblie,SLIDE,CATID,BCID,SUBFIXED,ONCONTEXT,ONCOPY,ONSELECT,NAVCOLOR,NAVLEFT;
$(function () {
//==========导航
var that,datacid;
$(".nav ul li").hover(function () {
		that = $(this),
		dcid = $(this).attr("data-cid");
		that.addClass("on").siblings("li").removeClass("on");
    },function () {
    	//判断是否当前栏目
    	$(".nav ul li").each(function(i, v) {
    		datacid = $(this).attr("data-cid");
    		if(datacid == CATID && datacid != undefined || BCID == datacid){
    			$(this).addClass("on");
    			return false;
    		}
    	});
	    if(dcid != BCID){
	    	$(this).removeClass("on");
	    }
    	
});
$(".nav ul li .childer a").hover(function () {
	$(this).css({"border-color":NAVLEFT});
},function(){
	$(this).css({"border-color":''});
});
//==========右侧最小高度
$(".content-right").css('min-height',$(window).height() - $(".footer").outerHeight() - 60);
//==========搜索
$(".submit").mouseover( function () {
	$(this).css({"margin-left":10+'px'});
	$(".keyword").animate({
		"width" : 330+'px'
	}, 300).show().focus();
});

$(".submit").on("click", function () {
	var val = $(".keyword").val();
	if ( $.trim(val) == "" ) {
	$(".keyword").focus();
	  		return false;
  	}
  	return true;
})

//==========外链
  $(".wl ul li").hover(function() {
  	$(this).children('a.show-pic').stop().animate({
  		"margin-top" : -38 + 'px'
  	}, 300)
  }, function() {
  	$(this).children('a.show-pic').stop().animate({
  		"margin-top" : 0
  	}, 300)
  });

//==========特效(上移)
if (is_moblie != 1 && SLIDE != 1) {
if (!(/msie [6|7|8|9]/i.test(navigator.userAgent))){
    new WOW().init();
    };
}
//==========首页导航悬浮
if (CATID == "") {
	var _header = $(".header").offset().top;
	$(document).scroll(function () {
		var _scroll = $(document).scrollTop();
		if(_scroll > _header) {
			$("#drop").addClass("fixed");
		} else{
			$("#drop").removeClass("fixed");
		}
	})
}
//==========内容页子菜单悬浮
if ($.trim(CATID) != '' && SUBFIXED != 1) {
	if ($('.subcate')[0]) {
        // 子菜单浮动
        $(window).load(function() {
        	var scrollObj = $('.subcate');
	        if (scrollObj[0]) {
	            if (scrollObj.height() < $('.content-right').height()) {
	                var offsetLeft      = scrollObj.offset().left,
	                    objOffsetTop    = scrollObj.offset().top - 55,
	                    objHeight       = scrollObj.height(),
	                    windowHeight    = $(document).height(),
	                    objFooter       = $('.footer'),
	                    footer          = objFooter.offset().top,
	                    footerMarginTop = objFooter.css('margin-top'),
	                    footerMarginTop = footerMarginTop.replace('px', '');
	                $(window).scroll(function(e){
	                    var scrollTop = $(document).scrollTop();
	                    if (scrollTop >= objOffsetTop) {
	                        scrollObj.addClass('n-fixed');
	                        if ( scrollTop >= ( footer - objHeight - parseInt(footerMarginTop))) {
	                            scrollObj.css({'top':(-((objHeight+scrollTop+objFooter.height()+parseInt(footerMarginTop))-windowHeight + 80))+'px'});
	                        }
	                    } else {
	                        scrollObj.removeClass('n-fixed');
	                    }
	                });  
	            }
	        }
	    });
    }
}
//=========返回顶部
$("#get_top").on("click",function () {
      $("body,html").animate({
        scrollTop : 0
      }, 1000);
});
//禁止右键
if (ONCONTEXT) {
	document.oncontextmenu = function (event){
		if(window.event){
		    event = window.event;
		}try{
			var the = event.srcElement;
			if (!((the.tagName == "INPUT" && the.type.toLowerCase() == "text") || the.tagName == "TEXTAREA")){
			return false;
		}
		    return true;
		}catch (e){
		    return false; 
		} 
	}
}
//屏蔽复制
if (ONCOPY) {
	document.oncopy = function (event){
		if(window.event){
		    event = window.event;
		}try{
	      var the = event.srcElement;
	if(!((the.tagName == "INPUT" && the.type.toLowerCase() == "text") || the.tagName == "TEXTAREA")){
	      return false;
	  }
	      return true;
	}catch (e){
	      return false;
	  }
	}
}
//屏蔽选中
if (ONSELECT) {
	document.onselectstart = function (event){
		if(window.event){
		    event = window.event;
		}try{
		    var the = event.srcElement;
		if (!((the.tagName == "INPUT" && the.type.toLowerCase() == "text") || the.tagName == "TEXTAREA")){
		    return false;
		}
		    return true;
		} catch (e) {
		    return false;
		}
	}
}










})