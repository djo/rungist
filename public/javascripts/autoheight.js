// iframe auto-height

(function ($) {

  $.fn.autoheight = function () {
    return this.each(function () {
      var iframe = $(this);
      var height = iframe.contents().find('body').height() + 50;
      iframe.height(height);
    });
  };

})(jQuery);
