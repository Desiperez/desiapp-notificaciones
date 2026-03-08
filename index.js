const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

app.post('/enviar', async (req, res) => {
  // 🔥 AHORA RECIBIMOS LA FOTO TAMBIÉN
  const { token, titulo, mensaje, foto } = req.body;

  if (!token || !titulo || !mensaje) return res.status(400).send({ error: "Faltan datos" });

  try {
    const payload = {
      data: {
        titulo: titulo,
        mensaje: mensaje,
        foto: foto || "" // 🔥 LA PASAMOS A ANDROID
      },
      token: token,
      android: { priority: "high" }
    };

    const response = await admin.messaging().send(payload);
    res.status(200).send({ success: true, response });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => { console.log(`Servidor de DesiApp en puerto ${PORT}`); });
