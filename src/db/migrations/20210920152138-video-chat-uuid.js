module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('VideoChatModels', 'uuid', {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    });
  },

  down: async () => { },
};
