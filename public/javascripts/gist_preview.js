function GistPreview(sandboxLanguages, callback) {
  var form = $("#gist_form"),
      input = $("input[type=text]", form),
      iframe = $("#gist_scope"),
      scope = iframe.contents().find("body"),
      list,

  self = {
    fetchGist: function () {
      var gist = input.val(),
          url = "https://api.github.com/gists/" + gist + "?callback=?";
      $.getJSON(url, callback);
    },

    displayGistFiles: function (data) {
      scope.empty();
      self.createList();

      $.each(data.files, function (filename, opts) {
        var link = '<a href="' + opts.raw_url + '">' + filename + '</a>',
            content = '<textarea rows="10" cols="50">' + opts.content + '</textarea>',
            button = '',
            result = '<div class="result"></div>';

        // Prepare action button for supported languages
        if (~sandboxLanguages.indexOf(opts.language))
          button = '<a class="run" href="#run">Run</a>';
        else if (opts.language == "CSS")
          button = '<a class="apply" href="#apply">Apply</a>';

        list.append('<li class="gist">' + link + '<br />' + content + '<br />' + button + '<br />' + result + '</li>');
        $('.gist:last', list).data("language", opts.language);
      });
      
      iframe.autoheight();
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

    createList: function () {
      scope.append('<ul id="gist_list"></ul>');
      list = $("#gist_list", scope);
    },

    init: function () {
      self.createList();
      if (input.val() != "") self.fetchGist();
      self.bindEvents();
    }
  };

  self.init();

  return {
    parseResponse: function (response) {
      if (response.meta.status != 200) {
        alert(response.data.message);
        scope.empty();
        self.createList();
        iframe.autoheight();
      } else {
        self.displayGistFiles(response.data);
      }
    }
  };
}
