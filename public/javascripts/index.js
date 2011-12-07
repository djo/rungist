function GistPreview(callback) {
  var form = $('#gist_form'),
      input = $('input[type=text]', form),
      list = $("#gist_files"),

  self = {
    fetchGist: function () {
      var gist = input.val(),
          url = "https://api.github.com/gists/" + gist + "?callback=?";
      $.getJSON(url, callback);
    },

    displayGistFiles: function (data) {
      list.empty();

      $.each(data.files, function (filename, opts) {
        var link = '<a href="' + opts.raw_url + '">' + filename + '</a>',
            content = '<textarea rows="10" cols="50">' + opts.content + '</textarea>',
            button = '',
            result = '<div class="result"></div>';

        // Prepare action button for supported languages
        if (~RG.sandboxLanguages.indexOf(opts.language))
          button = '<a class="run" href="#run">Run</a>';
        else if (~RG.clientLanguages.indexOf(opts.language))
          button = '<a class="apply" href="#apply">Apply</a>';

        list.append('<li class="gist">' + link + '<br />' + content + '<br />' + button + '<br />' + result + '</li>');
        $('.gist:last', list).data("language", opts.language);
      });
    },

    bindEvents: function() {
      // Submit form handler
      form.submit(function (e) {
        e.preventDefault();
        var gist = input.val();
        if (gist != "") {
          history.pushState(null, '', gist);
          self.fetchGist();
        }
      });

      // History changes handler
      $(window).bind("popstate", function () {
        var gist = location.pathname.split('/')[1];
        if (gist != "") {
          input.val(gist);
          self.fetchGist();
        }
      });
    },

    init: function () {
      if (input.val() != "") self.fetchGist();
      self.bindEvents();
    }
  };

  self.init();

  return {
    parseResponse: function (response) {
      if (response.meta.status != 200) {
        alert(response.data.message);
        list.empty();
      } else {
        self.displayGistFiles(response.data);
      }
    }
  };
}

function RunGist () {
  var list = $("#gist_files"),

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
    },

    applyGist: function (e) {
      e.preventDefault();

      var link = $(this),
          gist = link.parents('li.gist'),
          language = gist.data('language'),
          textarea = $('textarea', gist),
          result = $('.result', gist);

      if (language == 'JavaScript') {
        $('body').append('<script type="text/javascript">' + textarea.val() + '</script>');
        result.html("The JavaScript was executed on the page.");
      } else if (language == 'CSS') {
        $('body').append('<style type="text/css">' + textarea.val() + '</style>');
        result.html("The stylesheet was applied to the page.");
      }
    },

    bindEvents: function () {
      list.on('click', '.run', self.runGist);
      list.on('click', '.apply', self.applyGist);
    },

    init: function () {
      self.bindEvents();
    }
  };

  return self.init();
}
