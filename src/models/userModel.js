// src/models/userModel.js
class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }

    toJSON() {
    return {
      name: this.name,
      email: this.email
    };
  }
}

module.exports = User;
