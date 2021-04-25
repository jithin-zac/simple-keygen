#! /usr/bin/env node

const inquirer = require("inquirer");
inquirer.registerPrompt("datepicker", require("inquirer-datepicker"));
const fs = require("fs");
const moment = require("moment");
const chalk = require("chalk");
const { createLicense } = require("../src/licenseController");

console.log(
  chalk.white(
    "\n   _____ _                 _        _  __                           \n  / ____(_)               | |      | |/ /                           \n | (___  _ _ __ ___  _ __ | | ___  | ' / ___ _   _  __ _  ___ _ __  \n  \\___ \\| | '_ ` _ \\| '_ \\| |/ _ \\ |  < / _ \\ | | |/ _` |/ _ \\ '_ \\ \n  ____) | | | | | | | |_) | |  __/ | . \\  __/ |_| | (_| |  __/ | | |\n |_____/|_|_| |_| |_| .__/|_|\\___| |_|\\_\\___|\\__, |\\__, |\\___|_| |_|\n                    | |                       __/ | __/ |           \n                    |_|                      |___/ |___/            \n"
  )
);
const question1 = {
  type: "input",
  name: "privateKeyPath",
  message:
    "Please enter the absolute path to your RSA privateKey that can be used to sign the license key",
};

const question2 = {
  type: "input",
  name: "licensee",
  message: "Please enter the name of the licensee",
};

// const question3 = {
//   type: "list",
//   name: "plan",
//   message: "Please choose the license plan",
//   choices: ["Standard", "Premium"],
// };

const question4 = {
  type: "datepicker",
  name: "startDate",
  message: "Please input a start date for the license (YYYY/MM/DD)",
  format: ["Y", "/", "MM", "/", "DD"],
};
const question5 = {
  type: "datepicker",
  name: "endDate",
  message: "Please input an end date for the license (YYYY/MM/DD)",
  format: ["Y", "/", "MM", "/", "DD"],
};
const question6 = {
  type: "list",
  name: "action",
  message: "Do you want to try again?",
  choices: ["Yes", "No"],
};
const question7 = {
  type: "input",
  name: "saveDir",
  message:
    "Enter the absolute path to directory where you want to save the license file",
};
const readKey = (privateKeyPath) => {
  return new Promise((resolve, reject) => {
    try {
      const key = fs.readFileSync(privateKeyPath, "utf-8");
      resolve(key);
    } catch (error) {
      console.log(chalk.red("Unable to read the key file!"));
      userAction();
      return;
    }
  });
};

const saveKey = (saveDir, licensee, licenseKey) => {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir);
      }
      fs.writeFileSync(`${saveDir}/${licensee}-ngtp-ui.key`, licenseKey);
      resolve(true);
    } catch (error) {
      console.log(error);
      console.log(chalk.red("Unable to save the key file!"));
      userAction();
      return;
    }
  });
};

const generateKey = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const { privateKeyPath } = await inquirer.prompt(question1);
      const privateKey = await readKey(privateKeyPath);
      const { licensee } = await inquirer.prompt(question2);
      // const { plan } = await inquirer.prompt(question3);
      const { startDate } = await inquirer.prompt(question4);
      const { endDate } = await inquirer.prompt(question5);

      if (!moment(endDate).isAfter(startDate, "day")) {
        console.log(
          chalk.red("Invalid dates. End date should be greater than start date")
        );
        userAction("keygen");
        return;
      }
      console.log(chalk.green("License key is being generated...."));
      const licenseKey = await createLicense(
        startDate,
        endDate,
        licensee,
        privateKey
      );

      const { saveDir } = await inquirer.prompt(question7);

      await saveKey(saveDir, licensee, licenseKey);

      console.log(
        chalk.white(
          `License key file "${licensee}.key" has been saved to the directory: ${saveDir}`
        )
      );
      resolve(licenseKey);
    } catch (e) {
      reject(e);
    }
  });
};

const userAction = () => {
  inquirer
    .prompt(question6)
    .then(async (answer) => {
      const { action } = answer;
      if (action === "Yes") {
        await generateKey();
        return;
      } else {
        console.log(chalk.green("Thank you!"));
        return;
      }
    })
    .catch((e) => {
      console.log(chalk.red("Something went wrong."));
      userAction();
      return;
    });
};

generateKey()
  .then(() => {})
  .catch((e) => {
    console.log(chalk.red("Something went wrong."));
    userAction();
    return;
  });
