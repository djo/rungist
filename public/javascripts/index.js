function fetchGist () {
  var gistId = $('input[type=text]', this).val();
  if (gistId != "") $.getJSON("https://api.github.com/gists/" + gistId + "?callback=?", displayGistFiles);
  return false;
}

function displayGistFiles (response) {
  if (response.meta.status != 200) {
    alert(response.data.message);
    return;
  }

  var list = $("#gist_files");
  $.each(response.data.files, function (filename, opts) {
    list.append("<li><a href='" + opts.raw_url + "'>" + filename + "</a></li>");
  });
}
