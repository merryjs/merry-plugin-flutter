module Fastlane
  module Actions
    module SharedValues
      SAFE_RESTORE_FILE_CUSTOM_VALUE = :SAFE_RESTORE_FILE_CUSTOM_VALUE
    end

    class SafeRestoreFileAction < Action
      def self.run(params)
        # fastlane will take care of reading in the parameter and fetching the environment variable:
        path = params[:path]
        backup_path = "#{path}_back"
        UI.user_error!("Could not find file '#{backup_path}'") unless File.exist? backup_path
        FileUtils.cp(backup_path, path, {preserve: true})
        FileUtils.rm(backup_path)
        UI.message("Successfully restored backup 📤")

        # sh "shellcommand ./path"

        # Actions.lane_context[SharedValues::SAFE_RESTORE_FILE_CUSTOM_VALUE] = "my_val"
      end

      #####################################################
      # @!group Documentation
      #####################################################

      def self.description
        'This action restore your file that was backuped with the `safe_backup_file` action'
      end

      def self.details
        # Optional:
        # this is your chance to provide a more detailed description of this action
        "You can use this action to do cool things..."
      end

      def self.available_options
        # Define all options your action supports.

        # Below a few examples
        [
          FastlaneCore::ConfigItem.new(key: :path,
                                       description: "Original file name you want to restore",
                                       optional: false),
        ]
      end

      def self.output
        # Define the shared values you are going to provide
        # Example
        [
          ['SAFE_RESTORE_FILE_CUSTOM_VALUE', 'A description of what this value contains'],
        ]
      end

      def self.return_value
        # If your method provides a return value, you can describe here what it does
      end

      def self.authors
        # So no one will ever forget your contribution to fastlane :) You are awesome btw!
        ["Your GitHub/Twitter Name"]
      end

      def self.is_supported?(platform)
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
