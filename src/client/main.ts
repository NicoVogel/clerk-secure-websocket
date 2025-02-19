import { Clerk } from "@clerk/clerk-js";

setupBackendTest();
setupClerk();

function setupBackendTest() {
  const backendTestDiv = document.getElementById("backend-test")!;
  backendTestDiv.innerHTML = `<button id="test-button">Test Backend</button><div id="test-result"></div>`;

  const testButton = document.getElementById("test-button")!;
  testButton.addEventListener("click", async () => {
    const response = await fetch("http://localhost:3000");
    const data = await response.text();
    const testResultDiv = document.getElementById("test-result")!;
    testResultDiv.innerHTML = data;
  });
}

async function setupClerk() {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!clerkPubKey) {
    throw new Error("Add your VITE_CLERK_PUBLISHABLE_KEY to the .env file");
  }

  const clerk = new Clerk(clerkPubKey);
  await clerk.load();

  if (clerk.user) {
    document.getElementById("login")!.innerHTML = `
    <div id="user-button"></div>
  `;

    const userButtonDiv = document.getElementById(
      "user-button"
    )! as HTMLDivElement;
    clerk.mountUserButton(userButtonDiv);
  } else {
    document.getElementById("login")!.innerHTML = `
    <div id="sign-in"></div>
  `;

    const signInDiv = document.getElementById("sign-in")! as HTMLDivElement;
    clerk.mountSignIn(signInDiv);
  }
}
