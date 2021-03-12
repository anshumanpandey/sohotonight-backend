import sequelize from "../utils/DB";

import { DataTypes, Model, Optional } from "sequelize";


interface ChatMessahettributes {
  id: string,
  body: string,
  fromUser: string,
  toUserId: string,
}

interface ChatMessageCreationAttributes extends Optional<ChatMessahettributes, "id"> { }

interface ChatMessageInstance extends Model<ChatMessahettributes, ChatMessageCreationAttributes>, ChatMessahettributes { }

export const ChatMessage = sequelize.define<ChatMessageInstance>("ChatMessage", {
  // Model attributes are defined here
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
  },
  body: {
    type: DataTypes.STRING(2000),
    allowNull: false
  },
  fromUser: {
    type: DataTypes.STRING(2000),
    allowNull: false
  },
  toUserId: {
    type: DataTypes.STRING(2000),
    allowNull: false
  },
})