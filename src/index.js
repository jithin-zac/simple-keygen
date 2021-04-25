const { checkLicense } = require("./licenseController");

module.exports = class SimpleKeygen {
  publicKeyPath = "";
  constructor(publicKeyPath) {
    this.publicKeyPath = publicKeyPath;
  }

  verifyLicense = async (licensekey) => {
    return checkLicense(licensekey, this.publicKeyPath);
  };
};

keygen
  .verifyLicense("your license key")
  .then((status) => {
    console.log(status);
  })
  .catch((error) => {
    console.log(error);
  });
