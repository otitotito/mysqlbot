const { getConnection } = require("../config/dbConfig");

async function handlePenerimaan() {
  const query = `
      
    `;
  const connection = await getConnection();

  try {
    const result = await connection.execute(query);
    const rows = result.rows; // Ambil baris hasil query

    if (rows.length > 0) {
      // Format hasil dengan label dan pemisah yang diinginkan
      const formattedResult = rows
        .map((row) => `• ${row[0]} - ${row[1]}, Netto: ${row[2]}`)
        .join("\n");
      return formattedResult;
    } else {
      return "Tidak ada data yang ditemukan.";
    }
  } catch (error) {
    console.error("Error menjalankan query penerimaan:", error);
    return "Terjadi kesalahan saat mengambil data.";
  } finally {
    await connection.close();
  }
}

module.exports = handlePenerimaan;
