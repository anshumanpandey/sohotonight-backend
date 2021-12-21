'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('VideoChatModels', 'startWithVoice', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'InvitationModels',
      'startWithVoice'
    );
  }
};
