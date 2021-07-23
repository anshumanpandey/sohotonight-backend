'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('AppConfigs', "id", {
      autoIncrement: true,
    })
    await queryInterface.changeColumn('AssetBoughts', "id", {
      autoIncrement: true,
    })
    await queryInterface.changeColumn('ConversationModels', "id", {
      autoIncrement: true,
    })
    await queryInterface.changeColumn('InvitationModels', "id", {
      autoIncrement: true,
    })
    await queryInterface.changeColumn('LogModels', "id", {
      autoIncrement: true,
    })
    await queryInterface.changeColumn('MessageModels', "id", {
      autoIncrement: true,
    })
    await queryInterface.changeColumn('PaymentModels', "id", {
      autoIncrement: true,
    })
    await queryInterface.changeColumn('PictureModels', "id", {
      autoIncrement: true,
    })
    await queryInterface.changeColumn('PostModels', "id", {
      autoIncrement: true,
    })
    await queryInterface.changeColumn('ServiceModels', "id", {
      autoIncrement: true,
    })
    await queryInterface.changeColumn('UserModels', "id", {
      autoIncrement: true,
    })
    await queryInterface.changeColumn('UserServiceModels', "id", {
      autoIncrement: true,
    })
    await queryInterface.changeColumn('UserServiceModels', "id", {
      autoIncrement: true,
    })
    await queryInterface.changeColumn('VideoChatModels', "id", {
      autoIncrement: true,
    })
    await queryInterface.changeColumn('VideoChatToUsers', "id", {
      autoIncrement: true,
    })
    await queryInterface.changeColumn('VideoModels', "id", {
      autoIncrement: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
