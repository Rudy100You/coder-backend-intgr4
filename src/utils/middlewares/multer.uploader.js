import multer from "multer";
import { __src_dirname, pathJoin } from "../utils.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    switch (file.fieldname) {
      case "profilePicture":
        cb(null, pathJoin(__src_dirname, "public", "profiles"));
        break;
      case "productImage":
        cb(null, pathJoin(__src_dirname, "public", "products"));
        break;
      case "idCertificate":
      case "addressCertificate":
      case "accountStatusCertificate":
        cb(null, pathJoin(__src_dirname, "public", "documents"));
        break;
      default:
        cb(
          new Error(
            `Destination handling for file ${file.originalname} / field ${file.fieldname} is not or yet to be implemented`
          )
        );
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const handledUploadFields = [
  { name: "profilePicture" },
  { name: "productImage" },
  { name: "idCertificate" },
  { name: "addressCertificate" },
  { name: "accountStatusCertificate" },
];

export const requiredFileFieldsForUserUpdate =  ["idCertificate","addressCertificate","accountStatusCertificate"]
const uploader = multer({ storage });
export default uploader;
