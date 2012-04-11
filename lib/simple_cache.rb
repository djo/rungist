module Sinatra
  module SimpleCache

    def self.registered(app)
      app.helpers Helpers
    end

    module Helpers

      # Writes the content to a file in the public directory.
      def cache(content, filename)
        return content unless production?

        path = File.join(File.dirname(__FILE__), '..', 'public', filename)
        FileUtils.mkdir_p File.dirname(path)
        File.open(path, 'w') { |f| f.write(content) }

        content
      end

    end

  end
end
