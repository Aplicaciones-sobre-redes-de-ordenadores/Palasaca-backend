// src/models/userModel.js
class User {
    constructor(name, email, id) {
        this.name = name;
        this.email = email;
        this.id = id;
    }

    toJSON() {
    return {
      name: this.name,
      email: this.email,
      id: this.id
    };
  }
}

module.exports = User;
