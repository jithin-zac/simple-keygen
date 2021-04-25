const { generateLicenseKey, verifyKeyValidity } = require("./cryptoUtils");

const checklicense = async (licenseKey, publicKey) => {
  return new Promise(async (resolve, reject) => {
    try {
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

const createLicense = async (
  plan,
  startDate,
  endDate,
  licensee,
  privateKey
) => {
  return new Promise((resolve, reject) => {
    try {
      if (!plan || !startDate || !endDate || !licensee || !privateKey) {
        reject(new Error("Missing parameters"));
      }

      const payload = {
        licensee,
        startDate,
        endDate,
        plan,
      };

      console.log(payload);
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

module.exports = {
  createLicense,
  checklicense,
};
