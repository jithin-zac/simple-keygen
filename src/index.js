const { createLicense, checklicense } = require("./licenseController");

export class simpleKeygen {
  publicKey = "";
  constructor(publicKey) {
    this.publicKey = publicKey;
  }

  verifyLicense = async (licensekey) => {
    return checklicense(licensekey, this.publicKey);
  };
}
