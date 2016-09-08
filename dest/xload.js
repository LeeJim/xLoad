/**
 * 下拉更新
 * 作者：LeeJim
 */

;(function($){

  'use strict'

  var $win = $(window),
      $doc = $(document),
      clientHeight = $win.height(); //设备浏览器高度

  $.fn.xload = function(options){
    return new Xload(this, options);
  };

  // 构造函数
  function Xload(element, options){
    var that = this;

    that.$element = element; //jquery对象
    that.element = element[0]; //element对象

    // 是否正在加载
    that.isLoading = false;

    that.init(options);
  }

  // 初始化函数
  Xload.prototype.init = function(options){
    var that = this;
    // var $scrollArea = that.$element;

    that.opts = $.extend(true, {
      loadFn: that.noop,
      distance: 50,
      needAutoLoad: true,
      scrollArea: window,

      html_nomore: '<p class="x-nomore">没有更多数据</p>',
      html_loading: '<p class="x-loading">正在加载...</p>'

    }, options);

    that.$nomore = $(that.opts.html_nomore);
    that.$loading = $(that.opts.html_loading);

    // 滚动区域的底部位置
    // that.scrollAreaBottom = $scrollArea.position().top + $scrollArea.height();

    if(that.opts.scrollArea == window) {
      that.$scrollArea = $win;
      that.scrollHeight = $doc.height();
      that.clientHeight = document.documentElement.clientHeight;
    }
    else {
      that.$scrollArea = that.$element;
      that.scrollHeight = that.element.scrollHeight;
      that.clientHeight = that.element.clientHeight;
    }

    // 调整窗口
    $win.on('resize', function(){

    })

    that.autoLoad();

    that.$scrollArea.on('scroll', that.handleScroll.bind(that));
  }

  // 默认函数
  Xload.prototype.noop = function(){

  };

  // 自动加载至满屏
  Xload.prototype.autoLoad = function(){
    var that = this;

    if( that.opts.needAutoLoad && (that.$scrollArea.height() - that.opts.distance <= that.clientHeight) ) {
      that.handleLoad(that.autoLoad);
    }
    else {
      that.opts.needAutoLoad = false;
    }
  }

  // 处理滚动监听
  Xload.prototype.handleScroll = function(){
    var that = this;

    if( !that.isLoading && (that.scrollHeight - that.opts.distance <= that.clientHeight + that.$scrollArea.scrollTop() ) ) {
      that.isLoading = true;

      that.handleLoad();
    }
  }

  // 处理数据加载
  Xload.prototype.handleLoad = function(callback){
    var that = this;

    that.$element.append(that.$loading);

    _request(that.opts.ajaxParams, function(data){
      that.isLoading = false;
      that.$loading.remove();
      that.opts.onAjaxSuccess(data);
      that.refreshScrollHeight();
    })
  }

  // 更新内容高度
  Xload.prototype.refreshScrollHeight = function(){

    var that = this;

    if(that.opts.scrollArea == window) {
      that.scrollHeight = $doc.height();
    }
    else {
      that.scrollHeight = that.element.scrollHeight;
    }
  }

  // 封装AJAX请求
  function _request(options, successCB, errorCB){
    $.ajax({
      type: 'POST',
      url: options.url,
      data: options.data,
      timeout: options.timeout || 3000,
      success: successCB,
      error: errorCB || function(error){
        alert(error)
      }
    })
  }
 

}(window.Zepto || window.jQuery))