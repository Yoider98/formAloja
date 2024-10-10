let mealPlans = [];
let guestData = [];

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
                    <option value="CC">Cedula de Ciudadania</option>
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
  .getElementById("guestFormContainer")
  .addEventListener("change", function (e) {
    if (e.target && e.target.type === "date") {
      const guestId = e.target.id.replace("birthDate", "");
      const birthDate = new Date(e.target.value);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      document.getElementById(`age${guestId}`).value = age;
    }
  });

// Mostrar modal para agregar plan de alimentación por día
document
  .getElementById("openModalButton")
  .addEventListener("click", function () {
    const nights = document.getElementById("nights").value;

    if (nights && nights > 0) {
      const mealPlanContainer = document.getElementById("mealPlanContainer");
      mealPlanContainer.innerHTML = ""; // Limpiar el contenedor

      for (let i = 1; i <= nights; i++) {
        const mealPlanHTML = `
                <label for="mealPlanDay${i}">Día ${i}:</label>
                <select id="mealPlanDay${i}" required>
                    <option value="0">solo alojamiento</option>
                    <option value="50">solo desayuno</option>
                    <option value="100">Desayuno y Cena</option>
                    <option value="150">Desayuno, almuerzo y Cena</option>
                </select>
            `;
        mealPlanContainer.innerHTML += mealPlanHTML;
      }

      document.getElementById("modal").style.display = "block";
    } else {
      alert(
        "Por favor ingrese la cantidad de noches antes de agregar el plan de alimentación."
      );
    }
  });

// Agregar el plan de alimentación por día
document.getElementById("addMealPlan").addEventListener("click", function () {
  const nights = document.getElementById("nights").value;
  mealPlans = [];

  for (let i = 1; i <= nights; i++) {
    const mealPlanValue = parseFloat(
      document.getElementById(`mealPlanDay${i}`).value
    );
    mealPlans.push(mealPlanValue);
  }

  document.getElementById("modal").style.display = "none";
  alert("Plan de alimentación agregado para todos los días.");
});

// Calcular la tarifa total
document
  .getElementById("calculateButton")
  .addEventListener("click", function () {
   
    const accommodationCost = parseFloat(
      document.getElementById("accommodation").value
    );
    const peoplenumer = parseInt(
        document.getElementById("guestCount").value
      );
      console.log("# personas: ",peoplenumer )
    const nights = parseInt(document.getElementById("nights").value);
    if (accommodationCost && nights) {
      const accommodationTotal = accommodationCost * nights;
      const mealPlanTotal = mealPlans.reduce((acc, val) => acc + val, 0);
      const total = (accommodationTotal + mealPlanTotal)* peoplenumer;

      document.getElementById(
        "totalCost"
      ).innerText = `Tarifa Total: $${total}`;
    } else {
      alert("Por favor complete todos los campos.");
    }
  });

// Guardar los datos en Excel
document
  .getElementById("saveExcelButton")
  .addEventListener("click", function () {
    const guestCount = document.getElementById("guestCount").value;
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
      ],
    ];

    for (let i = 1; i <= guestCount; i++) {
      const docType = document.getElementById(`docType${i}`).value;
      const docNumber = document.getElementById(`docNumber${i}`).value;
      const firstName = document.getElementById(`firstName${i}`).value;
      const lastName = document.getElementById(`lastName${i}`).value;
      const birthDate = document.getElementById(`birthDate${i}`).value;
      const age = document.getElementById(`age${i}`).value;

      const accommodationSelectValue =
        document.getElementById("accommodation").value;

      if (accommodationSelectValue === "50") {
        accommodationValue = "Doble";
      } else if (accommodationSelectValue === "100") {
        accommodationValue = "Triple";
      } else if (accommodationSelectValue === "150") {
        accommodationValue = "Cuadruple";
      }

      const nights = document.getElementById("nights").value;

      const row = [
        docType,
        docNumber,
        firstName,
        lastName,
        birthDate,
        age,
        accommodationValue,
        nights,
      ];

      mealPlans.forEach((mealPlan, index) => {
        let mealDescription = "";
        if (mealPlan === 0) {
          mealDescription = "Solo alojamiento";
        } else if (mealPlan === 50) {
          mealDescription = "Desayuno";
        } else if (mealPlan === 100) {
          mealDescription = "Desayuno y Cena";
        } else if (mealPlan === 150) {
          mealDescription = "Desayuno, almuerzo y Cena"; 
        }

       
        row.push(
          `Día ${index + 1}: $${mealPlan} | Alimentación: ${mealDescription}`
        );
      });

      data.push(row);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Alojamiento");
    // Guardar el archivo Excel
    XLSX.writeFile(workbook, "alojamiento.xlsx");
  });

// Modal functionality
const modal = document.getElementById("modal");
const span = document.getElementsByClassName("close")[0];

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
