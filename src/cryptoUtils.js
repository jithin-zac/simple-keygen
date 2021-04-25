const Crypto = require("crypto");

const generateLicenseKey = (payload, privateKey) => {
  // Create a RSA signer
  const signer = Crypto.createSign("rsa-sha256");
  signer.update(payload);

  // Encode the original data
  const encoded = Buffer.from(payload).toString("base64");

  // Generate a signature for the data
  const signature = signer.sign(privateKey, "hex");

  // Combine the encoded data and signature to create a license key
  const licenseKey = `${encoded}:${signature}`;

  return licenseKey;
};

const verifylicenseKey = (licenseKey, publicKey) => {
  // Split the license key's data and the signature
  const [encoded, signature] = licenseKey.split(":");
  if (!encoded || !signature) {
    return { status: false, payload: "INVALID_KEY" };
  }
  const data = Buffer.from(encoded, "base64").toString();

  // Create an RSA verifier
  const verifier = Crypto.createVerify("RSA-SHA256");
  verifier.update(data);

  // Verify the signature for the data using the public key
  const isValid = verifier.verify(publicKey, signature, "hex");
  if (isValid) {
    const payload = JSON.parse(data);
    return { status: true, payload };
  } else {
    return { status: false, payload: "INVALID_KEY" };
  }
};

const verifyKeyValidity = (licenseData) => {
  const timeStamp = moment().toDate();
  if (moment(timeStamp).isBefore(licenseData.startDate, "day")) {
    return { valid: false, status: "INACTIVE_KEY" };
  } else if (moment(timeStamp).isAfter(licenseData.endDate, "day")) {
    return { valid: false, status: "EXPIRED_KEY" };
  } else {
    const end = moment(licenseData.endDate);
    const { plan, licensee } = licenseData;
    const validity = end.diff(timeStamp, "days");
    return { valid: true, status: "SUCCESS", validity, plan, licensee };
  }
};

module.exports = {
  verifylicenseKey,
  generateLicenseKey,
  verifyKeyValidity,
};
