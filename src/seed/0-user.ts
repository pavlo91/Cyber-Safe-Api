import User, { UserType } from "../entities/user";
import Address from "../entities/address";

export const type = User;

export async function seed(connection: any, logger: any) {
  logger.verbose("Seeding users...");

  const users = [
    {
      type: UserType.Admin,
      email: "staff@wonderkiln.com",
      password: "password",
      firstName: "Admin",
      lastName: "Account",
      birthday: new Date(),
      phone: "+1 (313) 333-3333",
      address: {
        addressLine1: "Street Address",
        city: "City",
        state: "State",
        country: "Country",
        zipcode: "11111"
      },
      settings: {
        notifications: {
          email: true,
          phone: true
        }
      }
    }
  ];

  for (const user in users) {
    connection.manager.transaction(async (manager: any) => {
      const { address, password, ...userDetails } = users[user];
      const userInstance = manager.create(User, userDetails);
      await userInstance.setPassword(password);

      const addressInstance = await manager.save(manager.create(Address, address));

      userInstance.address = addressInstance;
      const savedUser = await manager.save(userInstance);

      logger.info(`CREATED USER: ${savedUser.firstName} ${savedUser.lastName}`);
    });
  }
}
