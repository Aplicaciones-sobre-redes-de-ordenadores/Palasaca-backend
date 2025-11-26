// logService.js
const Parse = require("../config/parseConfig");
async function saveLog(action, user) {
  if (user != "unknown" && user != "user_unknown") {
    const User = Parse.Object.extend("Usuarios");
    const query = new Parse.Query(User);
    const userObj = await query.get(user, { useMasterKey: true });
    if (userObj.get("esAdmin")) return;
  }

  const Log = Parse.Object.extend("Logs");
  const entry = new Log();

  entry.set("action", action);
  entry.set("user", user);

  await entry.save(null, { useMasterKey: true });
}

module.exports = { saveLog };
