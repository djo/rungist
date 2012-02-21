function RunGist () {
  var list = $("#gist_list"),

  self = {
    runGist: function (e) {
      e.preventDefault();

      var link = $(this),
          gist = link.parents('li.gist'),
          language = gist.data('language'),
          textarea = $('textarea', gist),
          iframe = $('iframe', gist),
          spinner = $('.spinner', gist);

      var display = function (data) {
        iframe.contents().find("body").html(data);
        iframe.autoheight();
      }

      spinner.css('display', 'inline-block');

      $.post('/run', { code: textarea.val(), language: language })
       .success(display)
       .complete(function () { spinner.hide(); });
    },

    addStyles: function (e) {
      e.preventDefault();

      var link = $(this),
          gist = link.parents('li.gist'),
          info = $('.info', gist),
          stylesheet = '<style>' + $('textarea', gist).val() + '</style>';

      $("iframe", list).each(function () {
        var iframe = $(this);
        iframe.contents().find('body').append(stylesheet);
        iframe.autoheight();
      });

      info.html("The styles were added to all iframes.");
      setTimeout(function () { info.empty() }, 3000);
    },

    editGist: function (e) {
      e.preventDefault();

      var link = $(this),
          gist = link.parents('li.gist');

      $('pre', gist).hide();
      $('textarea', gist).show();
      link.hide();
    },

    bindEvents: function () {
      list.on('click', '.run', self.runGist);
      list.on('click', '.add', self.addStyles);
      list.on('click', '.edit', self.editGist);
    },

    init: function () {
      self.bindEvents();
    }
  };

  return self.init();
}
