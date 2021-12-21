'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('InvitationModels', 'createdByUserId', {
        type: Sequelize.DataTypes.INTEGER,
      });
      await queryInterface.addConstraint('InvitationModels', {
        fields: ['createdByUserId'],
        type: 'FOREIGN KEY',
        references: {
          table: 'UserModels',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
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
