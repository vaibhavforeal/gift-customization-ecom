// Create an admin user interactively from the terminal.
// Run: npm run create:admin
// Then enter email + password when prompted.

import readline from "readline";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";

function ask(question: string, hidden = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  if (hidden) {
    // Mute output for password
    const stdout = process.stdout as any;
    rl.question(question, (answer) => {
      rl.close();
    });
    return new Promise((resolve) => {
      let pwd = "";
      process.stdin.setRawMode?.(true);
      process.stdin.resume();
      process.stdin.setEncoding("utf8");
      process.stdout.write(question);
      const onData = (ch: string) => {
        switch (ch) {
          case "\n":
          case "\r":
          case "\u0004": // Ctrl-D
            process.stdin.setRawMode?.(false);
            process.stdin.pause();
            process.stdout.write("\n");
            process.stdin.removeListener("data", onData);
            resolve(pwd);
            break;
          case "\u0003": // Ctrl-C
            process.exit();
            break;
          case "\u007f": // backspace
            pwd = pwd.slice(0, -1);
            break;
          default:
            pwd += ch;
            break;
        }
      };
      process.stdin.on("data", onData);
    });
  }
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const email = await ask("Admin email: ");
  if (!email || !email.includes("@")) {
    console.error("Invalid email");
    process.exit(1);
  }
  const name = await ask("Display name (optional): ");
  const password = await ask("Password (min 8 chars): ", true);
  if (password.length < 8) {
    console.error("Password too short");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await prisma.admin.findUnique({ where: { email } });

  if (existing) {
    await prisma.admin.update({
      where: { email },
      data: { passwordHash, name: name || existing.name },
    });
    console.log(`Updated password for existing admin: ${email}`);
  } else {
    await prisma.admin.create({
      data: { email, passwordHash, name: name || null },
    });
    console.log(`Created admin: ${email}`);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
