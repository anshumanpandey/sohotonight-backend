'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'VideoChatModels',
        'startDatetime',
        {
          type: Sequelize.DataTypes.DATE,
          defaultValue: null
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'VideoChatModels',
        'endDatetime',
        {
          type: Sequelize.DataTypes.DATE,
          defaultValue: null
        },
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
  }
};