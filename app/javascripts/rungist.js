// Mustache syntax for templates
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g,
  evaluate: /\{\%(.+?)\%\}/g
}

$.ajaxSetup({ error: function (jqXHR) { alert(jqXHR.responseText); }})

// Application namespace
RG = { Models: {}, Views: {}, Config: {} }

$(function () {

  RG.Models.GistFile = Backbone.Model.extend({
    highlightLanguage: function () {
      return (this.get("language") === "HTML+ERB" ? "html" : "")
    },

    highlightContent: function () {
      return this.get("content").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    },

    languageType: function () {
      var lang = this.get("language");
      if (~RG.Config.sandboxLanguages.indexOf(lang)) { return "sandbox" }
      else if (lang === "CSS") { return "stylesheet" }
      else { return "" }
    }
  })

  RG.GistFiles = new (Backbone.Collection.extend({
    model: RG.Models.GistFile,
    localStorage: new Store("gists-backbone")
  }))

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

      var attrs = _.extend(this.model.toJSON(), properties)

      this.$el.html(this.template(attrs))
      this.$el.data("language", this.model.get("language"))
      this.$("pre code").each(function(i, e) { hljs.highlightBlock(e, '    ') })

      return this
    },

    runGist: function (e) {
      e.preventDefault()

      var code = this.$("textarea").val(),
          iframe = this.$("iframe"),
          spinner = this.$(".spinner"),
          language = this.$el.data("language")

      spinner.css('display', 'inline-block')

      $.ajax({ 
        url: "/run",
        type: "POST",
        data: { code: code, language: language },
        complete: function () { 
          spinner.hide(); 
        },
        success: function (data) {
          iframe.contents().find("body").html(data);
          iframe.show();
          iframe.autoheight();
        }
      })
    },

    editGist: function (e) {
      e.preventDefault()

      this.$(".edit").hide()
      this.$("pre").hide()
      this.$("textarea").show()
    },

    triggerAddStyles: function (e) {
      e.preventDefault()

      var info = this.$('.info'),
          styles = '<style>' + this.$('textarea').val() + '</style>'

      RG.AppView.trigger('gistview:addstyle', styles)
      info.html("The styles were added to all iframes.")
      setTimeout(function () { info.empty() }, 3000)
    },

    addStyles: function (styles) {
      var iframe = this.$("iframe")

      if (iframe.length) {
        iframe.contents().find('body').append(styles)
        iframe.autoheight()
      }
    }
  });

  RG.AppView = new (Backbone.View.extend({
    el: $("#app"),

    titleTemplate: _.template($('#title_template').html()),

    events: {
      "submit form": "fetchGist",
      "click #about .try": "runTryGist"
    },

    initialize: function () {
      _.bindAll(this, 'render', 'reset', 'runTryGist')

      RG.Config.sandboxLanguages = this.$('.languages').data('sandbox')

      RG.GistFiles.bind('reset', this.reset)

      this.bind('gistview:addstyle', this.addStyles)

      this.input = this.$('form input')
      this.title = this.$('#gist_title')
      this.spinner = this.$('form .spinner')
      this.about = this.$('#about')
      this.spinner.hide()
    },

    render: function (data) {
      RG.GistFiles.reset(_.values(data.files))

      this.input.val(data.id)

      this.title.html(this.titleTemplate({
        html_url: data.html_url,
        description: data.description,
        created_at: this._localeDate(data.created_at)
      }))

      this.spinner.hide()

      return this
    },

    fetchGist: function (e) {
      e.preventDefault()
      RG.Router.navigate(this.input.val(), { trigger: true })
    },

    runTryGist: function (e) {
      e.preventDefault()
      RG.Router.navigate(this.$('.try').attr('href'), { trigger: true })
    },

    reset: function () {
      var list = this.$('#gist_list')

      RG.GistFileViews = []
      list.empty()

      if (RG.GistFiles.length) {
        RG.GistFiles.each(function (gistFile) {
          var view = new RG.Views.GistFile({ model: gistFile })
          RG.GistFileViews.push(view)
          list.append(view.render().el)
        })

        this.about.hide()
      } else {
        this.about.show()
      }
    },

    showSpinner: function () {
      this.spinner.show()
    },

    addStyles: function (styles) {
      _.each(RG.GistFileViews, function (view) { 
        view.addStyles(styles)
      });
    },

    _localeDate: function (date) {
      if (_.isUndefined(date)) return ''
      var parsed = new Date(Date.parse(date))
      return parsed.toLocaleString()
    }
  }));

  RG.Router = new (Backbone.Router.extend({
    routes: {
      '':    'about',
      ':id': 'fetch'
    },

    about: function () {
      RG.AppView.render({})
    },

    fetch: function(id) {
      RG.AppView.showSpinner()

      $.getJSON("https://api.github.com/gists/" + id + "?callback=?", function (response) {
        RG.AppView.render(response.data)
        if (response.meta.status != 200) alert(response.data.message)
      })
    }
  }))

  Backbone.history.start({ pushState: true })
})
