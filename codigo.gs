// *** CONFIGURACIÓN ***
const SPREADSHEET_ID = "1DambsPPqwHzGq7FkTb2KRC2bIDFe_QoalX0K_8ysUSM";
const CLIENTES_SHEET = "Clientes";
const COTIZACIONES_SHEET = "Cotizaciones";

// *** FUNCIONES CRUD ***
// Obtener clientes
function obtenerClientes() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const hoja = spreadsheet.getSheetByName(CLIENTES_SHEET);
    if (!hoja) {
      Logger.log("La hoja '" + CLIENTES_SHEET + "' no se encontró.");
      return [];
    }
    return hoja.getDataRange().getValues();
  } catch (error) {
    Logger.log("Error al obtener clientes: " + error.message);
    return [];
  }
}

// Obtener cliente por ID
function obtenerClientePorId(clienteId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const hojaClientes = ss.getSheetByName("Clientes");
    if (!hojaClientes) {
      throw new Error("La hoja 'Clientes' no se encontró.");
    }
    // Obtener todos los datos de la hoja
    const datos = hojaClientes.getDataRange().getValues();
    const encabezados = datos[0]; // Primera fila son los encabezados
    // Mapear los índices de las columnas por nombre
    const idIndex = encabezados.indexOf("ID");
    const nombreIndex = encabezados.indexOf("Nombre");
    const contactoIndex = encabezados.indexOf("Contacto");
    const direccionIndex = encabezados.indexOf("Dirección");
    const emailIndex = encabezados.indexOf("Email");
    const ciudadIndex = encabezados.indexOf("Ciudad");
    const empresaIndex = encabezados.indexOf("Empresa");
    const tipoEmpresaIndex = encabezados.indexOf("Tipo Empresa");
    const notasIndex = encabezados.indexOf("Notas"); // Nuevo índice para notas

    // Buscar el cliente por ID
    const clienteIdBuscado = String(clienteId);
    for (let i = 1; i < datos.length; i++) {
      const idEnFila = String(datos[i][idIndex]);
      if (idEnFila === clienteIdBuscado) {
        return {
          id: idEnFila || '',
          nombre: datos[i][nombreIndex] || '',
          contacto: datos[i][contactoIndex] || '', // Usar "contacto" en lugar de "telefono"
          direccion: datos[i][direccionIndex] || '',
          email: datos[i][emailIndex] || '',
          ciudad: datos[i][ciudadIndex] || '', // Incluir ciudad
          empresa: datos[i][empresaIndex] || '', // Usar "empresa" en lugar de "nombreEmpresa"
          tipoEmpresa: datos[i][tipoEmpresaIndex] || '',
          notas: datos[i][notasIndex] || '' // Incluir notas
        };
      }
    }
    // Si no se encuentra el cliente
    return null;
  } catch (error) {
    Logger.log("Error al obtener cliente: " + error.message);
    throw new Error(error.message);
  }
}

function obtenerTodasLasCotizaciones() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const hojaCotizaciones = ss.getSheetByName("Cotizaciones");
    const hojaClientes = ss.getSheetByName("Clientes");

    if (!hojaCotizaciones || !hojaClientes) {
      throw new Error("No se encontraron las hojas necesarias.");
    }

    // Obtener datos
    const datosCotizaciones = hojaCotizaciones.getDataRange().getValues();
    const datosClientes = hojaClientes.getDataRange().getValues();

    // Mapear índices de columnas
    const idCotizacionIndex = 0; // ID_Cotización
    const idClienteIndex = 2; // ID_Cliente en Cotizaciones
    const fechaIndex = 1; // Fecha
    const totalIndex = 7; // Total

    const idClienteClientesIndex = 0; // ID en Clientes
    const nombreClienteIndex = 1; // Nombre en Clientes
    const empresaClienteIndex = 6; // Empresa en Clientes

    let resultados = [];

    // Recorrer cotizaciones (excluyendo encabezados)
    datosCotizaciones.slice(1).forEach(cotizacion => {
      // Buscar cliente asociado
      const cliente = datosClientes.filter(cliente => cliente[idClienteClientesIndex] === cotizacion[idClienteIndex])[0];

      if (cliente) {
        resultados.push({
          idCotizacion: cotizacion[idCotizacionIndex],
          fecha: cotizacion[fechaIndex],
          cliente: cliente[nombreClienteIndex],
          empresa: cliente[empresaClienteIndex],
          total: cotizacion[totalIndex]
        });
      }
    });

    Logger.log("Resultados: " + JSON.stringify(resultados));
    return resultados;
  } catch (error) {
    Logger.log("Error: " + error.message);
    throw new Error(error.message);
  }
}

// Agregar un nuevo cliente
function nuevoCliente(nombre, telefono, direccion, email, ciudad, nombreEmpresa, tipoEmpresa, notas) {
  try {
    if (!nombre || !telefono || !direccion || !email || !ciudad || !nombreEmpresa || !tipoEmpresa) {
      return "Todos los campos son obligatorios.";
    }
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(CLIENTES_SHEET);
    if (!sheet) {
      return "Error: No se encontró la hoja de clientes.";
    }
    const id = sheet.getLastRow(); // Usar el número de fila como ID
    sheet.appendRow([id, nombre, telefono, direccion, email, ciudad, nombreEmpresa, tipoEmpresa, notas]);
    return "Cliente agregado exitosamente.";
  } catch (error) {
    Logger.log("Error al agregar cliente: " + error.message);
    return "Ocurrió un error al agregar el cliente.";
  }
}

// Eliminar un cliente
function eliminarCliente(clienteId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const hoja = spreadsheet.getSheetByName(CLIENTES_SHEET);
    if (!hoja) {
      return "Error: No se encontró la hoja de clientes.";
    }
    const valores = hoja.getDataRange().getValues();
    for (let i = 1; i < valores.length; i++) {
      if (valores[i][0] == clienteId) {
        hoja.deleteRow(i + 1);
        return "Cliente eliminado exitosamente.";
      }
    }
    return "No se encontró el cliente.";
  } catch (error) {
    Logger.log("Error al eliminar cliente: " + error.message);
    return "Ocurrió un error al eliminar el cliente.";
  }
}

// Buscar clientes por término (ID, nombre o empresa)
function buscarClientesPorTermino(termino) {
  try {
    const clientes = obtenerClientes();
    const encabezados = clientes[0];
    const idIndex = encabezados.indexOf("ID");
    const nombreIndex = encabezados.indexOf("Nombre");
    const empresaIndex = encabezados.indexOf("Empresa");

    return clientes.slice(1).filter(fila => {
      const id = String(fila[idIndex]); // Convertir ID a string
      const nombre = String(fila[nombreIndex]).toLowerCase();
      const empresa = String(fila[empresaIndex]).toLowerCase();
      const term = termino.toLowerCase();
      return id.includes(term) || nombre.includes(term) || empresa.includes(term);
    }).map(fila => ({
      id: fila[idIndex],
      nombre: fila[nombreIndex],
      empresa: fila[empresaIndex]
    }));
  } catch (error) {
    Logger.log("Error en búsqueda: " + error.message);
    return [];
  }
}

// Actualizar un cliente
function editarCliente(id, nombre, contacto, direccion, email, ciudad, empresa, tipoEmpresa, notas) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const hojaClientes = ss.getSheetByName("Clientes");
    if (!hojaClientes) {
      throw new Error("La hoja 'Clientes' no se encontró.");
    }
    const datos = hojaClientes.getDataRange().getValues();
    for (let i = 1; i < datos.length; i++) {
      if (String(datos[i][0]) === String(id)) {
        hojaClientes.getRange(i + 1, 2).setValue(nombre);
        hojaClientes.getRange(i + 1, 3).setValue(contacto);
        hojaClientes.getRange(i + 1, 4).setValue(direccion);
        hojaClientes.getRange(i + 1, 5).setValue(email);
        hojaClientes.getRange(i + 1, 6).setValue(ciudad); // Actualizar ciudad
        hojaClientes.getRange(i + 1, 7).setValue(empresa); // Actualizar empresa
        hojaClientes.getRange(i + 1, 8).setValue(tipoEmpresa); // Actualizar tipo de empresa
        hojaClientes.getRange(i + 1, 9).setValue(notas); // Actualizar notas
        return "Cliente actualizado exitosamente.";
      }
    }
    return "Error: No se encontró el cliente.";
  } catch (error) {
    Logger.log("Error al actualizar cliente: " + error.message);
    throw new Error(error.message);
  }
}

function nuevaCotizacion(clienteId, items, descuento = 0, formaPago = "Contado") {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const cotizacionesSheet = ss.getSheetByName("Cotizaciones");
    const itemsSheet = ss.getSheetByName("Cotizaciones_detalle");

    // Obtener datos del cliente
    const cliente = obtenerClientePorId(clienteId);
    if (!cliente) throw new Error("Cliente no encontrado");

    // Generar ID único para la cotización
    const idCotizacion = "COT-" + Utilities.getUuid().split("-")[0];

    // Calcular totales
    let subtotal = items.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
    subtotal = parseFloat(subtotal.toFixed(2)); // Redondear subtotal a 2 decimales

    const iva = parseFloat((subtotal * 0.13).toFixed(2)); // Calcular IVA y redondear a 2 decimales
    const total = parseFloat((subtotal + iva - descuento).toFixed(2)); // Calcular total y redondear a 2 decimales

    // Formatear la fecha
    const fechaFormateada = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

    // Guardar en "Cotizaciones"
    cotizacionesSheet.appendRow([
      idCotizacion,
      fechaFormateada,
      cliente.id,
      formaPago,
      subtotal.toFixed(2),
      descuento.toFixed(2),
      iva.toFixed(2),
      total.toFixed(2)
    ]);

    // Guardar items en "Items" (optimizado)
    const rows = items.map(item => [
      idCotizacion,
      item.producto,
      item.cantidad,
      item.precio,
      item.observaciones.replace(/\n/g, " | "),
      parseFloat((item.cantidad * item.precio).toFixed(2)) // Total del ítem redondeado a 2 decimales
    ]);

    const ultimaFila = itemsSheet.getLastRow() + 1;
    itemsSheet.getRange(ultimaFila, 1, rows.length, rows[0].length).setValues(rows);

    // Generar PDF automáticamente
    const pdfUrl = generarPDF(idCotizacion);
    return `✅ Cotización guardada. ID: ${idCotizacion}. PDF: ${pdfUrl}`;
  } catch (error) {
    Logger.log(error);
    throw new Error(error.message);
  }
}

// Generar PDF
function generarPDF(idCotizacion) {
  try {
    // Cargar el archivo HTML como plantilla
    const template = HtmlService.createTemplateFromFile("CotizacionTemplate");

    // Buscar la cotización por ID
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const cotizacionesSheet = ss.getSheetByName("Cotizaciones");
    const detallesSheet = ss.getSheetByName("Cotizaciones_detalle");
    const cotizacionData = cotizacionesSheet.getDataRange().getValues();
    const cotizacion = cotizacionData.find(row => row[0] === idCotizacion);
    if (!cotizacion) {
      throw new Error("Cotización no encontrada.");
    }

    // Convertir los valores a números
    const subtotal = parseFloat(cotizacion[4]) || 0; // Subtotal (columna 5)
    const descuento = parseFloat(cotizacion[5]) || 0; // Descuento (columna 6)
    const iva = parseFloat(cotizacion[6]) || 0; // IVA (columna 7)
    const total = parseFloat(cotizacion[7]) || 0; // Total (columna 8)

    // Obtener el nombre del cliente usando el ID
    const clienteId = cotizacion[2]; // ID_Cliente (columna 3)
    const cliente = obtenerClientePorId(clienteId); // Función para obtener datos del cliente
    if (!cliente) {
      throw new Error("Cliente no encontrado.");
    }

    // Obtener los detalles de los items
    const detallesData = detallesSheet.getDataRange().getValues();
    const detalles = detallesData.filter(row => row[0] === idCotizacion);

    // Pasar los datos al template
    template.idCotizacion = idCotizacion;
    template.cliente = cliente;
    template.fecha = Utilities.formatDate(new Date(cotizacion[1]), Session.getScriptTimeZone(), "dd/MM/yyyy");
    template.ciudad = cliente.ciudad || "N/A"; // Ciudad del cliente
    template.formaPago = cotizacion[3]; // Forma de pago (columna 4)
    template.descuento = descuento;
    template.subtotal = subtotal;
    template.iva = iva;
    template.total = total;
    template.items = detalles.map((detalle, index) => ({
      numero: index + 1,
      descripcion: detalle[1], // Producto (columna 2)
      cantidad: detalle[2], // Cantidad (columna 3)
      precioUnitario: parseFloat(detalle[3]), // Precio unitario (columna 4)
      observaciones: detalle[4], // Observaciones (columna 5)
      total: parseFloat(detalle[5]) // Total (columna 6)
    }));

    // Evaluar el template y obtener el HTML final
    const htmlContent = template.evaluate().getContent();

    // Guardar el archivo HTML temporalmente
    const folder = DriveApp.getFolderById("1Qjxz3wXvyQU65_H-tTUOnCzxyRIIJVAi"); // Usa el ID de tu carpeta
    const tempHtmlFile = folder.createFile(`${idCotizacion}_temp.html`, htmlContent, MimeType.HTML);

    // Convertir el archivo HTML a PDF con márgenes personalizados
    const pdfBlob = tempHtmlFile.getAs(MimeType.PDF).setName(`${idCotizacion}_Cotizacion.pdf`);
    const pdfFile = folder.createFile(pdfBlob);

    // Eliminar el archivo HTML temporal
    tempHtmlFile.setTrashed(true);
    Logger.log("PDF generado: " + pdfFile.getUrl());
    return pdfFile.getUrl(); // Devuelve la URL del PDF
  } catch (error) {
    Logger.log("Error al generar PDF: " + error.message);
    throw new Error(error.message);
  }
}



// *** INTERFAZ WEB ***
function doGet() {
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .setTitle("Sistema de Cotizaciones")
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0");
}
