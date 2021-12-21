'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('VideoChatModels', 'uuid', {
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
  }
};
