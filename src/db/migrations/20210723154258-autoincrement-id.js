'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('AppConfigs', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
    })
    await queryInterface.changeColumn('AssetBoughts', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
    })
    await queryInterface.changeColumn('ConversationModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
    })
    await queryInterface.changeColumn('InvitationModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
    })
    await queryInterface.changeColumn('LogModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
    })
    await queryInterface.changeColumn('MessageModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
    })
    await queryInterface.changeColumn('PaymentModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
    })
    await queryInterface.changeColumn('PictureModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
    })
    await queryInterface.changeColumn('PostModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
    })
    await queryInterface.changeColumn('ServiceModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
    })
    await queryInterface.changeColumn('UserModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
    })
    await queryInterface.changeColumn('UserServiceModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
    })
    await queryInterface.changeColumn('UserServiceModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
    })
    await queryInterface.changeColumn('VideoChatModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
    })
    await queryInterface.changeColumn('VideoChatToUsers', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
    })
    await queryInterface.changeColumn('VideoModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
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
