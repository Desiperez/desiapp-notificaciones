const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Aquí Render leerá la llave maestra que descargamos de Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Esta es la "puerta" por donde tu Google Sheets avisará que hay un mensaje
app.post('/enviar', async (req, res) => {
  const { token, titulo, mensaje } = req.body;

  if (!token || !titulo || !mensaje) {
    return res.status(400).send({ error: "Faltan datos" });
  }

  try {
    const payload = {
      // ⚠️ CAMBIO CLAVE: Usamos 'data' en lugar de 'notification' 
      // para que Android no lo bloquee en segundo plano.
      data: {
        titulo: titulo,
        mensaje: mensaje
      },
      token: token,
      // 🚀 Prioridad máxima para despertar al celular de inmediato
      android: {
        priority: "high"
      }
    };

    // Le decimos a Firebase que envíe el paquete de datos directo a tu código en Android
    const response = await admin.messaging().send(payload);
    res.status(200).send({ success: true, response });
  } catch (error) {
    console.error("Error enviando:", error);
    res.status(500).send({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 10000; // Render suele usar el 10000 por defecto
app.listen(PORT, () => {
  console.log(`Servidor de DesiApp corriendo en el puerto ${PORT}`);
});
