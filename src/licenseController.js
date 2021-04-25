const fs = require("fs");
const {
  generateLicenseKey,
  verifyKeyValidity,
  verifylicenseKey,
} = require("./cryptoUtils");

const checkLicense = async (licenseKey, publicKeyPath) => {
  return new Promise(async (resolve, reject) => {
    try {
      const publicKey = await readKey(publicKeyPath);
      if (!licenseKey) {
        resolve({ valid: false, status: "KEY_NOT_FOUND" });
      }

      const keyData = await verifylicenseKey(licenseKey, publicKey);

      if (keyData.status) {
        const keyStatus = await verifyKeyValidity(keyData.payload);
        resolve(keyStatus);
      } else {
        resolve({ valid: false, status: "INVALID_KEY" });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const createLicense = async (startDate, endDate, licensee, privateKey) => {
  return new Promise((resolve, reject) => {
    try {
      if (!startDate || !endDate || !licensee || !privateKey) {
        reject(new Error("Missing parameters"));
      }

      const payload = {
        licensee,
        startDate,
        endDate,
      };
      const licenseKey = generateLicenseKey(
        JSON.stringify(payload),
        privateKey
      );

      resolve(licenseKey);
    } catch (error) {
      reject(error);
    }
  });
};

const readKey = (publicKeyPath) => {
  return new Promise((resolve, reject) => {
    try {
      const key = fs.readFileSync(publicKeyPath, "utf-8");
      resolve(key);
    } catch (error) {
      console.log(error);
      reject(new Error("Unable to read the key file!"));
    }
  });
};

module.exports = {
  createLicense,
  checkLicense,
};
