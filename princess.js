const puppeteer = require("puppeteer");
const fs = require("fs"); 

// Function to generate a random string of 6 characters and numbers
function generateRandomEmail() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  return randomString + "@example.com"; 
}

(async () => {
  console.log("Princess is starting...");

  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
    );

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const resourceType = request.resourceType();
      if (
        resourceType === "image" ||
        resourceType === "font" ||
        resourceType === "stylesheet"
      ) {
        request.abort(); // Block images, fonts, and CSS
      } else {
        request.continue();
      }
    });

    // Navigate to the target website
    await page.goto("https://example.com", {
      waitUntil: "networkidle2",
      timeout: 120000,
    });


    await page.waitForSelector("div.popCard", { timeout: 30000 });

    // Generate a random email and log it
    const randomEmail = generateRandomEmail();
    console.log("Princess generated the email:", randomEmail);

    // Fill the email input field with the generated random email
    await page.type("#PolarisTextField1", randomEmail);

    console.log("Princess entered the email:", randomEmail);

    await page.keyboard.press("Enter");
    console.log("Princess pressed Enter!");

    await page.waitForSelector("p.mt-4.textColor.c-white.f-1-2", {
      visible: true,
      timeout: 60000,
    });

    await page.waitForSelector("p.f-1-5.c-black.w-100", {
      visible: true,
      timeout: 60000,
    });

    const [initialText, generatedText] = await page.evaluate(() => {
      const initialElement = document.querySelector(
        "p.mt-4.textColor.c-white.f-1-2"
      );
      const generatedElement = document.querySelector("p.f-1-5.c-black.w-100");
      return [
        initialElement ? initialElement.textContent.trim() : "No content found",
        generatedElement
          ? generatedElement.textContent.trim()
          : "No content found",
      ];
    });

    const logData = `${initialText} : ${generatedText}`;

    // Log the content to the console
    console.log(logData);

    console.log("Current working directory:", process.cwd());

    try {
      fs.appendFileSync("list.txt", logData + "\n");
      console.log("Data has been written to list.txt");
    } catch (err) {
      console.error("Error writing to file", err);
    }

    // Close the browser
    await browser.close();
    console.log("Princess has finished the task.");
  } catch (error) {
    console.error("Error during automation:", error);
  }
})();
