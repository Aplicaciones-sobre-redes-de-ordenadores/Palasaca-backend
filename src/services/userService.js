const Parse = require("../config/parseConfig");
const bcrypt = require("bcrypt");

const getAllUsers = async () => {
  const User = Parse.Object.extend("Usuarios");
  const query = new Parse.Query(User);
  return await query.find({ useMasterKey: true });
};

const addUser = async ({ userId, name, email, password }) => {
  const User = Parse.Object.extend("Usuarios");
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User();

  user.set("id_usuario", userId);
  user.set("Nombre", name);
  user.set("Correo", email);
  user.set("PassWord", hashedPassword);

  return await user.save(null, { useMasterKey: true });
};

const findUserByEmail = async (email) => {
  const User = Parse.Object.extend("Usuarios");
  const query = new Parse.Query(User);

  query.equalTo("Correo", email);

  try {
    const result = await query.first({ useMasterKey: true });
    if (result) {
      console.log("User found:", result.toJSON());
      return result;
    } else {
      console.log("No user found with that email");
      return null;
    }
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
};

const updateUser = async (objectId, newName) => {
  const User = Parse.Object.extend("Usuarios");
  const query = new Parse.Query(User);

  const user = await query.get(objectId, { useMasterKey: true });
  if (!user) throw new Error("User not found");

  user.set("Nombre", newName);
  await user.save(null,{ useMasterKey: true });
  console.log("User updated:", user.toJSON());
  return user;
};

const deleteUser = async (objectId) => {
  const User = Parse.Object.extend("Usuarios");
  const query = new Parse.Query(User);

  try {
    const user = await query.get(objectId, { useMasterKey: true });
    await user.destroy({ useMasterKey: true });
    console.log("User deleted");
    return true;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
};

module.exports = { getAllUsers, addUser, findUserByEmail, updateUser, deleteUser };
