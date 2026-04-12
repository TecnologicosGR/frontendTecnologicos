import { companyService } from '../../company/services/company.service';

export async function printTicketReceipt(ticket, customPrice = 'Por diagnosticar') {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  // Write a "Loading..." state to the window synchronously so the user knows it's doing something
  printWindow.document.write('<html><body style="font-family:sans-serif; text-align:center; padding-top:50px;">Generando ticket PDF...</body></html>');
  
  let company = {};
  try {
    company = await companyService.getConfig();
  } catch (error) {
    console.error("No se pudo cargar la info de la empresa para el ticket", error);
  }

  const clientName = ticket.nombre_cliente || ticket.nombres || 'Cliente';

  const htmlContent = `
    <html>
      <head>
        <title>Ticket de Recepción #${ticket.id}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; margin: 0; padding: 20px; font-size: 14px; color: #000; }
          .ticket-wrapper { max-width: 400px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
          .logo { max-width: 120px; max-height: 80px; margin-bottom: 10px; }
          .title { font-weight: bold; font-size: 18px; text-transform: uppercase; }
          .subtitle { font-size: 12px; margin: 2px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .label { font-weight: bold; }
          .value { text-align: right; }
          .section-title { font-weight: bold; margin-top: 15px; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 8px;}
          .paragraph { margin: 5px 0; }
          .legal { font-size: 10px; text-align: center; margin-top: 25px; border-top: 2px dashed #000; padding-top: 10px; font-style: italic;}
          .barcode { text-align: center; margin-top: 15px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="ticket-wrapper">
          <div class="header">
            ${company.url_logo ? '<img src="' + company.url_logo + '" class="logo" alt="Logo Empresa" />' : ''}
            <div class="title">${company.nombre_empresa || 'TECNOLÓGICOS GR'}</div>
            ${company.nit_rut ? '<div class="subtitle">NIT/RUT: ' + company.nit_rut + '</div>' : ''}
            ${company.telefonos ? '<div class="subtitle">Tel: ' + company.telefonos + '</div>' : ''}
            ${company.direccion ? '<div class="subtitle">' + company.direccion + '</div>' : ''}
            <br/>
            <div class="subtitle" style="font-weight:bold; font-size: 14px;">ORDEN DE INGRESO #${ticket.id}</div>
            <div class="subtitle">Fecha de Recepción: ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="row">
            <span class="label">Cliente:</span>
            <span class="value">${clientName}</span>
          </div>
          
          <div class="section-title">EQUIPO</div>
          <div class="row">
            <span class="label">Tipo:</span>
            <span class="value">${ticket.tipo_dispositivo || 'Dispositivo'}</span>
          </div>
          <div class="row">
            <span class="label">Marca/Modelo:</span>
            <span class="value">${ticket.marca_modelo || 'Generico'}</span>
          </div>

          <div class="section-title">DETALLES DE INGRESO</div>
          <p class="paragraph"><strong>Motivo:</strong> ${ticket.motivo_ingreso || 'No especificado'}</p>
          <p class="paragraph"><strong>Estado físico:</strong> ${ticket.estado_fisico_entrada || 'No especificado'}</p>
          <p class="paragraph"><strong>Accesorios:</strong> ${ticket.cables_accesorios || 'Ninguno'}</p>
          
          <div class="row" style="margin-top: 5px; border-bottom: 1px dotted #ccc; padding-bottom: 10px;">
             <!-- Campos de costo eliminados -->
          </div>

          <div class="legal">
            <strong>NOTAS IMPORTANTES:</strong><br/>
            Para retirar el equipo es indispensable presentar este comprobante o ID.<br/><br/>
            <b style="font-size: 11px; text-transform: uppercase;">TODO ARTÍCULO ABANDONADO DESPUÉS DE 3 MESES NO NOS HACEMOS RESPONSABLES.</b>
          </div>
          
          <div class="barcode">
            Código Seguimiento Web: <br/><strong>${ticket.token_rastreo || ticket.id}</strong>
          </div>
        </div>
        <script>
          window.onload = function() { setTimeout(function(){ window.print(); }, 200); }
        </script>
      </body>
    </html>
  `;
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
