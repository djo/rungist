function GistPreview(sandboxLanguages, callback) {
  var form = $("#gist_form"),
      input = $("input[type=text]", form),
      list = $("#gist_list"),

  self = {
    fetchGist: function () {
      var gist = input.val(),
          url = "https://api.github.com/gists/" + gist + "?callback=?";
      $.getJSON(url, callback);
    },

    displayGistFiles: function (data) {
      var displayGist = function (filename, opts) {
        var link = '<a href="' + opts.raw_url + '">' + filename + '</a>',
            content = '<textarea rows="10" cols="50">' + opts.content + '</textarea>',
            iframe = '<iframe></iframe>',
            button = '';

        if (~sandboxLanguages.indexOf(opts.language))
          button = '<a class="run" href="#run">Run</a>';
        else if (opts.language === "CSS")
          button = '<a class="add" href="#add">Add</a>';

        list.append('<li class="gist" data-language="'+ opts.language + '">' + link + '<br />' + content + '<br />' + button + '<br />' + iframe + '</li>');
      }

      list.empty();
      $.each(data.files, displayGist);
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
        list.empty();
        alert(response.data.message);
      } else {
        self.displayGistFiles(response.data);
      }
    }
  };
}
