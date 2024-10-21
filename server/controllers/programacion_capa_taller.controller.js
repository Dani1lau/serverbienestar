import { ProgramacionCapaTaller } from "../models/programacion_capa_taller.model.js";
import nodemailer from "nodemailer";
import { dirname } from "path";
import { fileURLToPath } from "url";

class ProgramacionCapaTallerController {
  // Obtener programaciones por ficha
  static async getProgramacionesPorFicha(req, res) {
    try {
      const ficha = parseInt(req.params.ficha, 10);
      const cordinacion = req.params.cordinacion;

      if (!ficha || !cordinacion) {
        return res.status(400).json({ message: "Parámetros inválidos" });
      }

      // Llama al método del modelo
      const programaciones =
        await ProgramacionCapaTaller.getProgramacionPorFicha(
          ficha,
          cordinacion
        );

      // Filtrar duplicados basado en 'fecha_procaptall' y 'horaInicio_procaptall'
      const uniqueProgramaciones = programaciones.filter(
        (programacion, index, self) =>
          index ===
          self.findIndex(
            (p) =>
              p.fecha_procaptall === programacion.fecha_procaptall &&
              p.horaInicio_procaptall === programacion.horaInicio_procaptall
          )
      );

      res.status(200).json(uniqueProgramaciones);
    } catch (error) {
      console.error(
        `Error al obtener las programaciones por ficha (${req.params.ficha}):`,
        error
      );
      res.status(500).json({
        message: `Error al obtener las programaciones: ${error.message}`,
      });
    }
  }

  static async getProgramacionesPorSede(req, res) {
    const { sede } = req.params;
    try {
      const result = await ProgramacionCapaTaller.getProgramacionesBySede(sede);
      res.status(200).json(result);
    } catch (error) {
      console.error(
        `Error al obtener las programaciones por sede (${sede}): `,
        error
      );
      res
        .status(500)
        .json({ message: "Error al obtener las programaciones por sede" });
    }
  }

  // controller.js
  static async getProgramacionesCT(req, res) {
    try {
      const results = await ProgramacionCapaTaller.getProgramacionesCT();
      console.log(
        "Resultados del procedimiento:",
        JSON.stringify(results, null, 2)
      ); // Detalle de resultados

      // Convertir el objeto en un array
      const programacionesCT = Object.values(results[0]); // Asumiendo que el primer elemento es el objeto que contiene las programaciones

      if (Array.isArray(programacionesCT) && programacionesCT.length > 0) {
        res.status(200).json(programacionesCT);
      } else {
        res.status(404).json({ message: "No se encontraron programaciones." });
      }
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener las programaciones: " + error.message,
      });
    }
  }

  static async getProgramacionCT(req, res) {
    try {
      const id_procaptall = req.params.id;
      const programacionCT = await ProgramacionCapaTaller.getProgramacionCT(
        id_procaptall
      );
      if (programacionCT) {
        res.status(200).json(programacionCT);
      } else {
        res.status(404).json({ message: "Programacion no encontrada" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener la programacion" + error });
    }
  }

  static async putProgramacionCT(req, res) {
    try {
      const update_programacionCT = {
        sede_procaptall: req.body.sede_procaptall,
        descripcion_procaptall: req.body.descripcion_procaptall,
        ambiente_procaptall: req.body.ambiente_procaptall,
        fecha_procaptall: req.body.fecha_procaptall,
        horaInicio_procaptall: req.body.horaInicio_procaptall,
        horaFin_procaptall: req.body.horaFin_procaptall,
        nombreTaller: req.body.nombreTaller,
        nombreCapacitador: req.body.nombreCapacitador,
        numero_FichaFK: req.body.numero_FichaFK,
      };

      // Validación de datos
      for (const key in update_programacionCT) {
        if (!update_programacionCT[key]) {
          return res
            .status(400)
            .json({ message: "Todos los campos son obligatorios." });
        }
      }

      const id_procaptall = req.params.id;

      // Actualizar la programación
      await ProgramacionCapaTaller.updateProgramacionCT(
        id_procaptall,
        update_programacionCT
      );
      res.status(200).json({ message: "Programación actualizada con éxito" });
    } catch (error) {
      console.error(`Error al actualizar la programación: ${error.message}`);
      res.status(500).json({
        message: "Error al actualizar la programación: " + error.message,
      });
    }
  }


  static async postProgramacionCT(req, res) {
    const {
        sede_procaptall,
        descripcion_procaptall,
        ambiente_procaptall,
        fecha_procaptall,
        horaInicio_procaptall,
        horaFin_procaptall,
        nombreTaller,
        nombreCapacitador,
        numero_FichaFK,
        nombreInstructor,
    } = req.body;

    // Validar campos obligatorios
    if (
        !sede_procaptall ||
        !descripcion_procaptall ||
        !ambiente_procaptall ||
        !fecha_procaptall ||
        !horaInicio_procaptall ||
        !horaFin_procaptall ||
        !nombreTaller ||
        !nombreCapacitador ||
        !numero_FichaFK ||
        !nombreInstructor
    ) {
        return res.status(400).json({ message: "Todos los campos son requeridos." });
    }

    try {
        // Crear la programación
        const { success, correos } = await ProgramacionCapaTaller.createProgramacionCT({
            sede_procaptall,
            descripcion_procaptall,
            ambiente_procaptall,
            fecha_procaptall,
            horaInicio_procaptall,
            horaFin_procaptall,
            nombreTaller,
            nombreCapacitador,
            numero_FichaFK,
            nombreInstructor,
        });

        if (!success) {
            return res.status(500).json({ message: "Error al crear la programación." });
        }

        const { correoCapacitador, correoInstructor } = correos;

        // Verificar si se obtuvieron los correos
        if (!correoCapacitador || !correoInstructor) {
            return res.status(500).json({ message: "No se obtuvieron correos para enviar notificación." });
        }

        // Configurar el transporte de Nodemailer para Gmail
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER="soydanielra@gmail.com", 
                pass: process.env.GMAIL_PASS="abgo fbls snjb pmuj",
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);  

        // Configurar el contenido del correo
        const mailOptions = {
            from: process.env.GMAIL_USER="soydanielra@gmail.com", 
            to: [correoCapacitador, correoInstructor], 
            subject: "Nueva Programación de Taller",
            attachments: [
              {
                filename: "logo.png",
                path: __dirname + "/../assets/images/logo.png",
                cid: "logoSena",
              },
              {
                filename: "Logo de Bienestar.png",
                path: __dirname + "/../assets/images/Logo de Bienestar.png",
                cid: "logoBienestar",
              },
            ],
            html: `
              <html>
                <head>
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                      margin: 0;
                      padding: 0;
                      background-color: #f4f4f4;
                    }
                    .container {
                      width: 100%;
                      max-width: 600px;
                      margin: auto;
                      background-color: #ffffff;
                      border-radius: 10px;
                      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                      background-color: #4CAF50;
                      padding: 20px;
                      text-align: center;
                      color: white;
                      border-radius: 10px 10px 0 0;
                    }
                    .header img {
                      width: 100px;
                    }
                    .content {
                      padding: 20px;
                    }
                    .content h2 {
                      color: #4CAF50;
                    }
                    .details {
                      margin: 20px 0;
                      padding: 10px;
                      border: 1px solid #ccc;
                      border-radius: 5px;
                      background-color: #f9f9f9;
                    }
                    .footer {
                      padding: 20px;
                      text-align: center;
                      font-size: 12px;
                      color: #777;
                    }
                    .logo-bienestar {
                      margin-top: 20px;
                      width: 150px;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <img src="cid:logoSena" alt="Logo Sena" style="border-radius:100%">
                      <p><h1>${nombreTaller}</h1></p>
                    </div>
                    <div class="content">
                      <h2>Información del Taller</h2>
                      <div class="details">
                        <p><strong>Sede:</strong> ${sede_procaptall}</p>
                        <p><strong>Ambiente en el que se realizara:</strong> ${ambiente_procaptall}</p>
                        <p><strong>Ficha:</strong> ${numero_FichaFK}</p>
                        <p><strong>Instructor a Cargo:</strong> ${nombreInstructor}</p>
                        <p><strong>Profesional a cargo del taller:</strong> ${nombreCapacitador}</p>
                        <p><strong>Fecha:</strong> ${fecha_procaptall}</p>
                        <p><strong>Hora de inicio y fin:</strong> ${horaInicio_procaptall}/${horaFin_procaptall}</p>
                        <p><strong>Detalles del Taller:</strong> ${descripcion_procaptall}</p>
                      </div>
                    </div>
                    <div class="footer">
                      <img src="cid:logoBienestar" class="logo-bienestar" alt="Logo de Bienestar">
                      <p>&copy; ${new Date().getFullYear()} SENA. Todos los derechos reservados.</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          };

        // Enviar el correo
        await transporter.sendMail(mailOptions);

        // Respuesta exitosa
        res.status(201).json({ message: "Programación creada y correos enviados." });
    } catch (error) {
        console.error("Error al crear la programación o enviar correos:", error);
        res.status(500).json({ message: "Error al crear la programación o enviar correos: " + error.message });
    }
}



  static async deleteProgramacionCT(req, res) {
    try {
      const { id_procaptall } = req.params;
      console.log("id_procaptall:", id_procaptall);
      const result = await ProgramacionCapaTaller.eliminarProgramacionCT(
        id_procaptall
      );
      if (result) {
        res
          .status(200)
          .json({ message: "Programacion eliminada exitosamente" });
      } else {
        res.status(404).json({ message: "Programacion no encontrada" });
      }
    } catch (error) {
      console.error(`Error al eliminar la programacion: ${error.message}`);
      res.status(500).json({ message: "Error al eliminar la programacion" });
    }
  }
}

export default ProgramacionCapaTallerController;
