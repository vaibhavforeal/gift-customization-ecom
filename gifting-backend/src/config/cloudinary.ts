// Cloudinary client configured from env. Imported by the admin product
// route to upload images directly instead of saving to local disk.

import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
  secure: true, // always return https URLs
});

export { cloudinary };