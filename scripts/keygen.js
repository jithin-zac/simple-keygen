#! /usr/bin/env node

const inquirer = require("inquirer");
inquirer.registerPrompt("datepicker", require("inquirer-datepicker"));
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const chalk = require("chalk");
const { authenticate, createLicense } = require("../src/licenseController");

// console.log(
//   '"\n█▄░█ █▀▀ ▀█▀ █▀█ ▄▄ █░█ █   █▄▀ █▀▀ █▄█ █▀▀ █▀▀ █▄░█\n█░▀█ █▄█ ░█░ █▀▀ ░░ █▄█ █   █░█ ██▄ ░█░ █▄█ ██▄ █░▀█"'
// );
console.log(
  chalk.green(
    "\n  _   _  _____ _______ _____        _    _ _____   _  __           _____            \n | \\ | |/ ____|__   __|  __ \\      | |  | |_   _| | |/ /          / ____|           \n |  \\| | |  __   | |  | |__) |_____| |  | | | |   | ' / ___ _   _| |  __  ___ _ __  \n | . ` | | |_ |  | |  |  ___/______| |  | | | |   |  < / _ \\ | | | | |_ |/ _ \\ '_ \\ \n | |\\  | |__| |  | |  | |          | |__| |_| |_  | . \\  __/ |_| | |__| |  __/ | | |\n |_| \\_|\\_____|  |_|  |_|           \\____/|_____| |_|\\_\\___|\\__, |\\_____|\\___|_| |_|\n                                                             __/ |                  \n                                                            |___/                   \n"
  )
);
const question1 = {
  type: "input",
  name: "privateKey",
  message:
    "Please enter the privateKey that can be used to genearte the license key",
};

const question2 = {
  type: "input",
  name: "licensee",
  message: "Please enter the name of the licensee",
};

const question3 = {
  type: "list",
  name: "plan",
  message: "Please choose the license plan",
  choices: ["Standard", "Premium"],
};

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

// const start = () => {
//   inquirer
//     .prompt(question1)
//     .then(async (answer) => {
//       const { passcode } = answer;
//       const response = await authenticate(passcode);
//       if (response) {
//         console.log(chalk.green("Authenticated!"));
//         await generateKey();
//         console.log(chalk.green("Thank you!"));
//       }
//       return;
//     })
//     .catch((e) => {
//       if (e.message === "EMPTY") {
//         console.log(chalk.red("Authentication failed. Empty passcode!"));
//         userAction("auth");
//       } else if (e.message === "INCORRECT") {
//         console.log(chalk.red("Authentication failed. Incorrect passcode!"));
//         userAction("auth");
//       } else {
//         console.log(
//           chalk.red(
//             "Something went wrong. Please make sure your are connected to internet/VPN"
//           )
//         );
//       }
//     });
// };

const generateKey = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const { privateKey } = await inquirer.prompt(question1);
      const { licensee } = await inquirer.prompt(question2);
      const { plan } = await inquirer.prompt(question3);
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
        plan,
        startDate,
        endDate,
        licensee,
        privateKey
      );

      const licensePath = path.join(__dirname, "../ngtp-ui-generated-licenses");

      if (!fs.existsSync(licensePath)) {
        fs.mkdirSync(licensePath);
      }
      fs.writeFileSync(
        `${path.join(
          __dirname,
          "../ngtp-ui-generated-licenses"
        )}/${licensee}-${plan}-ngtp-ui.key`,
        licenseKey
      );
      console.log(
        chalk.white(
          `License key file "${licensee}-${plan}-ngtp-ui.key" has been saved to the directory: ${licensePath}`
        )
      );
      resolve(licenseKey);
    } catch (e) {
      reject(e);
    }
  });
};

const userAction = (step) => {
  inquirer
    .prompt(question6)
    .then(async (answer) => {
      const { action } = answer;
      if (action === "Yes") {
        if (step === "keygen") {
          await generateKey();
          return;
        } else if (step === "auth") {
          start();
          return;
        } else {
          return;
        }
      } else {
        console.log(chalk.green("Thank you!"));
        return;
      }
    })
    .catch((e) => {
      console.log(
        chalk.red(
          "Something went wrong. Please make sure your are connected to internet/VPN"
        )
      );
    });
};

generateKey();
