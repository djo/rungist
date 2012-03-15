// Use mustache syntax for templates
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g,
  evaluate: /\{\%(.+?)\%\}/g
};

// JQury ajax setup
$.ajaxSetup({ error: function (jqXHR) { alert(jqXHR.responseText); }});

// Application namespace
RG = { Models: {}, Views: {}, Config: {} };

$(function () {

  RG.Models.GistFile = Backbone.Model.extend({
    // Returns correct language name for highlighting
    highlightLanguage: function () {
      return (this.get("language") === "HTML+ERB" ? "html" : "");
    },

    // Returns escaped content for highlighting
    highlightContent: function () {
      return this.get("content").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },

    // Returns language type "sandbox", "stylesheet" or empty string
    languageType: function () {
      var lang = this.get("language");
      if (~RG.Config.sandboxLanguages.indexOf(lang)) { return "sandbox" }
      else if (lang === "CSS") { return "stylesheet" }
      else { return "" }
    }
  });

  RG.GistFiles = new (Backbone.Collection.extend({
    model: RG.Models.GistFile,
    localStorage: new Store("gists-backbone")
  }));

  RG.Views.GistFile = Backbone.View.extend({
    tagName: "li",

    className: "gist",

    template: _.template($('#gist_template').html()),

    events: {
      "click .run":  "runGist",
      "click .edit": "editGist",
      "click .add":  "triggerAddStyles"
    },

    initialize: function () {
      _.bindAll(this, "render", "runGist", "editGist", "triggerAddStyles");
    },

    render: function () {
      var properties = {
        highlightLanguage: this.model.highlightLanguage(),
        highlightContent: this.model.highlightContent(),
        languageType: this.model.languageType()
      };

      var attrs = _.extend(this.model.toJSON(), properties);

      this.$el.html(this.template(attrs));
      this.$el.data("language", this.model.get("language"));
      // Highlight the code block
      this.$("pre code").each(function(i, e) { hljs.highlightBlock(e, '    ') });

      return this;
    },

    // Runs code in the sandbox and puth the result into iframe
    runGist: function (e) {
      e.preventDefault();

      var code = this.$("textarea").val(),
          iframe = this.$("iframe"),
          spinner = this.$(".spinner"),
          language = this.$el.data("language");

      spinner.css('display', 'inline-block');

      $.ajax({ 
        url: "/run",
        type: "POST",
        data: { code: code, language: language },
        complete: function () { 
          spinner.hide(); 
        },
        success: function (data) {
          iframe.contents().find("body").html(data);
          iframe.autoheight();
        }
      });
    },

    // Displays text area
    editGist: function (e) {
      e.preventDefault();

      this.$(".edit").hide();
      this.$("pre").hide();
      this.$("textarea").show();
    },

    // Triggers the event to apply a stylesheet to all iframes
    triggerAddStyles: function (e) {
      e.preventDefault();

      var info = this.$('.info'),
          styles = '<style>' + this.$('textarea').val() + '</style>';

      RG.AppView.trigger('gistview:addstyle', styles);
      info.html("The styles were added to all iframes.");
      setTimeout(function () { info.empty() }, 3000);
    },

    // Adds stylesheet to the iframe
    addStyles: function (styles) {
      var iframe = this.$("iframe");

      if (iframe.length) {
        iframe.contents().find('body').append(styles);
        iframe.autoheight();
      }
    }
  });

  RG.AppView = new (Backbone.View.extend({
    el: $("#app"),

    titleTemplate: _.template($('#title_template').html()),

    events: {
      "submit form": "fetchGist",
    },

    initialize: function () {
      _.bindAll(this, 'render', 'reset');

      // Supported languages config
      RG.Config.sandboxLanguages = this.$('.languages').data('sandbox');

      // Bind reset on the collection
      RG.GistFiles.bind('reset', this.reset);

      // Bind adding stylesheet event
      this.bind('gistview:addstyle', this.addStyles);

      this.input = this.$('form input');
      this.title = this.$('#gist_title');
      this.spinner = this.$('form .spinner');
      this.spinner.hide();
    },

    render: function (data) {
      // Reset the list
      RG.GistFiles.reset(_.values(data.files));

      // Set an ID in the form input
      this.input.val(data.id);

      // Change the header
      this.title.html(this.titleTemplate({
        html_url: data.html_url,
        description: data.description,
        created_at: (new Date(Date.parse(data.created_at))).toLocaleString()
      }));

      this.spinner.hide();

      return this;
    },

    // Triggers navigation to a new gist
    fetchGist: function (e) {
      e.preventDefault();
      RG.Router.navigate(this.input.val(), { trigger: true });
    },

    // Displays all gist files in the list
    reset: function () {
      var list = this.$('#gist_list');

      RG.GistFileViews = [];
      list.empty();

      RG.GistFiles.each(function (gistFile) {
        var view = new RG.Views.GistFile({ model: gistFile });
        RG.GistFileViews.push(view);
        list.append(view.render().el);
      });
    },

    // Shows snippet on run gist event
    showSpinner: function () {
      this.spinner.show();
    },

    // Adds stylesheet to all views
    addStyles: function (styles) {
      _.each(RG.GistFileViews, function (view) { 
        view.addStyles(styles);
      });
    }
  }));

  RG.Router = new (Backbone.Router.extend({
    routes: { ":id": "fetch" },

    // Navigate to a new gist
    fetch: function(id) {
      RG.AppView.showSpinner();

      $.getJSON("https://api.github.com/gists/" + id + "?callback=?", function (response) {
        RG.AppView.render(response.data);
        if (response.meta.status != 200) alert(response.data.message);
      });
    }
  }));

  // Push state history
  Backbone.history.start({ pushState: true });

});
