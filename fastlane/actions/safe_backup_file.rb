module Fastlane
  module Actions
    module SharedValues
      SAFE_BACKUP_FILE_CUSTOM_VALUE = :SAFE_BACKUP_FILE_CUSTOM_VALUE
    end

    class SafeBackupFileAction < Action
      def self.run(params)
        # fastlane will take care of reading in the parameter and fetching the environment variable:
        path = params[:path]
        FileUtils.cp(path, "#{path}_back", preserve: true)
        UI.message "Successfully created a backup: #{params[:path]}_back"
        # sh "shellcommand ./path"

        # Actions.lane_context[SharedValues::SAFE_BACKUP_FILE_CUSTOM_VALUE] = "my_val"
      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        'This action backs up your file to "[path]_back"'
      end

      def self.details
        # Optional:
        # this is your chance to provide a more detailed description of this action
        'You can use this action to do cool things...'
      end

      def self.available_options
        # Define all options your action supports.

        # Below a few examples
        [
          FastlaneCore::ConfigItem.new(key: :path,
                                       env_name: 'FL_SAFE_BACKUP_FILE_API_TOKEN', # The name of the environment variable
                                       description: 'Path to the file you want to backup', # a short description of this parameter
                                       optional: false),

        ]
      end

      def self.output
        # Define the shared values you are going to provide
        # Example
        [
          ['SAFE_BACKUP_FILE_CUSTOM_VALUE', 'A description of what this value contains'],
        ]
      end

      def self.return_value
        # If your method provides a return value, you can describe here what it does
      end

      def self.authors
        # So no one will ever forget your contribution to fastlane :) You are awesome btw!
        ['Your GitHub/Twitter Name']
      end

      def self.is_supported?(_platform)
        # you can do things like
        #
        #  true
        #
        #  platform == :ios
        #
        #  [:ios, :mac].include?(platform)
        #

        # platform == :ios
        true
      end
    end
  end
end
