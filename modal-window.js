/**
 * 模态窗弹出插件
 * 插件依赖：jQuery
 * 样式依赖：.shade, .modal-window
 * .shade{position:fixed;top:0;right:0;bottom:0;left:0;display:none;z-index:1050;overflow:hidden;-webkit-overflow-scrolling:touch;outline:0;background-color:#333}
 * .modal-window{min-width:600px;margin:30px auto;position:relative;display:inline-block}
 * 外置调用方法：ModalWindow.open()，ModalWindow.close()
 * 
 */

(function() {
    'use strict';
    // 元素jQuery对象
    var _$element = null;
    // 传入参数
    var _options = null;
    // 浏览器y轴滚动信息
    var _windowOverflowY = null;
    // 模态窗元素id数组
    var _modalWindowIdArray = new Array();
    var _modalWindowOptionsArray = new Array();

    var ModalWindow = function() {

        // 全局事件监听
        addGlobalLinstener();
    }

    // 默认值
    ModalWindow.DEFAULTS = {
        speed: 400,
        backdrop: true,
        keyboard: true
    }

    // 浏览器隐藏滚动
    function windowHiddenScroll() {
        // 隐藏浏览器滚动
        var $body = $(window.document.body);
        if ($body.find('.shade:visible').length == 1) {
            _windowOverflowY = $body.css('overflow-y');
            $body.css('overflow-y', 'hidden');
        }
    }

    // 浏览器还原滚动
    function windowRestoreScroll() {
        // 还原浏览器滚动
        var $body = $(window.document.body);
        if ($body.find('.shade:visible').length == 0) {
            $body.css('overflow-y', _windowOverflowY);
        }
    }

    // 显示模态窗
    function showModal() {
        // 模态窗元素
        var $dialog = _$element.find('.modal-window');
        // 遮罩层渐入
        _$element.fadeIn(_options.speed);
        // 设置元素居中
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        var modalWidth = $dialog.outerWidth(true);
        var modalHeight = $dialog.outerHeight(true);
        // 设置元素竖直居中
        if (windowHeight > modalHeight) {
            $dialog.css('top', (1 - modalHeight / windowHeight) / 2 * 100 + '%');
        }
        // 设置元素水平居中
        if (windowWidth > modalWidth) {
            $dialog.css('left', (1 - modalWidth / windowWidth) / 2 * 100 + '%');
        }
        // 元素宽度大于浏览器宽度
        if (modalWidth > windowWidth) {
            _$element.css('overflow-x', 'auto');
        }
        // 元素高度大于浏览器高度
        if (modalHeight > windowHeight) {
            _$element.css('overflow-y', 'auto');
        }
        // 模态窗元素id数组添加窗体id
        _modalWindowIdArray.push(_$element.attr('id'));
        // 模态窗元素设置数组添加窗体设置
        _modalWindowOptionsArray.push(_options);
        // 浏览器隐藏滚动
        windowHiddenScroll();
        // 添加隐藏监听
        addModalListener(_$element);
    }

    // 隐藏模态窗
    function hideModal($element) {
        // 模态窗元素id数组中移除元素id
        var index = _modalWindowIdArray.indexOf($element.attr('id'));
        if (index > -1) {
            _modalWindowIdArray.splice(index, 1);
            _modalWindowOptionsArray.splice(index, 1);
        }
        // 元素隐藏
        $element.fadeOut(_options.speed, function() {
            // 浏览器还原滚动
            windowRestoreScroll();
        });
        // 如果模态窗属于远程模态窗，移除模态窗元素
        if (_options && _options.remote) {
            $element.remove();
        }
    }

    // 添加模态窗元素内事件监听
    function addModalListener($element) {
        // 模态窗关闭按钮点击事件
        $element.off('click').on('click', '.close,[data-dismiss="modal"]', function(event) {
            hideModal($element);
        });
        // 监听模态窗遮罩层点击
        if (_options.backdrop == true) {
            $element.off('click').on('click', function(event) {
                if ($(event.target).hasClass('shade')) {
                    hideModal($element);
                }
            });
        }
    };

    // 添加全局事件监听
    function addGlobalLinstener() {
        // 监听键盘退出按键
        $(document).on('keyup', function(event) {
            if (event.which === 27 && _modalWindowOptionsArray[_modalWindowIdArray.length - 1].keyboard == true) {
                if (_modalWindowIdArray.length > 0) {
                    hideModal($('#' + _modalWindowIdArray[_modalWindowIdArray.length - 1]));
                }
            }
        });
    }

    // 显示内联模态窗
    function showInline(elementId) {
        _$element = $('#' + elementId);
        showModal();
    }

    // 显示远程模态窗
    function showRemote() {
        if (_options.remote) {
            var id = 'shade' + (new Date()).getTime();
            var html = '<div id="' + id + '" class="shade"><div class="modal-window"></div></div>';
            $(window.document.body).append(html)
            _$element = $('#' + id);
            var $dialog = _$element.find('.modal-window');
            $dialog.load(_options.remote, function() {
                showModal();
            });
        }
    }

    // ModalWindow公开方法

    /**
     * [open 显示ModalWindow]
     * @param  {[string, json]} option [传入参数：元素Id，配置参数]
     */
    ModalWindow.prototype.open = function(option) {
        if (option) {
            _options = $.extend({}, ModalWindow.DEFAULTS, typeof option === 'object' && option);
            if (typeof option === 'string') {
                showInline(option);
            } else if (typeof option === 'object') {
                if (_options.elementId) {
                    showInline(_options.elementId);
                } else if (_options.remote) {
                    showRemote();
                }
            }
        }
    }

    /**
     * [close 关闭最上层的ModalWindow]
     */
    ModalWindow.prototype.close = function() {
        if (_modalWindowIdArray.length > 0) {
            hideModal($('#' + _modalWindowIdArray[_modalWindowIdArray.length - 1]));
        }
    }

    // 实例化ModalWindow
    window.ModalWindow = new ModalWindow();
})();