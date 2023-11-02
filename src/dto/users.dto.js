class UserDTO {
    constructor(user) {
      this.id = user._id;
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.email = user.email;
      this.role = user.role;
      this.birthDate = user.birthDate;
      this.documents = user.documents;
      this.lastConnection = user.lastConnection;
    }
  }

  class UserBriefDTO {
    constructor(user) {
      this.id = user._id;
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.email = user.email;
      this.role = user.role;
      this.birthDate = user.birthDate;
      this.lastConnection = user.lastConnection;
    }
  }
  
  export { UserDTO, UserBriefDTO };