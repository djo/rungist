// Simple $.getJSON stubbing for the application testing.

(function( $ ){

  var oldMethod = jQuery.getJSON;

  jQuery.stubGetJSON = function (response) {
    jQuery.extend({
      getJSON: function (url, success) {
        success(response);
        return oldMethod;
      }
    });

  }

})(jQuery);
