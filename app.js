require("dotenv").config();
const { getConnection } = require("./config/dbConfig");
const {
  makeWASocket,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const qrcode = require("qrcode-terminal");

const registeredNumbers = JSON.parse(process.env.REGISTERED_NUMBERS);

// respon
const handlePenerimaan = require("./handlers/handlerPenerimaan");

async function connectWhatsapp() {
  const auth = await useMultiFileAuthState("session");
  const socket = makeWASocket({
    printQRInTerminal: true,
    browser: ["mysqlbot", "", ""],
    auth: auth.state,
    logger: pino({ level: "silent" }),
  });

  socket.ev.on("creds.update", auth.saveCreds);

  socket.ev.on("connection.update", async ({ connection, qr }) => {
    if (connection === "open") {
      console.log("BOT WHATSAPP SUDAH SIAP✅ -- BY RNA!");
    } else if (connection === "close") {
      console.log("Koneksi terputus, mencoba untuk menyambung kembali...");
      await connectWhatsapp();
    }
  });

  socket.ev.on("messages.upsert", async ({ messages }) => {
    const chat = messages[0];
    const number = chat.key.remoteJid.split("@")[0];
    const sender = chat.pushName || "Tidak Diketahui";
    const pesan =
      (
        chat.message?.extendedTextMessage?.text ??
        chat.message?.ephemeralMessage?.message?.extendedTextMessage?.text ??
        chat.message?.conversation
      )?.toLowerCase() || "";

    if (chat.key.fromMe) return;

    if (!registeredNumbers.includes(number)) {
      console.log(
        `Nomor ${number} tidak diizinkan. Pesan tidak akan diproses.`
      );
      return;
    }

    console.log("Nomor pengguna:", number);
    console.log("Nama pengirim:", sender);
    console.log("Pesan:", pesan);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    let response;

    if (pesan.includes("penerimaan")) {
      response = await handlePenerimaan();
    } else if (pesan.includes("penerimaan.wilayah")) {
      const wilayah = pesan.split("per wilayah")[1].trim();
      response = await handlePenerimaanPerWilayah(wilayah);
    } else {
      response =
        "Halo, selamat datang di XXX!\n\n" +
        "Masukkan kata kunci di bawah ini:\n" +
        "1. penerimaan\n" +
        "2. xxxx\n" +
        "3. xxx";
    }

    if (typeof response !== "string") {
      response = JSON.stringify(response);
    }

    try {
      await socket.sendMessage(
        chat.key.remoteJid,
        { text: response },
        { quoted: chat }
      );
    } catch (error) {
      console.error("Error dalam proses pesan:", error);
    }
  });
}

// Mulai koneksi WhatsApp
connectWhatsapp().catch(console.error);
