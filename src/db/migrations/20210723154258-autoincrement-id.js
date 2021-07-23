'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('AppConfigs', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,
    })
    await queryInterface.changeColumn('AssetBoughts', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,
    })
    await queryInterface.changeColumn('ConversationModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,
    })
    await queryInterface.changeColumn('InvitationModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,
    })
    await queryInterface.changeColumn('LogModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,
    })
    await queryInterface.changeColumn('MessageModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,
    })
    await queryInterface.changeColumn('PaymentModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,
    })
    await queryInterface.changeColumn('PictureModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,
    })
    await queryInterface.changeColumn('PostModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,
    })
    await queryInterface.changeColumn('ServiceModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,
    })
    await queryInterface.changeColumn('UserModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,
    })
    await queryInterface.changeColumn('UserServiceModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,
    })
    await queryInterface.changeColumn('UserServiceModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,
    })
    await queryInterface.changeColumn('VideoChatModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,
    })
    await queryInterface.changeColumn('VideoChatToUsers', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,
    })
    await queryInterface.changeColumn('VideoModels', "id", {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      primaryKey: true,
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
