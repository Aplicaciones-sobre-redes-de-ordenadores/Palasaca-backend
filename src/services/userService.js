const Parse = require("../config/parseConfig");
const bcrypt = require("bcrypt");
const UserModel = require("../models/userModel.js");

// Obtener todos los usuarios de BBDD:Usuarios
const getAllUsers = async () => {
  const User = Parse.Object.extend("Usuarios");
  const query = new Parse.Query(User);
  const results =  await query.find({ useMasterKey: true });

  return results.map(u => new UserModel(u.get("Nombre"),u.get("Correo")));
};

// Agregar usuario a la BBDD:Usuarios
const addUser = async ({ name, email, password }) => {
  const ParseUser = Parse.Object.extend("Usuarios");
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new ParseUser();

  user.set("Nombre", name);
  user.set("Correo", email);
  user.set("PassWord", hashedPassword);

  const savedUser = await user.save(null, { useMasterKey: true });
  return new UserModel(savedUser.get("Nombre"),savedUser.get("Correo"));

};

// Buscar usuario por email en la BBDD:Usuarios
const findUserByEmail = async (email) => {
  const User = Parse.Object.extend("Usuarios");
  const query = new Parse.Query(User);

  query.equalTo("Correo", email);

  try {
    const result = await query.first({ useMasterKey: true });
    if (result) {
      return new UserModel(result.get("Nombre"),result.get("Correo"));
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
};

// Actualizar nombre de usuario filtrando por objectId de la BBDD:Usuarios
const updateUser = async (objectId, newName) => {
  const User = Parse.Object.extend("Usuarios");
  const query = new Parse.Query(User);

  const user = await query.get(objectId, { useMasterKey: true });
  if (!user) throw new Error("User not found");

  user.set("Nombre", newName);
  await user.save(null,{ useMasterKey: true });

  return new UserModel(user.get("Nombre"), user.get("Correo"));
};

// Eliminar usuario usando su objectId en BBDD:Usuarios
const deleteUser = async (objectId) => {
  const User = Parse.Object.extend("Usuarios");
  const query = new Parse.Query(User);

  try {
    const user = await query.get(objectId, { useMasterKey: true });
    await user.destroy({ useMasterKey: true });
    return true;
  } catch (error) {
    throw error;
  }
};

//Obtener objectId si email y contraseña son correctos
const getUserObjectId = async (email, password) => {
  const ParseUser = Parse.Object.extend("Usuarios");
  const query = new Parse.Query(ParseUser);
  query.equalTo("Correo", email);

  const result = await query.first({ useMasterKey: true });
  if (!result) return null;

  const hashedPassword = result.get("PassWord");
  const isMatch = await bcrypt.compare(password, hashedPassword);

  if (!isMatch) return null;

  return result.id;
};

module.exports = {getUserObjectId, getAllUsers, addUser, findUserByEmail, updateUser, deleteUser };
