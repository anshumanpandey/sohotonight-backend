'use strict';

module.exports = {
  /**
 * @type {string}
 */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AppConfigs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      pricePerToken: {
        type: Sequelize.FLOAT(2, 2),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('AssetBoughts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      videoId: {
        type: Sequelize.INTEGER,
      },
      pictureId: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('ConversationModels', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      toUserId: {
        type: Sequelize.INTEGER,
      },
      createdByUserId: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('InvitationModels', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      videoChatId: {
        type: Sequelize.INTEGER,
      },
      toUserId: {
        type: Sequelize.INTEGER,
      },
      startWithVoice: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      senderUuid: {
        type: Sequelize.STRING(2000),
        allowNull: false
      },
      receiverUuid: {
        type: Sequelize.STRING(2000),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('LogModels', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      body: {
        type: Sequelize.STRING(5000),
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('MessageModels', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      body: {
        type: Sequelize.STRING(2000),
        allowNull: false
      },
      createdByUserId: {
        type: Sequelize.INTEGER,
      },
      conversationId: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('PaymentModels', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      transactionId: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('PictureModels', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      price: {
        type: Sequelize.FLOAT({ length: 10, decimals: 2 }),
        allowNull: true,
        defaultValue: null
      },
      awsKey: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      isFree: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('PostModels', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      body: {
        type: Sequelize.STRING(2000),
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('ServiceModels', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('UserModels', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      nickname: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      emailAddress: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      callNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      railStation: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      town: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      aboutYouSummary: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      aboutYouDetail: {
        type: Sequelize.STRING(2000),
        allowNull: true,
        defaultValue: null
      },
      orientation: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      postCode: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      dayOfBirth: {
        type: Sequelize.STRING,
        allowNull: false
      },
      monthOfBirth: {
        type: Sequelize.STRING,
        allowNull: false
      },
      yearOfBirth: {
        type: Sequelize.STRING,
        allowNull: false
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "United Kingdom",
      },
      tokensBalance: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      county: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      profilePic: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      authenticationProfilePic: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      bannerImage: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "MODEL"
      },
      inches: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      feet: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      isLogged: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      escortServices: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      allowSocialMediaMarketing: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      phoneChat: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      webcamWork: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      contentProducer: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      recievePromotions: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isTrans: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      hasAdultContentCertification: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      authenticationProfilePicIsAuthenticated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      resetPasswordToken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('UserServiceModels', {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      serivce: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })

    await queryInterface.createTable('UserServiceModels', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })

    await queryInterface.createTable('VideoChatModels', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      createdById: {
        type: Sequelize.INTEGER,
      },
      invitationId: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })

    await queryInterface.createTable('VideoChatToUsers', {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      videoChatId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })

    await queryInterface.createTable('VideoModels', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      price: {
        type: Sequelize.FLOAT({ length: 10, decimals: 2 }),
        allowNull: true,
        defaultValue: null
      },
      awsKey: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      isFree: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addConstraint('AssetBoughts', {
      fields:  ['userId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'UserModels',
        field: 'id',
      },
      onDelete: 'no action',
      onUpdate: 'cascade',
    })
    await queryInterface.addConstraint('AssetBoughts', {
      fields:  ['videoId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'VideoModels',
        field: 'id',
      },
      onDelete: 'no action',
      onUpdate: 'cascade',
    })
    await queryInterface.addConstraint('AssetBoughts', {
      fields:  ['pictureId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'PictureModels',
        field: 'id',
      },
      onDelete: 'no action',
      onUpdate: 'cascade',
    })

    await queryInterface.addConstraint('ConversationModels', {
      fields:  ['toUserId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'UserModels',
        field: 'id',
      },
      onDelete: 'no action',
      onUpdate: 'cascade',
    })
    await queryInterface.addConstraint('ConversationModels', {
      fields:  ['createdByUserId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'UserModels',
        field: 'id',
      },
      onDelete: 'no action',
      onUpdate: 'cascade',
    })


    await queryInterface.addConstraint('InvitationModels', {
      fields:  ['videoChatId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'VideoChatModels',
        field: 'id',
      },
      onDelete: 'no action',
      onUpdate: 'cascade',
    })
    await queryInterface.addConstraint('InvitationModels', {
      fields:  ['toUserId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'UserModels',
        field: 'id',
      },
      onDelete: 'no action',
      onUpdate: 'cascade',
    })

    await queryInterface.addConstraint('LogModels', {
      fields:  ['userId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'UserModels',
        field: 'id',
      },
      onDelete: 'set null',
      onUpdate: 'cascade',
    })


    await queryInterface.addConstraint('MessageModels', {
      fields:  ['createdByUserId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'UserModels',
        field: 'id',
      },
      onDelete: 'set null',
      onUpdate: 'cascade',
    })
    await queryInterface.addConstraint('MessageModels', {
      fields:  ['conversationId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'ConversationModels',
        field: 'id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })

    await queryInterface.addConstraint('PaymentModels', {
      fields:  ['userId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'UserModels',
        field: 'id',
      },
      onDelete: 'set null',
      onUpdate: 'cascade',
    })

    await queryInterface.addConstraint('PictureModels', {
      fields:  ['userId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'UserModels',
        field: 'id',
      },
      onDelete: 'set null',
      onUpdate: 'cascade',
    })

    await queryInterface.addConstraint('PostModels', {
      fields:  ['userId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'UserModels',
        field: 'id',
      },
      onDelete: 'set null',
      onUpdate: 'cascade',
    })

    await queryInterface.addConstraint('VideoChatModels', {
      fields:  ['createdById'],
      type: 'FOREIGN KEY',
      references: {
        table: 'UserModels',
        field: 'id',
      },
      onDelete: 'no action',
      onUpdate: 'cascade',
    })

    await queryInterface.addConstraint('VideoChatToUsers', {
      fields:  ['userId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'UserModels',
        field: 'id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    await queryInterface.addConstraint('VideoChatToUsers', {
      fields:  ['videoChatId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'VideoChatModels',
        field: 'id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    await queryInterface.addConstraint('VideoChatToUsers', {
      fields:  ['userId', 'videoChatId'],
      type: 'PRIMARY KEY',
    })

    await queryInterface.addConstraint('VideoModels', {
      fields:  ['userId'],
      type: 'FOREIGN KEY',
      references: {
        table: 'UserModels',
        field: 'id',
      },
      onDelete: 'set null',
      onUpdate: 'cascade',
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
