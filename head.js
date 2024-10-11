let mealPlans = [];
let guestData = [];
let total = 0;

// Generar formulario de huéspedes dinámico
document
  .getElementById("generateGuestFormButton")
  .addEventListener("click", function () {
    const guestCount = document.getElementById("guestCount").value;
    const guestFormContainer = document.getElementById("guestFormContainer");
    guestFormContainer.innerHTML = ""; // Limpiar el contenedor

    for (let i = 1; i <= guestCount; i++) {
      const guestFormHTML = `
            <h3>Huésped ${i}</h3>
            <label for="docType${i}">Tipo de Documento:</label>
             <select id="docType${i}" required>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="PS">Pasaporte</option>
                    <option value="RC">Registro Civil</option>
                </select>
            
            <label for="docNumber${i}">Número de Documento:</label>
            <input type="text" id="docNumber${i}" >

            <label for="firstName${i}">Nombre:</label>
            <input type="text" id="firstName${i}" >

            <label for="lastName${i}">Apellido:</label>
            <input type="text" id="lastName${i}" >

            <label for="birthDate${i}">Fecha de Nacimiento:</label>
            <input type="date" id="birthDate${i}" >

            <label for="age${i}">Edad:</label>
            <input type="number" id="age${i}" readonly>
        `;
      guestFormContainer.innerHTML += guestFormHTML;
    }
  });

// Calcular edad automáticamente
document
  .getElementById("generatetypePlanFormButton")
  .addEventListener("change", function (e) {
    if (e.target && e.target.type === "date") {
      const guestId = e.target.id.replace("birthDate", "");
      const birthDate = new Date(e.target.value);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      document.getElementById(`age${guestId}`).value = age;
    }
  });

// Calcular noches basadas en fechas de entrada y salida
function calculateNights() {
  const checkInDate = new Date(document.getElementById("checkIn").value);
  const checkOutDate = new Date(document.getElementById("checkOut").value);

  if (checkInDate && checkOutDate && checkOutDate > checkInDate) {
    const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(timeDifference / (1000 * 3600 * 24));

    document.getElementById("nightsCount").textContent = `Noches: ${nights}`;
    return nights;
  } else {
    document.getElementById("nightsCount").textContent =
      "Selecciona fechas válidas.";
    return 0;
  }
}

document.getElementById("checkIn").addEventListener("change", calculateNights);
document.getElementById("checkOut").addEventListener("change", calculateNights);

// Mostrar modal para agregar plan de alimentación por día
document
  .getElementById("openModalButton")
  .addEventListener("click", function () {
    const nights = calculateNights();

    if (nights > 0) {
      const mealPlanContainer = document.getElementById("mealPlanContainer");
      mealPlanContainer.innerHTML = ""; // Limpiar el contenedor

      for (let i = 1; i <= nights; i++) {
        const mealPlanHTML = `
                <label for="mealPlanDay${i}">Día ${i}:</label>
                <select id="mealPlanDay${i}" required>
                    <option value="0">Solo alojamiento</option>
                    <option value="50">Desayuno</option>
                    <option value="100">Desayuno y Cena</option>
                    <option value="150">Desayuno, almuerzo y Cena</option>
                </select>
            `;
        mealPlanContainer.innerHTML += mealPlanHTML;
      }

      document.getElementById("modal").style.display = "block";
    } else {
      alert(
        "Por favor selecciona las fechas de entrada y salida antes de agregar el plan de alimentación."
      );
    }
  });

// Agregar el plan de alimentación por día
document
  .getElementById("addMealPlan")
  .addEventListener("click", function () {
    const nights = calculateNights();
    mealPlans = [];

    for (let i = 1; i <= nights; i++) {
      const mealPlanValue = parseFloat(
        document.getElementById(`mealPlanDay${i}`).value
      );
      mealPlans.push(mealPlanValue);
    }

    document.getElementById("modal").style.display = "none";
    const accommodationCost = parseFloat(
      document.getElementById("accommodation").value
    );
    const guestCount = parseInt(document.getElementById("guestCount").value);
    if (accommodationCost && nights > 0) {
      const accommodationTotal = accommodationCost * nights;
      const mealPlanTotal = mealPlans.reduce((acc, val) => acc + val, 0);
      total = (accommodationTotal + mealPlanTotal) * guestCount;

      document.getElementById(
        "totalCost"
      ).innerText = `Tarifa Total: $${total}`;
    } else {
      alert("Por favor completa todos los campos correctamente.");
    }
  });

// Guardar los datos en Excel
document
  .getElementById("saveExcelButton")
  .addEventListener("click", function () {
    const guestCount = document.getElementById("guestCount").value;
    const nights = calculateNights(); // Calcular noches antes de usar

    if (nights === 0) {
      alert("Por favor selecciona fechas válidas antes de guardar.");
      return;
    }

    let data = [
      [
        "Tipo de Documento",
        "Número de Documento",
        "Nombre",
        "Apellido",
        "Fecha de Nacimiento",
        "Edad",
        "Acomodación",
        "Noches",
        "Costo Total Alojamiento",
        ...Array.from({ length: nights }, (_, i) => `Día ${i + 1}`),
      ],
    ];

    for (let i = 1; i <= guestCount; i++) {
      const docType = document.getElementById(`docType${i}`).value;
      const docNumber = document.getElementById(`docNumber${i}`).value;
      const firstName = document.getElementById(`firstName${i}`).value;
      const lastName = document.getElementById(`lastName${i}`).value;
      const birthDate = document.getElementById(`birthDate${i}`).value;
      const age = document.getElementById(`age${i}`).value;

      const accommodationSelectValue = parseInt(
        document.getElementById("accommodation").value
      );
      let accommodationValue = "";
      if (accommodationSelectValue === 50) {
        accommodationValue = "Doble";
      } else if (accommodationSelectValue === 100) {
        accommodationValue = "Triple";
      } else if (accommodationSelectValue === 150) {
        accommodationValue = "Cuádruple";
      }

      const accommodationTotal = total;

      const row = [
        docType,
        docNumber,
        firstName,
        lastName,
        birthDate,
        age,
        accommodationValue,
        nights,
        accommodationTotal,
      ];

      // Añadir plan de alimentación por cada día
      mealPlans.forEach((mealPlan, index) => {
        let mealDescription = "";
        if (mealPlan === 0) {
          mealDescription = "Solo alojamiento";
        } else if (mealPlan === 50) {
          mealDescription = "Desayuno";
        } else if (mealPlan === 100) {
          mealDescription = "Desayuno y Cena";
        } else if (mealPlan === 150) {
          mealDescription = "Desayuno, Almuerzo y Cena";
        }

        row.push(`$${mealPlan + accommodationSelectValue} - Plan: ${mealDescription}`);
      });

        data.push(row);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Alojamiento");
    XLSX.writeFile(workbook, "alojamiento.xlsx");
});

// Botón para guardar el PDF
document.getElementById("savePdfButton").addEventListener("click", function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const guestCount = document.getElementById("guestCount").value;
  const nights = calculateNights(); // Asegúrate de que las noches estén calculadas

  if (nights === 0) {
      alert("Por favor selecciona fechas válidas antes de guardar el PDF.");
      return;
  }

  let pdfContent = "Informe de Huéspedes\n\n";
  pdfContent += "Total de Huéspedes: " + guestCount + "\n";
  pdfContent += "Noches: " + nights + "\n\n";
  pdfContent += "Detalles de Huéspedes:\n\n";

  for (let i = 1; i <= guestCount; i++) {
      const docType = document.getElementById(`docType${i}`).value;
      const docNumber = document.getElementById(`docNumber${i}`).value;
      const firstName = document.getElementById(`firstName${i}`).value;
      const lastName = document.getElementById(`lastName${i}`).value;
      const birthDate = document.getElementById(`birthDate${i}`).value;
      const age = document.getElementById(`age${i}`).value;

      pdfContent += `Huésped ${i}:\n`;
      pdfContent += `Tipo de Documento: ${docType}\n`;
      pdfContent += `Número de Documento: ${docNumber}\n`;
      pdfContent += `Nombre: ${firstName}\n`;
      pdfContent += `Apellido: ${lastName}\n`;
      pdfContent += `Fecha de Nacimiento: ${birthDate}\n`;
      pdfContent += `Edad: ${age}\n\n`;
  }

  // Añadir información de precios
  const accommodationTotal = total; // Reutiliza el total calculado
  pdfContent += `Costo Total Alojamiento: $${accommodationTotal}\n`;

  // Añadir planes de alimentación
  pdfContent += "Plan de Alimentación:\n";
  mealPlans.forEach((mealPlan, index) => {
      pdfContent += `Día ${index + 1}: ${mealPlan === 0 ? "Solo alojamiento" : mealPlan === 50 ? "Desayuno" : mealPlan === 100 ? "Desayuno y Cena" : "Desayuno, Almuerzo y Cena"}\n`;
  });

  doc.text(pdfContent, 10, 10);
  doc.save("informe_huespedes.pdf");
});

// Cerrar el modal
document.querySelector(".close").addEventListener("click", function () {
  document.getElementById("modal").style.display = "none";
});
















