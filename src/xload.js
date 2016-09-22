/**
 * 下拉更新
 * 作者：LeeJim
 */

;(function($){

  'use strict'

  var $win = $(window),
      $doc = $(document);

  // 处理滚动的通用函数
  var handleScroll; 

  $.fn.xload = function(options){
    return new Xload(this, options);
  };

  // 构造函数
  function Xload(element, options){
    var that = this;

    // jquery对象
    that.$element = element;

    // element对象
    that.element = element[0];

    // 是否正在加载
    that.isLoading = false;

    that.init(options);
  }

  // 初始化函数
  Xload.prototype.init = function(options){
    var that = this;
    // var $scrollArea = that.$element;

    that.opts = $.extend(false, {
      
      distance: 50,
      needAutoLoad: true,
      scrollArea: window,
      tolerance_MAX: 3,

      html_empty: '<p class="x-nomore">暂无数据</p>',
      html_nomore: '<p class="x-nomore">没有更多数据</p>',
      html_loading: '<p class="x-loading">正在加载...</p>'

    }, options);

    that.$empty = $(that.opts.html_empty);
    that.$nomore = $(that.opts.html_nomore);
    that.$loading = $(that.opts.html_loading);

    //成功加载次数
    that.successLoadTimes = 0;
    //失败加载次数
    that.failLoadTimes = 0; 

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
      if(that.opts.scrollArea == window){
        that.clientHeight = window.innerHeight;
      }
      else {
        that.clientHeight = that.element.clientHeight;
      }
    })

    // 自动加载至满屏
    that.autoLoad();

    handleScroll = that.handleScroll.bind(that);

    that.$scrollArea.on('scroll', handleScroll);
  }

  // 自动加载至满屏
  Xload.prototype.autoLoad = function(){
    var that = this;

    if( that.opts.needAutoLoad && (that.scrollHeight - that.opts.distance <= that.clientHeight) ) {
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

      // 请求成功时
      that.opts.onAjaxSuccess(data, function(options){

        // 更新容器的高度
        that.refreshScrollHeight();
        
        // 当返回数据错误时
        if(options.status === 'error') {

          that.failLoadTimes++;

          // 失败次数超过容忍次数 提示错误 停止加载
          if(that.failLoadTimes >= that.tolerance_MAX) {

            // 移除滚动事件
            that.remove(); 

            alert('网络异常，请重新加载')
          }
          else {

            setTimeout(function(){
              // 自动加载时执行的回调
              callback && callback.call(that);
            }, 2000);
          }
        }
        // 当没有更多数据、返回数据为空时
        else if(options.status === 'empty' || options.status === 'nomore'){

          that.successLoadTimes++;

          if(that.successLoadTimes === 1 && options.status === 'empty'){
            that.$element.append(that.$empty);
          }
          // 只有一页数据时不显示nomore
          else if(that.successLoadTimes !== 1 && (options.status === 'nomore' || options.status === 'empty') ){
            that.$element.append(that.$nomore);
          }
          // 移除滚动事件
          that.remove();
        }
        
        else {

          // 请求成功 将请求失败次数清0
          that.failLoadTimes = 0;
          
          // 请求成功 如果是自动加载至全屏则执行自动加载的回调
          callback && callback.call(that);
        }

      });
      
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

  // 移除下拉加载
  Xload.prototype.remove = function(){
    this.$scrollArea.off('scroll', handleScroll)
  }

  // 封装AJAX请求
  function _request(options, successCB, errorCB){
    $.ajax({
      type: 'POST',
      url: options.url,
      data: options.data,
      timeout: options.timeout || 10000,
      success: successCB,
      error: errorCB || function(error){
        alert(error)
      }
    })
  }
 

}(window.Zepto || window.jQuery))