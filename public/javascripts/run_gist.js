function RunGist () {
  var iframe = $("#gist_scope"),
      scope = iframe.contents().find("body"),

  self = {
    runGist: function (e) {
      e.preventDefault();

      var link = $(this),
          gist = link.parents('li.gist'),
          language = gist.data('language'),
          textarea = $('textarea', gist),
          result = $('.result', gist);

      $.post('/run', { code: textarea.val(), language: language })
       .success(function (data) { result.html(data); })
       .error(function (jqXHR) { alert(jqXHR.responseText); });

      iframe.autoheight(); 
    },

    applyGist: function (e) {
      e.preventDefault();

      var link = $(this),
          gist = link.parents('li.gist'),
          language = gist.data('language'),
          textarea = $('textarea', gist),
          result = $('.result', gist);

      scope.append('<style type="text/css">' + textarea.val() + '</style>');
      result.html("The stylesheet was applied to the page.");
      iframe.autoheight();
    },

    bindEvents: function () {
      scope.on('click', '.run', self.runGist);
      scope.on('click', '.apply', self.applyGist);
    },

    init: function () {
      self.bindEvents();
    }
  };

  return self.init();
}
