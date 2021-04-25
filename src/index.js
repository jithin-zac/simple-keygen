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
