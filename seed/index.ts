import mongoose from "mongoose";
import { AdminModel } from "../src/internals/adapters/admin/schema";
import { encrypt } from "../src/package/utils/encryption";
import { Environment } from "../src/package/configs/environment";

async function createSuperAdmin() {
  const environmentVariables = new Environment();
  await mongoose.connect(environmentVariables.mongoDBConnectionString);

  const plainPassword = environmentVariables.superAdminPassword;
  const hashedPassword = await encrypt(plainPassword);

  const exists = await AdminModel.findOne({ email: "super@admin.com" });
  if (exists) {
    console.log("Super admin already exists.");
    await mongoose.disconnect();
    return;
  }

  // Create admin
  const admin = new AdminModel({
    email: environmentVariables.superAdmin,
    password: hashedPassword,
    fullName: "GoldChain Support",
    roles: ["super"],
  });

  await admin.save();
  console.log("Super admin created!");

  await mongoose.disconnect();
}

createSuperAdmin().catch(console.error);
