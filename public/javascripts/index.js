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
        list.append("<li><a href='" + opts.raw_url + "'>" + filename + "</a></li>");
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
};

var jsonpCallback;

$(function () {
  var gp = new GistPreview(function (data) { jsonpCallback(data); });
  jsonpCallback = function (data) { gp.parseResponse(data) };
});
