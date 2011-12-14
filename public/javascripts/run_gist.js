function RunGist () {
  var list = $("#gist_list"),

  self = {
    runGist: function (e) {
      e.preventDefault();

      var link = $(this),
          gist = link.parents('li.gist'),
          language = gist.data('language'),
          textarea = $('textarea', gist),
          iframe = $('iframe', gist);

      var display = function (data) {
        iframe.contents().find("body").html(data);
        iframe.autoheight();
      }

      $.post('/run', { code: textarea.val(), language: language }, display);
    },

    addStyles: function (e) {
      e.preventDefault();

      var link = $(this),
          gist = link.parents('li.gist'),
          stylesheet = '<style>' + $('textarea', gist).val() + '</style>';

      $("iframe", list).each(function () {
        var iframe = $(this);
        iframe.contents().find('body').append(stylesheet);
        iframe.autoheight();
      });

      gist.append("The stylesheet was applied to the page.");
    },

    bindEvents: function () {
      list.on('click', '.run', self.runGist);
      list.on('click', '.add', self.addStyles);
    },

    init: function () {
      self.bindEvents();
    }
  };

  return self.init();
}
