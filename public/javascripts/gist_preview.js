function GistPreview(sandboxLanguages, callback) {
  var form = $("#gist_form"),
      input = $("input[type=text]", form),
      spinner = $(".spinner", form),
      list = $("#gist_list"),
      title = $("#gist_title"),

  self = {
    fetchGist: function () {
      spinner.show();
      $.getJSON("https://api.github.com/gists/" + input.val() + "?callback=?", callback);
    },

    displayGistFiles: function (data) {
      var displayGist = function (filename, opts) {
        var link = function () {
          return '<a href="' + opts.raw_url + '" class="raw" target="_blank">' + filename + '</a>';
        }

        var controls = function () {
          if (~sandboxLanguages.indexOf(opts.language))
            return '<a class="run btn" href="#run">Run</a><a class="edit" href="#edit">Edit</a>';
          else if (opts.language === "CSS")
            return '<a class="add btn" href="#add">Add</a><a class="edit" href="#edit">Edit</a><span class="info"></span>';
          else
            return '';
        }

        var iframe = function () {
          if (~sandboxLanguages.indexOf(opts.language))
            return '<iframe></iframe>';
          else
            return '';
        }

        var content = function () {
          var code = '<pre><code class="' + self.highlightLanguage(opts.language) + '">' + opts.content.replace(/</g, "&lt;").replace(/>/g, "&gt;") + '</code></pre>',
              textarea = '<textarea>' + opts.content + '</textarea>';

          return '<div class="content">' + code + textarea + '</div>';
        }

        list.append('<li class="gist" data-language="'+ opts.language + '">' + link() + content() + controls() + iframe() + '</li>');
      }

      var displayTitle = function (data) {
        var date = new Date(Date.parse(data.created_at));
        title.html('<a href="' + data.html_url + '" target="_blank">' + data.description + '</a>' + '<div>' + date.toLocaleString() + '</div>');
      }

      list.empty();
      displayTitle(data);
      $.each(data.files, displayGist);
      $("pre code").each(function(i, e) { hljs.highlightBlock(e, '    ') });
    },

    highlightLanguage: function (language) {
      if (language == 'HTML+ERB')
        return 'html';
      else 
        return '';
    },

    bindEvents: function () {
      // Setup submit button
      $(".submit", form).click(function (e) { 
        e.preventDefault();
        form.submit(); 
      });

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
      spinner.hide();
      self.bindEvents();
      if (input.val() != "") self.fetchGist();
    }
  };

  self.init();

  return {
    parseResponse: function (response) {
      spinner.hide();
      if (response.meta.status != 200) {
        list.empty();
        title.empty();
        alert(response.data.message);
      } else {
        self.displayGistFiles(response.data);
      }
    }
  };
}
