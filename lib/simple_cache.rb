module Sinatra
  module SimpleCache

    def self.registered(app)
      app.helpers Helpers
    end

    module Helpers

      # Writes the content to a file in the public directory and returns it.
      def cache(content, filename)
        return content unless production?

        # Cache file path
        path = File.join(File.dirname(__FILE__), '..', 'public', filename)

        # Create the directory if it doesn't exist
        FileUtils.mkdir_p File.dirname(path)

        # Write the file
        File.open(path, 'w') { |f| f.write(content) }

        # Return the content to the current response
        content
      end

    end

  end
end
