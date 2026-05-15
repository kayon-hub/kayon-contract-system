import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import os from "os";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
app.use(express.json({ limit: "10mb" }));

// ── POST /api/sign-contract ────────────────────────────────────────────────
// Receives quotation HTML, generates PDF, uploads to Google Drive, sends emails
app.post("/api/sign-contract", async (req, res) => {
  const { html, customerName, customerEmail, projectName } = req.body as {
    html: string;
    customerName: string;
    customerEmail: string;
    projectName: string;
  };

  if (!html) return res.status(400).json({ ok: false, error: "Missing html" });

  const timestamp = Date.now();
  const fileName = `合約_${customerName || "客戶"}_${timestamp}.pdf`;
  const tmpHtml = path.join(os.tmpdir(), `quote_${timestamp}.html`);
  const tmpPdf = path.join(os.tmpdir(), fileName);

  try {
    // 1. Write HTML to temp file
    fs.writeFileSync(tmpHtml, html, "utf8");

    // 2. Generate PDF via puppeteer
    const chromePath = process.env.PUPPETEER_EXECUTABLE_PATH ||
      "/home/ubuntu/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome";

    const { default: puppeteer } = await import("puppeteer");
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.pdf({ path: tmpPdf, format: "A4", printBackground: true });
    await browser.close();

    // 3. Upload to Google Drive via gws CLI
    let driveUrl = "";
    try {
      const driveJson = JSON.stringify({
        name: fileName,
        parents: ["1ZpESzgvo23nFdVoUEFN6N_S357vHSL-i"],
      });
      const { stdout } = await execAsync(
        `gws drive files create --upload "${tmpPdf}" --json '${driveJson}' --upload-content-type "application/pdf"`,
        { timeout: 30000 }
      );
      const result = JSON.parse(stdout);
      driveUrl = `https://drive.google.com/file/d/${result.id}/view`;
      console.log("[Drive] Uploaded:", driveUrl);
    } catch (e) {
      console.warn("[Drive] Upload failed (gws not configured):", e);
    }

    // 4. Send emails via nodemailer (SMTP stub — logs until SMTP is configured)
    const CONTRACTOR_EMAIL = "kayon@karbonxgaiaentertainment.com";
    const SMTP_HOST = process.env.SMTP_HOST;

    if (SMTP_HOST) {
      const { default: nodemailer } = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      const mailOpts = {
        from: process.env.SMTP_USER || CONTRACTOR_EMAIL,
        subject: `【合約已簽署】${projectName || "Podcast 製作"} — ${customerName}`,
        text: `${customerName} 已完成合約簽署。\n\nGoogle Drive: ${driveUrl}`,
        attachments: [{ filename: fileName, path: tmpPdf }],
      };
      await transporter.sendMail({ ...mailOpts, to: CONTRACTOR_EMAIL });
      if (customerEmail) {
        await transporter.sendMail({ ...mailOpts, to: customerEmail });
      }
      console.log("[Email] Sent to contractor and customer");
    } else {
      console.log("[Email STUB] Would send to:", CONTRACTOR_EMAIL, customerEmail || "(no customer email)");
      console.log("[Email STUB] Subject:", `【合約已簽署】${projectName} — ${customerName}`);
      console.log("[Email STUB] Drive URL:", driveUrl);
    }

    // Cleanup temp files
    try { fs.unlinkSync(tmpHtml); fs.unlinkSync(tmpPdf); } catch {}

    res.json({ ok: true, driveUrl });
  } catch (err: unknown) {
    console.error("[sign-contract] Error:", err);
    try { fs.unlinkSync(tmpHtml); } catch {}
    try { fs.unlinkSync(tmpPdf); } catch {}
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ── POST /api/notify-concern ───────────────────────────────────────────────
// Sends a concern notification email to the contractor/contact
app.post("/api/notify-concern", async (req, res) => {
  const { customerName, customerPhone, customerEmail } = req.body as {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
  };

  const CONTRACTOR_EMAIL = "kayon@karbonxgaiaentertainment.com";
  const SMTP_HOST = process.env.SMTP_HOST;
  const body = `客戶 ${customerName || "（未填寫）"} 對報價單有疑慮，請盡快與客戶聯絡。\n\n客戶電話：${customerPhone || "—"}\n客戶 Email：${customerEmail || "—"}`;

  if (SMTP_HOST) {
    try {
      const { default: nodemailer } = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: process.env.SMTP_USER || CONTRACTOR_EMAIL,
        to: CONTRACTOR_EMAIL,
        subject: `【合約疑慮通知】${customerName} 需要確認`,
        text: body,
      });
      console.log("[Email] Concern notification sent");
    } catch (e) {
      console.warn("[Email] Concern send failed:", e);
    }
  } else {
    console.log("[Email STUB] Concern notification:", body);
  }

  res.json({ ok: true });
});

// ── Static files ───────────────────────────────────────────────────────────
const staticPath =
  process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "public")
    : path.resolve(__dirname, "..", "dist", "public");

app.use(express.static(staticPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
